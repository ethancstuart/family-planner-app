import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "Discover Recipes" };

// Spoonacular discover feature not needed for personal family tool
// Redirect to main recipes page
export default function DiscoverPage() {
  redirect("/recipes");
}
