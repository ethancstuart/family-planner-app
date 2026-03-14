import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import type { TodoList, TodoItem, User } from "@/types";

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function TodosPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/");

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (!membership) redirect("/dashboard/onboarding");

  const householdId = membership.household_id;

  // Round 1: fetch lists and members in parallel (both depend only on householdId)
  const [{ data: lists }, { data: memberData }] = await Promise.all([
    supabase
      .from("todo_lists")
      .select("*")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false }),
    supabase
      .from("household_members")
      .select("user_id")
      .eq("household_id", householdId),
  ]);

  const listIds = (lists ?? []).map((l) => l.id);
  const memberIds = (memberData ?? []).map((m) => m.user_id);

  // Round 2: fetch items and profiles in parallel (depend on round 1 results)
  const [allItems, members] = await Promise.all([
    listIds.length > 0
      ? supabase
          .from("todo_items")
          .select("*")
          .in("todo_list_id", listIds)
          .order("created_at")
          .then(({ data }) => (data as TodoItem[]) ?? [])
      : Promise.resolve([] as TodoItem[]),
    memberIds.length > 0
      ? supabase
          .from("users")
          .select("*")
          .in("id", memberIds)
          .then(({ data }) => (data as User[]) ?? [])
      : Promise.resolve([] as User[]),
  ]);

  return (
    <AppShell user={user}>
      <TodoPageClient
        lists={(lists as TodoList[]) ?? []}
        allItems={allItems}
        members={members}
        householdId={householdId}
        currentUserId={user.id}
        filter={params.filter}
      />
    </AppShell>
  );
}

// Client wrapper to handle state
import { TodoPageClient } from "@/components/todos/todo-page-client";
