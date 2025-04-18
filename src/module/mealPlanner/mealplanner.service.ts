import { TMealPlanner } from "./mealPlanner.interface";

const createMealPlan = async (payload: TMealPlanner) => {
  console.log(payload);
};

// if (removeFoodPreference && removeFoodPreference.length > 0) {
//     const updated = await Customer.findOneAndUpdate(
//       { user: id },
//       { $pull: { foodPreference: removeFoodPreference } },
//       { session, new: true, runValidators: true }
//     );
//     if (!updated) {
//       throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
//     }
//   }

//   if (addFoodPreference && addFoodPreference.length > 0) {
//     const updated = await Customer.findOneAndUpdate(
//       { user: id },
//       { $addToSet: { foodPreference: { $each: addFoodPreference } } },
//       { session, new: true, runValidators: true }
//     );
//     if (!updated) {
//       throw new AppError(StatusCodes.BAD_REQUEST, "faild to update data");
//     }
//   }

export const mealPlannerService = {
  createMealPlan,
};
