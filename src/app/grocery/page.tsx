import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { createFamilyClient, FAMILY_HOUSEHOLD_ID } from "@/lib/supabase/family";
import { GroceryListIndex } from "@/components/grocery/grocery-list-index";
import type { GroceryList } from "@/types";

export const metadata: Metadata = { title: "Grocery Lists" };

export default async function GroceryPage() {
  const supabase = createFamilyClient();
  const householdId = FAMILY_HOUSEHOLD_ID;

  const { data: lists } = await supabase
    .from("grocery_lists")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  // Get item counts per list
  const listIds = (lists ?? []).map((l) => l.id);
  const itemCounts: Record<string, { total: number; checked: number }> = {};

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
    .eq("household_id", householdId)
    .order("week_start_date", { ascending: false })
    .limit(8);

  return (
    <AppShell>
      <GroceryListIndex
        lists={(lists as GroceryList[]) ?? []}
        itemCounts={itemCounts}
        householdId={householdId}
        mealPlans={mealPlans ?? []}
      />
    </AppShell>
  );
}
