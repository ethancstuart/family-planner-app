import type { Metadata } from "next";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { RecipeDetail } from "@/components/recipes/recipe-detail";

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

const getRecipe = cache(async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .single();
  return data;
});

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipe(id);
  return { title: recipe?.title ?? "Recipe" };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const recipe = await getRecipe(id);

  if (!recipe) notFound();

  return (
    <AppShell user={user}>
      <RecipeDetail recipe={recipe} />
    </AppShell>
  );
}
