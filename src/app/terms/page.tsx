import type { Metadata } from "next";
import Link from "next/link";
import { ChefHat } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-primary">Family Planner</span>
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 pt-28 pb-20">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: March 14, 2026
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              1. Service Description
            </h2>
            <p>
              Family Planner is a family meal planning application that helps
              households organize recipes, plan meals, generate grocery lists,
              manage to-dos, and sync with calendars. The service is provided
              as-is for personal, non-commercial use.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              2. Accounts
            </h2>
            <p>
              You sign in using Google OAuth through Supabase Auth. Each person
              should maintain only one account. You are responsible for all
              activity that occurs under your account. By signing in, you agree
              to provide accurate information and to keep your Google account
              secure.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              3. Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the service</li>
              <li>Interfere with or disrupt the service or its infrastructure</li>
              <li>Upload malicious content or spam</li>
              <li>Scrape, crawl, or use automated tools to extract data from the service</li>
              <li>Impersonate another person or misrepresent your affiliation</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              4. Data & Privacy
            </h2>
            <p>
              Your use of Family Planner is also governed by our{" "}
              <Link
                href="/privacy"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                Privacy Policy
              </Link>
              , which describes what data we collect and how we use it.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              5. User Content
            </h2>
            <p>
              You retain ownership of all content you create within Family
              Planner, including recipes, meal plans, grocery lists, and to-dos.
              We do not claim any intellectual property rights over your content.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              6. Disclaimer
            </h2>
            <p>
              Family Planner is provided &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; without warranties of any kind, whether express or
              implied. We do not guarantee that the service will be
              uninterrupted, secure, or error-free. We are not responsible for
              the accuracy of AI-extracted recipe data — always review recipes
              before use, especially regarding allergens and dietary
              restrictions.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              7. Changes to These Terms
            </h2>
            <p>
              We may update these terms from time to time. Continued use of the
              service after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              8. Contact
            </h2>
            <p>
              If you have questions about these terms, contact us at{" "}
              <a
                href="mailto:ethan.c.stuart@gmail.com"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                ethan.c.stuart@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
