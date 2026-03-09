export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export const DAYS_OF_WEEK_SHORT = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

export const MEAL_TYPES = [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
] as const;

export const MEAL_TYPE_LABELS: Record<string, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

export const GROCERY_CATEGORIES = [
  "Produce",
  "Dairy & Eggs",
  "Meat & Seafood",
  "Bakery",
  "Pantry",
  "Frozen",
  "Beverages",
  "Snacks",
  "Condiments & Sauces",
  "Spices & Seasonings",
  "Canned Goods",
  "Grains & Pasta",
  "Other",
] as const;

export const INGREDIENT_CATEGORY_MAP: Record<string, string> = {
  // Produce
  apple: "Produce", apples: "Produce", banana: "Produce", bananas: "Produce",
  lettuce: "Produce", tomato: "Produce", tomatoes: "Produce", onion: "Produce",
  onions: "Produce", garlic: "Produce", potato: "Produce", potatoes: "Produce",
  carrot: "Produce", carrots: "Produce", celery: "Produce", pepper: "Produce",
  peppers: "Produce", cucumber: "Produce", broccoli: "Produce", spinach: "Produce",
  kale: "Produce", avocado: "Produce", lemon: "Produce", lemons: "Produce",
  lime: "Produce", limes: "Produce", ginger: "Produce", cilantro: "Produce",
  parsley: "Produce", basil: "Produce", mushrooms: "Produce", zucchini: "Produce",
  corn: "Produce", "green onions": "Produce", scallions: "Produce",
  jalapeño: "Produce", "bell pepper": "Produce", "sweet potato": "Produce",

  // Dairy & Eggs
  milk: "Dairy & Eggs", butter: "Dairy & Eggs", cheese: "Dairy & Eggs",
  eggs: "Dairy & Eggs", egg: "Dairy & Eggs", cream: "Dairy & Eggs",
  "sour cream": "Dairy & Eggs", yogurt: "Dairy & Eggs",
  "cream cheese": "Dairy & Eggs", "heavy cream": "Dairy & Eggs",
  "parmesan": "Dairy & Eggs", mozzarella: "Dairy & Eggs", cheddar: "Dairy & Eggs",

  // Meat & Seafood
  chicken: "Meat & Seafood", beef: "Meat & Seafood", pork: "Meat & Seafood",
  salmon: "Meat & Seafood", shrimp: "Meat & Seafood", turkey: "Meat & Seafood",
  bacon: "Meat & Seafood", sausage: "Meat & Seafood", "ground beef": "Meat & Seafood",
  "chicken breast": "Meat & Seafood", "chicken thighs": "Meat & Seafood",
  steak: "Meat & Seafood", fish: "Meat & Seafood", tuna: "Meat & Seafood",

  // Bakery
  bread: "Bakery", tortillas: "Bakery", rolls: "Bakery", buns: "Bakery",
  "pita bread": "Bakery", bagels: "Bakery",

  // Pantry
  flour: "Pantry", sugar: "Pantry", "brown sugar": "Pantry",
  "baking powder": "Pantry", "baking soda": "Pantry", "vanilla extract": "Pantry",
  "vegetable oil": "Pantry", "olive oil": "Pantry", "coconut oil": "Pantry",
  vinegar: "Pantry", "apple cider vinegar": "Pantry", honey: "Pantry",
  "maple syrup": "Pantry",

  // Canned Goods
  "tomato sauce": "Canned Goods", "tomato paste": "Canned Goods",
  "diced tomatoes": "Canned Goods", "crushed tomatoes": "Canned Goods",
  "coconut milk": "Canned Goods", "chicken broth": "Canned Goods",
  broth: "Canned Goods", "vegetable broth": "Canned Goods",
  beans: "Canned Goods", "black beans": "Canned Goods",
  "kidney beans": "Canned Goods", chickpeas: "Canned Goods",

  // Grains & Pasta
  rice: "Grains & Pasta", pasta: "Grains & Pasta", spaghetti: "Grains & Pasta",
  noodles: "Grains & Pasta", quinoa: "Grains & Pasta", oats: "Grains & Pasta",
  "brown rice": "Grains & Pasta", couscous: "Grains & Pasta",

  // Condiments & Sauces
  ketchup: "Condiments & Sauces", mustard: "Condiments & Sauces",
  "soy sauce": "Condiments & Sauces", "hot sauce": "Condiments & Sauces",
  mayo: "Condiments & Sauces", mayonnaise: "Condiments & Sauces",
  "worcestershire sauce": "Condiments & Sauces", "fish sauce": "Condiments & Sauces",
  "sesame oil": "Condiments & Sauces", sriracha: "Condiments & Sauces",

  // Spices & Seasonings
  salt: "Spices & Seasonings", "black pepper": "Spices & Seasonings",
  cumin: "Spices & Seasonings", paprika: "Spices & Seasonings",
  "chili powder": "Spices & Seasonings", oregano: "Spices & Seasonings",
  thyme: "Spices & Seasonings", cinnamon: "Spices & Seasonings",
  "garlic powder": "Spices & Seasonings", "onion powder": "Spices & Seasonings",
  "red pepper flakes": "Spices & Seasonings", turmeric: "Spices & Seasonings",
  "italian seasoning": "Spices & Seasonings", "bay leaves": "Spices & Seasonings",
};

export function getCategoryForIngredient(name: string): string {
  const normalized = name.toLowerCase().trim();
  if (INGREDIENT_CATEGORY_MAP[normalized]) {
    return INGREDIENT_CATEGORY_MAP[normalized];
  }
  // Check partial matches
  for (const [key, category] of Object.entries(INGREDIENT_CATEGORY_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return category;
    }
  }
  return "Other";
}
