import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { GroceryListView } from "@/components/grocery/grocery-list-view";
import type { GroceryItem } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: list } = await supabase
    .from("grocery_lists")
    .select("title")
    .eq("id", id)
    .single();
  return { title: list?.title ?? "Grocery List" };
}

export default async function GroceryListPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: list } = await supabase
    .from("grocery_lists")
    .select("*")
    .eq("id", id)
    .single();

  if (!list) notFound();

  const { data: items } = await supabase
    .from("grocery_items")
    .select("*")
    .eq("grocery_list_id", id)
    .order("created_at");

  return (
    <AppShell user={user}>
      <GroceryListView
        list={list}
        initialItems={(items as GroceryItem[]) ?? []}
      />
    </AppShell>
  );
}
