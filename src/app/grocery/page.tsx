import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { GroceryListIndex } from "@/components/grocery/grocery-list-index";
import type { GroceryList } from "@/types";

export default async function GroceryPage() {
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

  const { data: lists } = await supabase
    .from("grocery_lists")
    .select("*")
    .eq("household_id", membership.household_id)
    .order("created_at", { ascending: false });

  // Get item counts per list
  const listIds = (lists ?? []).map((l) => l.id);
  let itemCounts: Record<string, { total: number; checked: number }> = {};

  if (listIds.length > 0) {
    const { data: items } = await supabase
      .from("grocery_items")
      .select("grocery_list_id, checked")
      .in("grocery_list_id", listIds);

    if (items) {
      for (const item of items) {
        if (!itemCounts[item.grocery_list_id]) {
          itemCounts[item.grocery_list_id] = { total: 0, checked: 0 };
        }
        itemCounts[item.grocery_list_id].total++;
        if (item.checked) itemCounts[item.grocery_list_id].checked++;
      }
    }
  }

  // Get meal plans for "generate from plan" option
  const { data: mealPlans } = await supabase
    .from("meal_plans")
    .select("id, week_start_date")
    .eq("household_id", membership.household_id)
    .order("week_start_date", { ascending: false })
    .limit(8);

  return (
    <AppShell user={user}>
      <GroceryListIndex
        lists={(lists as GroceryList[]) ?? []}
        itemCounts={itemCounts}
        householdId={membership.household_id}
        mealPlans={mealPlans ?? []}
      />
    </AppShell>
  );
}
