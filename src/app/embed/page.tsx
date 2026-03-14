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
    <div className="h-screen overflow-hidden bg-background p-3">
      <div className="mx-auto max-w-5xl space-y-3">
        {/* Greeting — compact */}
        <div>
          <h1 className="text-lg font-bold tracking-tight">
            Good morning, family!
          </h1>
          <p className="text-xs text-muted-foreground">
            Here&apos;s what&apos;s happening in your kitchen.
          </p>
        </div>

        {/* Hub widgets — 3 across */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* This Week's Meals */}
          <div className="flex flex-col gap-2 rounded-lg border border-border border-l-4 border-l-primary bg-card p-3">
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-xs font-semibold">This Week</h3>
            </div>
            <div className="space-y-1">
              {DEMO_MEALS.map((slot, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  <span className="w-7 text-[9px] font-medium uppercase text-muted-foreground">
                    {slot.day}
                  </span>
                  <span className="truncate text-[11px]">{slot.meal}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grocery List */}
          <div className="flex flex-col gap-2 rounded-lg border border-border border-l-4 border-l-teal-500 bg-card p-3">
            <div className="flex items-center gap-1.5">
              <ShoppingCart className="h-3.5 w-3.5 text-teal-500" />
              <h3 className="text-xs font-semibold">Groceries</h3>
            </div>
            <div className="space-y-1.5">
              <div className="relative h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-teal-500 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[9px] text-muted-foreground">
                {checkedCount}/{totalCount} items
              </p>
              <div className="space-y-1">
                {DEMO_GROCERY_ITEMS.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div
                      className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-sm ${
                        item.checked
                          ? "bg-teal-500 text-primary-foreground"
                          : "border border-muted-foreground/30"
                      }`}
                    >
                      {item.checked && <Check className="h-2 w-2" />}
                    </div>
                    <span
                      className={`truncate text-[11px] ${
                        item.checked
                          ? "text-muted-foreground line-through"
                          : ""
                      }`}
                    >
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="flex flex-col gap-2 rounded-lg border border-border border-l-4 border-l-amber-500 bg-card p-3">
            <div className="flex items-center gap-1.5">
              <ListTodo className="h-3.5 w-3.5 text-amber-500" />
              <h3 className="text-xs font-semibold">Tasks</h3>
            </div>
            <div className="space-y-1.5">
              {DEMO_TODOS.map((todo, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  {todo.done ? (
                    <div className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-amber-500 text-primary-foreground">
                      <Check className="h-2 w-2" />
                    </div>
                  ) : (
                    <div className="h-3 w-3 shrink-0 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <span
                    className={`truncate text-[11px] ${
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

        {/* Favorites — compact row */}
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <h2 className="text-sm font-semibold">Favorites</h2>
            <span className="flex items-center gap-0.5 text-[10px] text-primary">
              <Heart className="h-2.5 w-2.5 fill-primary" />
              {DEMO_FAVORITES.length}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {DEMO_FAVORITES.map((recipe, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-2"
              >
                <ChefHat className="h-3.5 w-3.5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-medium">
                    {recipe.title}
                  </span>
                  <span className="flex items-center gap-0.5 text-[9px] text-muted-foreground">
                    <Clock className="h-2 w-2" />
                    {recipe.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Powered by badge */}
      <div className="fixed bottom-2 right-2">
        <a
          href="https://family-planner-app-rosy.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full border border-border bg-card/90 px-2 py-1 text-[9px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-colors hover:text-foreground"
        >
          <ChefHat className="h-2.5 w-2.5" />
          Family Planner
        </a>
      </div>
    </div>
  );
}
