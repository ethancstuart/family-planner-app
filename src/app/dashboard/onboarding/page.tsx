import { redirect } from "next/navigation";

// No onboarding needed for personal family tool — redirect to dashboard
export default function OnboardingPage() {
  redirect("/dashboard");
}
