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

  // Get todo lists with items
  const { data: lists } = await supabase
    .from("todo_lists")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  const listIds = (lists ?? []).map((l) => l.id);
  let allItems: TodoItem[] = [];

  if (listIds.length > 0) {
    const { data: items } = await supabase
      .from("todo_items")
      .select("*")
      .in("todo_list_id", listIds)
      .order("created_at");
    allItems = (items as TodoItem[]) ?? [];
  }

  // Get household members for assignment
  const { data: memberData } = await supabase
    .from("household_members")
    .select("user_id")
    .eq("household_id", householdId);

  const memberIds = (memberData ?? []).map((m) => m.user_id);
  let members: User[] = [];

  if (memberIds.length > 0) {
    const { data: profiles } = await supabase
      .from("users")
      .select("*")
      .in("id", memberIds);
    members = (profiles as User[]) ?? [];
  }

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
