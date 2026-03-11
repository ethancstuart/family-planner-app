export interface Household {
  id: string;
  name: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface HouseholdMember {
  household_id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
}

export interface Recipe {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  ingredients: Ingredient[];
  steps: string[];
  tags: string[];
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  servings: number | null;
  source_url: string | null;
  source_type: "manual" | "url" | "video" | "image" | "spoonacular";
  spoonacular_id?: number | null;
  image_url: string | null;
  is_favorite: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Ingredient {
  name: string;
  quantity: number | null;
  unit: string | null;
  category?: string;
}

export interface MealPlan {
  id: string;
  household_id: string;
  week_start_date: string;
  created_at: string;
}

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface MealPlanSlot {
  id: string;
  meal_plan_id: string;
  recipe_id: string;
  day_of_week: DayOfWeek;
  meal_type: MealType;
  recipe?: Recipe;
}

export interface GroceryList {
  id: string;
  household_id: string;
  title: string;
  meal_plan_id: string | null;
  created_at: string;
}

export interface GroceryItem {
  id: string;
  grocery_list_id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  category: string | null;
  checked: boolean;
}

export interface PantryStaple {
  id: string;
  household_id: string;
  name: string;
  category: string | null;
}

export interface CalendarConnection {
  id: string;
  user_id: string;
  provider: "google";
  access_token: string;
  refresh_token: string;
  expires_at: string;
  calendar_id: string | null;
}

export interface TodoList {
  id: string;
  household_id: string;
  title: string;
  created_at: string;
}

export interface TodoItem {
  id: string;
  todo_list_id: string;
  title: string;
  assigned_to: string | null;
  due_date: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  completed: boolean;
  created_at: string;
}

export interface HouseholdInvitation {
  id: string;
  household_id: string;
  token: string;
  created_by: string;
  expires_at: string;
  used_by: string | null;
  used_at: string | null;
  created_at: string;
}

export interface MealPlanTemplate {
  id: string;
  household_id: string;
  name: string;
  created_by: string;
  created_at: string;
}

export interface MealPlanTemplateSlot {
  id: string;
  template_id: string;
  recipe_id: string;
  day_of_week: DayOfWeek;
  meal_type: MealType;
  recipe?: Recipe;
}

export interface SpoonacularSearchResult {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  cuisines: string[];
  diets: string[];
  dishTypes: string[];
}

export interface HouseholdSettings {
  id: string;
  household_id: string;
  claude_api_key_encrypted: string | null;
  spoonacular_api_key: string | null;
  default_servings: number;
  created_at: string;
}
