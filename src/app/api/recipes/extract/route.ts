import { NextResponse } from "next/server";

function validateUrl(raw: string): string {
  const parsed = new URL(raw);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported");
  }
  return parsed.href;
}

const RECIPE_EXTRACTION_PROMPT = `Extract a structured recipe from the following content. Return ONLY valid JSON with this exact structure (no markdown, no code fences):
{
  "title": "Recipe title",
  "description": "Brief description",
  "ingredients": [{"name": "ingredient name", "quantity": 2, "unit": "cups"}],
  "steps": ["Step 1 text", "Step 2 text"],
  "tags": ["dinner", "quick"],
  "prep_time_minutes": 15,
  "cook_time_minutes": 30,
  "servings": 4,
  "image_url": "https://example.com/photo.jpg or null"
}

Rules:
- quantity should be a number or null
- unit should be a string like "cups", "tbsp", "oz", "lbs", or null for items like "2 eggs"
- tags should be lowercase, practical categories (dinner, lunch, snack, kids, quick, meal-prep, dessert, vegetarian, etc.)
- For a family with young kids (toddler and baby), add "kid-friendly" tag if the recipe seems suitable for small children
- If you can't determine a value, use null
- steps should be clear, concise instructions
- image_url should be the main photo URL of the recipe if available, or null
- Do NOT include any text outside the JSON object`;

export async function POST(request: Request) {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "No Claude API key configured. Add CLAUDE_API_KEY to .env.local" },
      { status: 400 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const { url, image, mode } = body;

  try {
    let content: string | undefined;
    const sourceType: string = mode;
    const sourceUrl: string | null = url || null;

    let ogImage: string | null = null;

    if (mode === "url") {
      const { text, extractedOgImage } = await extractFromUrl(url);
      content = text;
      ogImage = extractedOgImage;
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

    // Use og:image as fallback if Claude didn't extract one
    if (!recipe.image_url && ogImage) {
      recipe.image_url = ogImage;
    }

    return NextResponse.json({
      recipe: { ...recipe, source_type: sourceType, source_url: sourceUrl },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function extractFromUrl(url: string): Promise<{ text: string; extractedOgImage: string | null }> {
  const validatedUrl = validateUrl(url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let res: Response;
  try {
    res = await fetch(validatedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FamilyPlanner/1.0; recipe extraction)",
      },
    });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) throw new Error("Could not fetch URL");

  const html = await res.text();

  // Extract og:image for fallback
  const ogImageMatch = html.match(
    /<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i
  );
  const extractedOgImage = ogImageMatch?.[1] ?? null;

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
          return { text: `JSON-LD Recipe Data:\n${JSON.stringify(recipes, null, 2)}`, extractedOgImage };
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

  return { text: `Web page content from ${url}:\n${text}`, extractedOgImage };
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
  const validatedUrl = validateUrl(url);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  let res: Response;
  try {
    res = await fetch(validatedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; FamilyPlanner/1.0; recipe extraction)",
      },
    });
  } finally {
    clearTimeout(timeout);
  }

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
