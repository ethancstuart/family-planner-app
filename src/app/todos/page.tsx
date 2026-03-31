import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { createFamilyClient, FAMILY_HOUSEHOLD_ID, FAMILY_USER_ID } from "@/lib/supabase/family";
import type { TodoList, TodoItem } from "@/types";

export const metadata: Metadata = { title: "To-Dos" };

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function TodosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = createFamilyClient();
  const householdId = FAMILY_HOUSEHOLD_ID;

  const { data: lists } = await supabase
    .from("todo_lists")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  const listIds = (lists ?? []).map((l) => l.id);

  const allItems = listIds.length > 0
    ? await supabase
        .from("todo_items")
        .select("*")
        .in("todo_list_id", listIds)
        .order("created_at")
        .then(({ data }) => (data as TodoItem[]) ?? [])
    : ([] as TodoItem[]);

  // For the family version, we use a simple members list
  const members = [
    { id: FAMILY_USER_ID, email: "family@stuarts.local", full_name: "Family", avatar_url: null, created_at: "" },
  ];

  return (
    <AppShell>
      <TodoPageClient
        lists={(lists as TodoList[]) ?? []}
        allItems={allItems}
        members={members}
        householdId={householdId}
        currentUserId={FAMILY_USER_ID}
        filter={params.filter}
      />
    </AppShell>
  );
}

// Client wrapper to handle state
import { TodoPageClient } from "@/components/todos/todo-page-client";
