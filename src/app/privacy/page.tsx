import type { Metadata } from "next";
import Link from "next/link";
import { ChefHat } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: March 14, 2026
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              1. What Data We Collect
            </h2>
            <p>When you use Family Planner, we collect:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <span className="font-medium text-foreground">Account information:</span>{" "}
                your email address and name, provided through Google OAuth sign-in
              </li>
              <li>
                <span className="font-medium text-foreground">Content you create:</span>{" "}
                recipes, meal plans, grocery lists, and to-do items
              </li>
              <li>
                <span className="font-medium text-foreground">Household data:</span>{" "}
                household membership and settings, including any API keys you
                provide for AI features
              </li>
              <li>
                <span className="font-medium text-foreground">Usage data:</span>{" "}
                basic analytics collected by Vercel to help us understand how the
                app is used
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              2. How We Use Your Data
            </h2>
            <p>Your data is used to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Provide and maintain the Family Planner service</li>
              <li>Authenticate your identity and manage your account</li>
              <li>Process recipe imports using AI extraction</li>
              <li>Sync meal plans with your Google Calendar (when connected)</li>
              <li>Improve the service through anonymized usage analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              3. Third-Party Services
            </h2>
            <p>Family Planner relies on the following third-party services:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                <span className="font-medium text-foreground">Supabase</span> —
                database hosting, authentication, and real-time data
              </li>
              <li>
                <span className="font-medium text-foreground">Claude API (Anthropic)</span> —
                AI-powered recipe extraction from URLs, videos, and images
              </li>
              <li>
                <span className="font-medium text-foreground">Google Calendar API</span> —
                calendar sync for meal plans (optional, user-initiated)
              </li>
              <li>
                <span className="font-medium text-foreground">Spoonacular API</span> —
                recipe discovery and search
              </li>
              <li>
                <span className="font-medium text-foreground">Vercel</span> —
                application hosting and analytics
              </li>
            </ul>
            <p className="mt-3">
              Each service has its own privacy policy. We encourage you to review
              them.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              4. Data Sharing
            </h2>
            <p>
              We do not sell, rent, or trade your personal data to third parties.
              Data is only shared with the third-party services listed above as
              necessary to provide the service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              5. Data Retention & Deletion
            </h2>
            <p>
              Your data is retained as long as your account is active. If you
              would like to delete your account and all associated data, please
              contact us at{" "}
              <a
                href="mailto:ethan.c.stuart@gmail.com"
                className="text-primary underline underline-offset-4 hover:text-primary/80"
              >
                ethan.c.stuart@gmail.com
              </a>{" "}
              and we will process your request promptly.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              6. Cookies
            </h2>
            <p>
              Family Planner uses cookies solely for authentication session
              management through Supabase Auth. We do not use advertising or
              tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              7. Changes to This Policy
            </h2>
            <p>
              We may update this privacy policy from time to time. Changes will
              be reflected on this page with an updated date. Continued use of
              the service constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-foreground">
              8. Contact
            </h2>
            <p>
              If you have questions about this privacy policy or your data,
              contact us at{" "}
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
