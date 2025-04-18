export type TMealTime = "Breakfast" | "Lunch" | "Dinner";
export type FoodPreferenceOption = "Veg" | "Non-Veg" | "Mixed";

export type TMealPlanner = {
  preferredMealTime?: TMealTime[];
  foodPreference?: FoodPreferenceOption[];
};

export interface TExtendedMealPlanner extends TMealPlanner {
  addpreferredMealTime: FoodPreferenceOption[];
  removepreferredMealTime: FoodPreferenceOption[];
  addFoodPreference: FoodPreferenceOption[];
  removeFoodPreference: FoodPreferenceOption[];
}
