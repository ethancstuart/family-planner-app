import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const RECIPE_EXTRACTION_PROMPT = `Extract a structured recipe from the following content. Return ONLY valid JSON with this exact structure (no markdown, no code fences):
{
  "title": "Recipe title",
  "description": "Brief description",
  "ingredients": [{"name": "ingredient name", "quantity": 2, "unit": "cups"}],
  "steps": ["Step 1 text", "Step 2 text"],
  "tags": ["dinner", "quick"],
  "prep_time_minutes": 15,
  "cook_time_minutes": 30,
  "servings": 4
}

Rules:
- quantity should be a number or null
- unit should be a string like "cups", "tbsp", "oz", "lbs", or null for items like "2 eggs"
- tags should be lowercase, practical categories (dinner, lunch, snack, kids, quick, meal-prep, dessert, vegetarian, etc.)
- If you can't determine a value, use null
- steps should be clear, concise instructions
- Do NOT include any text outside the JSON object`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get household's Claude API key
  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) {
    return NextResponse.json({ error: "No household found" }, { status: 400 });
  }

  const { data: settings } = await supabase
    .from("household_settings")
    .select("claude_api_key_encrypted")
    .eq("household_id", membership.household_id)
    .single();

  const apiKey = settings?.claude_api_key_encrypted;
  if (!apiKey) {
    return NextResponse.json(
      { error: "No Claude API key configured. Add one in Settings." },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { url, image, mode } = body;

  try {
    let content: string | undefined;
    let sourceType: string = mode;
    let sourceUrl: string | null = url || null;

    if (mode === "url") {
      content = await extractFromUrl(url);
    } else if (mode === "video") {
      content = await extractFromVideo(url);
    } else if (mode === "image" && image) {
      const recipe = await extractFromImage(image, apiKey);
      return NextResponse.json({
        recipe: { ...recipe, source_type: "image", source_url: null },
      });
    } else {
      return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json(
        { error: "Could not extract content from the provided source" },
        { status: 400 }
      );
    }

    // Send to Claude for structured extraction
    const recipe = await extractWithClaude(content, apiKey);

    return NextResponse.json({
      recipe: { ...recipe, source_type: sourceType, source_url: sourceUrl },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function extractFromUrl(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; FamilyPlanner/1.0; recipe extraction)",
    },
  });

  if (!res.ok) throw new Error("Could not fetch URL");

  const html = await res.text();

  // Try JSON-LD first (most recipe sites use this)
  const jsonLdMatch = html.match(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  );

  if (jsonLdMatch) {
    for (const match of jsonLdMatch) {
      const jsonStr = match
        .replace(/<script[^>]*>/i, "")
        .replace(/<\/script>/i, "");
      try {
        const data = JSON.parse(jsonStr);
        const recipes = findRecipeInJsonLd(data);
        if (recipes) {
          return `JSON-LD Recipe Data:\n${JSON.stringify(recipes, null, 2)}`;
        }
      } catch {
        continue;
      }
    }
  }

  // Fallback: strip HTML and send raw text to Claude
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);

  return `Web page content from ${url}:\n${text}`;
}

function findRecipeInJsonLd(data: unknown): unknown | null {
  if (Array.isArray(data)) {
    for (const item of data) {
      const found = findRecipeInJsonLd(item);
      if (found) return found;
    }
  } else if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (
      obj["@type"] === "Recipe" ||
      (Array.isArray(obj["@type"]) && obj["@type"].includes("Recipe"))
    ) {
      return obj;
    }
    if (obj["@graph"] && Array.isArray(obj["@graph"])) {
      return findRecipeInJsonLd(obj["@graph"]);
    }
  }
  return null;
}

async function extractFromVideo(url: string): Promise<string> {
  // For video URLs, we pass the URL to Claude and ask it to work with
  // whatever metadata/description is available from the page
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; FamilyPlanner/1.0; recipe extraction)",
    },
  });

  if (!res.ok) throw new Error("Could not fetch video page");

  const html = await res.text();

  // Extract meta tags, title, and description
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(
    /<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i
  );
  const ogDescMatch = html.match(
    /<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i
  );

  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 8000);

  return [
    `Video page from: ${url}`,
    titleMatch ? `Title: ${titleMatch[1].trim()}` : "",
    descMatch ? `Description: ${descMatch[1]}` : "",
    ogDescMatch ? `OG Description: ${ogDescMatch[1]}` : "",
    `Page content: ${text}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function extractWithClaude(
  content: string,
  apiKey: string
): Promise<Record<string, unknown>> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `${RECIPE_EXTRACTION_PROMPT}\n\nContent to extract from:\n${content}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Claude API error");
  }

  const data = await res.json();
  const text = data.content[0]?.text;

  if (!text) throw new Error("No response from Claude");

  // Parse the JSON response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse recipe from Claude response");

  return JSON.parse(jsonMatch[0]);
}

async function extractFromImage(
  base64Image: string,
  apiKey: string
): Promise<Record<string, unknown>> {
  // Extract the media type and base64 data
  const match = base64Image.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data");

  const [, mediaType, base64Data] = match;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Data,
              },
            },
            {
              type: "text",
              text: RECIPE_EXTRACTION_PROMPT + "\n\nExtract the recipe from this image.",
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Claude API error");
  }

  const data = await res.json();
  const text = data.content[0]?.text;

  if (!text) throw new Error("No response from Claude");

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse recipe from image");

  return JSON.parse(jsonMatch[0]);
}
