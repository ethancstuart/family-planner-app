import {
  CalendarDays,
  ShoppingCart,
  ChefHat,
  Heart,
  ListTodo,
  Clock,
  Check,
} from "lucide-react";

const DEMO_MEALS = [
  { day: "Mon", meal: "Chicken Tikka Masala" },
  { day: "Tue", meal: "Fish Tacos" },
  { day: "Wed", meal: "Pasta Primavera" },
  { day: "Thu", meal: "Korean Beef Bowls" },
];

const DEMO_GROCERY_ITEMS = [
  { name: "Chicken thighs (2 lb)", checked: true },
  { name: "Basmati rice", checked: true },
  { name: "Tikka masala paste", checked: false },
  { name: "Tilapia fillets", checked: false },
  { name: "Corn tortillas", checked: false },
  { name: "Penne pasta", checked: false },
  { name: "Fresh basil", checked: false },
  { name: "Gochujang sauce", checked: false },
];

const DEMO_FAVORITES = [
  { title: "Grandma's Banana Bread", time: "55 min" },
  { title: "One-Pot Lemon Chicken", time: "35 min" },
  { title: "Thai Basil Stir Fry", time: "20 min" },
  { title: "Homemade Pizza Dough", time: "90 min" },
];

const DEMO_TODOS = [
  { title: "Marinate chicken for tomorrow", done: false },
  { title: "Defrost fish fillets", done: true },
  { title: "Buy birthday cake candles", done: false },
];

export default function EmbedPage() {
  const checkedCount = DEMO_GROCERY_ITEMS.filter((i) => i.checked).length;
  const totalCount = DEMO_GROCERY_ITEMS.length;
  const progressPercent = Math.round((checkedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Good morning, Stuart family!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here&apos;s what&apos;s happening in your kitchen.
          </p>
        </div>

        {/* Hub widgets */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* This Week's Meals */}
          <div className="flex flex-col gap-3 rounded-xl border border-border border-l-4 border-l-primary bg-card p-5">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">This Week&apos;s Meals</h3>
            </div>
            <div className="space-y-2">
              {DEMO_MEALS.map((slot, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="w-8 text-[10px] font-medium uppercase text-muted-foreground">
                    {slot.day}
                  </span>
                  <span className="truncate text-xs">{slot.meal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Grocery List */}
          <div className="flex flex-col gap-3 rounded-xl border border-border border-l-4 border-l-teal-500 bg-card p-5">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Weekly Groceries</h3>
            </div>
            <div className="space-y-2">
              <div className="relative h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {checkedCount}/{totalCount} items checked
              </p>
              <div className="space-y-1.5 pt-1">
                {DEMO_GROCERY_ITEMS.slice(0, 5).map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded ${
                        item.checked
                          ? "bg-primary text-primary-foreground"
                          : "border border-muted-foreground/30"
                      }`}
                    >
                      {item.checked && <Check className="h-2.5 w-2.5" />}
                    </div>
                    <span
                      className={`text-xs ${
                        item.checked
                          ? "text-muted-foreground line-through"
                          : ""
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground">
                  +{totalCount - 5} more items
                </p>
              </div>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="flex flex-col gap-3 rounded-xl border border-border border-l-4 border-l-amber-500 bg-card p-5">
            <div className="flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Pending Tasks</h3>
            </div>
            <div className="space-y-1.5">
              {DEMO_TODOS.map((todo, i) => (
                <div key={i} className="flex items-center gap-2">
                  {todo.done ? (
                    <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                      <Check className="h-2.5 w-2.5" />
                    </div>
                  ) : (
                    <div className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <span
                    className={`truncate text-xs ${
                      todo.done
                        ? "text-muted-foreground line-through"
                        : ""
                    }`}
                  >
                    {todo.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Favorites */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Favorites</h2>
            <span className="flex items-center gap-1 text-sm text-primary">
              <Heart className="h-3.5 w-3.5 fill-primary" />
              {DEMO_FAVORITES.length} recipes
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DEMO_FAVORITES.map((recipe, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-all"
              >
                <ChefHat className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {recipe.title}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-2.5 w-2.5" />
                    {recipe.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Powered by badge */}
      <div className="fixed bottom-3 right-3">
        <a
          href="https://github.com/ethancstuart/family-planner"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/90 px-3 py-1.5 text-[10px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:text-foreground"
        >
          <ChefHat className="h-3 w-3" />
          Powered by Family Planner
        </a>
      </div>
    </div>
  );
}
