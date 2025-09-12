import { MealProvider } from "../mealProvider/mealProvider.model";
import { User } from "../user/user.model";
import { subWeeks } from "date-fns";
import { mergeWeeksWithMongoData } from "./statistic.utills";
import { Subscriber } from "../subscriber/subscriber.model";
import { Kitchen } from "../kitchen/kitchen.model";
import { Meal } from "../meal/meal.model";
import { Blog } from "../blog/blog.model";
import { Order } from "../order/order.model";

const getUsersStats = async () => {
  const totalUsers = await User.countDocuments({ isDeleted: false });
  const [totalAdmins, totalCustomers, totalMealProviders] = await Promise.all([
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "mealProvider" }),
  ]);
  const [activeUsers, blockedUsers] = await Promise.all([
    User.countDocuments({ status: "active" }),
    User.countDocuments({ status: "blocked" }),
  ]);
  const [verifiedUsers, unverifiedUsers] = await Promise.all([
    User.countDocuments({ verifiedWithEmail: true }),
    User.countDocuments({ verifiedWithEmail: false }),
  ]);
  const [providerHasKitchen, providerHasNoKitchen] = await Promise.all([
    MealProvider.countDocuments({ hasKitchen: true }),
    MealProvider.countDocuments({ hasKitchen: false }),
  ]);

  const fourWeeksAgo = subWeeks(new Date(), 3);
  const newUsersLast4Weeks = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: fourWeeksAgo },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: { $isoWeek: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
  const finalResult = mergeWeeksWithMongoData(newUsersLast4Weeks);
  return {
    totals: {
      totalUsers,
      totalAdmins,
      totalCustomers,
      totalMealProviders,
    },
    status: {
      activeUsers,
      blockedUsers,
    },
    verification: {
      verifiedUsers,
      unverifiedUsers,
    },
    providerKitchen: {
      providerHasKitchen,
      providerHasNoKitchen,
    },
    newUsersByWeek: finalResult,
  };
};

const getSubsCribersStats = async () => {
  const totalSubscriber = await Subscriber.countDocuments({ isDeleted: false });
  const [totalActive, totalBlocked] = await Promise.all([
    Subscriber.countDocuments({ status: "active" }),
    Subscriber.countDocuments({ status: "blocked" }),
  ]);
  const fourWeeksAgo = subWeeks(new Date(), 3);
  const newUsersLast4Weeks = await Subscriber.aggregate([
    {
      $match: {
        createdAt: { $gte: fourWeeksAgo },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: { $isoWeek: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
  const finalResult = mergeWeeksWithMongoData(newUsersLast4Weeks);
  return {
    totals: {
      totalSubscriber,
      totalActive,
      totalBlocked,
    },
    newUsersByWeek: finalResult,
  };
};

const getKitchenStats = async () => {
  const totalKitchen = await Kitchen.countDocuments({ isDeleted: false });
  const [homeKitchen, commercialKitchen] = await Promise.all([
    Kitchen.countDocuments({ kitchenType: "Home-based" }),
    Kitchen.countDocuments({ kitchenType: "Commercial" }),
  ]);
  const [hygiene, notHygiene] = await Promise.all([
    Kitchen.countDocuments({ hygieneCertified: true }),
    Kitchen.countDocuments({ hygieneCertified: false }),
  ]);
  const [active, notActive] = await Promise.all([
    Kitchen.countDocuments({ isActive: true }),
    Kitchen.countDocuments({ isActive: false }),
  ]);
  return {
    totals: {
      totalKitchen,
      homeKitchen,
      commercialKitchen,
    },
    hygieneStatus: {
      hygiene,
      notHygiene,
    },
    status: {
      active,
      notActive,
    },
  };
};

const getMealStats = async () => {
  const totalMeal = await Meal.countDocuments({ isDeleted: false });
  const [
    breakFast,
    lunch,
    dinner,
    snack,
    brunch,
    supper,
    teaTime,
    midNight,
    appetizer,
    dessert,
    beverage,
    sideDish,
    seaFood,
    streetFood,
    healthyMeal,
  ] = await Promise.all([
    Meal.countDocuments({ foodCategory: "Breakfast" }),
    Meal.countDocuments({ foodCategory: "Lunch" }),
    Meal.countDocuments({ foodCategory: "Dinner" }),
    Meal.countDocuments({ foodCategory: "Snack" }),
    Meal.countDocuments({ foodCategory: "Brunch" }),
    Meal.countDocuments({ foodCategory: "Supper" }),
    Meal.countDocuments({ foodCategory: "Tea Time" }),
    Meal.countDocuments({ foodCategory: "Midnight Snack" }),
    Meal.countDocuments({ foodCategory: "Appetizer" }),
    Meal.countDocuments({ foodCategory: "Dessert" }),
    Meal.countDocuments({ foodCategory: "Beverage" }),
    Meal.countDocuments({ foodCategory: "Side Dish" }),
    Meal.countDocuments({ foodCategory: "Sea Food" }),
    Meal.countDocuments({ foodCategory: "Street Food & Fast Food" }),
    Meal.countDocuments({ foodCategory: "Healthy Meal" }),
  ]);
  const [
    Bengali,
    IndianMeal,
    ChineseMeal,
    ContinentalMeal,
    ItalianMeal,
    ThaiMeal,
    AmericanMeal,
    MediterraneanMeal,
    MexicanMeal,
    TurkishMeal,
    PersianMeal,
    SpanishMeal,
    FrenchMeal,
    JapaneseMeal,
    KoreanMeal,
  ] = await Promise.all([
    Meal.countDocuments({ cuisineType: "Bengali" }),
    Meal.countDocuments({ cuisineType: "Indian" }),
    Meal.countDocuments({ cuisineType: "Chinese" }),
    Meal.countDocuments({ cuisineType: "Continental" }),
    Meal.countDocuments({ cuisineType: "Italian" }),
    Meal.countDocuments({ cuisineType: "Thai" }),
    Meal.countDocuments({ cuisineType: "American" }),
    Meal.countDocuments({ cuisineType: "Mediterranean" }),
    Meal.countDocuments({ cuisineType: "Mexican" }),
    Meal.countDocuments({ cuisineType: "Turkish" }),
    Meal.countDocuments({ cuisineType: "Persian" }),
    Meal.countDocuments({ cuisineType: "Spanish" }),
    Meal.countDocuments({ cuisineType: "French" }),
    Meal.countDocuments({ cuisineType: "Japanese" }),
    Meal.countDocuments({ cuisineType: "Korean" }),
  ]);
  const [
    mixedFood,
    vegFood,
    nonVeg,
    vegan,
    pescatarian,
    Eggetarian,
    Halal,
    Kosher,
    Jain,
  ] = await Promise.all([
    Meal.countDocuments({ foodPreference: "Mixed" }),
    Meal.countDocuments({ foodPreference: "Veg" }),
    Meal.countDocuments({ foodPreference: "Non-Veg" }),
    Meal.countDocuments({ foodPreference: "Vegan" }),
    Meal.countDocuments({ foodPreference: "Pescatarian" }),
    Meal.countDocuments({ foodPreference: "Eggetarian" }),
    Meal.countDocuments({ foodPreference: "Halal" }),
    Meal.countDocuments({ foodPreference: "Kosher" }),
    Meal.countDocuments({ foodPreference: "Jain" }),
  ]);
  const [smallSize, mediumSize, largeSize] = await Promise.all([
    Meal.countDocuments({ portionSize: "Small" }),
    Meal.countDocuments({ portionSize: "Medium" }),
    Meal.countDocuments({ portionSize: "Large" }),
  ]);

  const [available, notAvailable] = await Promise.all([
    Meal.countDocuments({ isAvailable: true }),
    Meal.countDocuments({ isAvailable: false }),
  ]);
  const [highestPriceMeal, lowestPriceMeal] = await Promise.all([
    Meal.findOne().sort({ price: -1 }).select("price title -_id"),
    Meal.findOne().sort({ price: 1 }).select("price title -_id"),
  ]);
  const fourWeeksAgo = subWeeks(new Date(), 3);
  const newMealLast4Weeks = await Meal.aggregate([
    {
      $match: {
        createdAt: { $gte: fourWeeksAgo },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: { $isoWeek: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
  const finalResult = mergeWeeksWithMongoData(newMealLast4Weeks);
  return {
    total: totalMeal,
    cuisine: {
      Bengali,
      IndianMeal,
      ChineseMeal,
      ContinentalMeal,
      ItalianMeal,
      ThaiMeal,
      AmericanMeal,
      MediterraneanMeal,
      MexicanMeal,
      TurkishMeal,
      PersianMeal,
      SpanishMeal,
      FrenchMeal,
      JapaneseMeal,
      KoreanMeal,
    },
    category: {
      breakFast,
      lunch,
      dinner,
      snack,
      brunch,
      supper,
      teaTime,
      midNight,
      appetizer,
      dessert,
      beverage,
      sideDish,
      seaFood,
      streetFood,
      healthyMeal,
    },
    preference: {
      mixedFood,
      vegFood,
      nonVeg,
      vegan,
      pescatarian,
      Eggetarian,
      Halal,
      Kosher,
      Jain,
    },
    size: {
      smallSize,
      mediumSize,
      largeSize,
    },
    status: {
      available,
      notAvailable,
    },
    price: {
      highestPriceMeal,
      lowestPriceMeal,
    },
    newMealsByWeek: finalResult,
  };
};

const getAllBlogs = async () => {
  const totalBlog = await Blog.countDocuments({ isDeleted: false });
  const [publishedBlog, archivedBlog, topViewedBlogs] = await Promise.all([
    Blog.countDocuments({ status: "published" }),
    Blog.countDocuments({ status: "archived" }),
    Blog.find({ isDeleted: false })
      .sort({ view: -1 })
      .limit(5)
      .select("title view -_id")
      .lean(),
  ]);
  const fourWeeksAgo = subWeeks(new Date(), 3);
  const newBlogLast4Weeks = await Blog.aggregate([
    {
      $match: {
        createdAt: { $gte: fourWeeksAgo },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: { $isoWeek: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
  const finalResult = mergeWeeksWithMongoData(newBlogLast4Weeks);
  return {
    total: totalBlog,
    status: {
      publishedBlog,
      archivedBlog,
    },
    topBlogs: topViewedBlogs,
    newBlogsByWeek: finalResult,
  };
};

const getOrderStats = async () => {
  const totalOrder = await Order.countDocuments({ isDeleted: false });
  const [
    singleOrder,
    regularOrder,
    manualDelivery,
    planDelivery,
    onlineDelivery,
    cashOnDelivery,
    activeOrder,
    inActiveOrder,
    topDeliveryOrder,
  ] = await Promise.all([
    Order.countDocuments({ orderType: "once" }),
    Order.countDocuments({ orderType: "regular" }),
    Order.countDocuments({ deliveryMode: "mealPlanner" }),
    Order.countDocuments({ deliveryMode: "manual" }),
    Order.countDocuments({ payment: "online" }),
    Order.countDocuments({ payment: "cash on delivery" }),
    Order.countDocuments({ isActive: true }),
    Order.countDocuments({ isActive: false }),
    Order.find({ isDeleted: false })
      .populate({ path: "mealId", select: "title -_id" })
      .sort({ deliveredCount: -1 })
      .limit(5)
      .select("deliveredCount -_id")
      .lean(),
  ]);

  const [
    cancel,
    pending,
    confirm,
    cooking,
    readyForPickup,
    OutForDelivery,
    delivered,
  ] = await Promise.all([
    Order.countDocuments({ status: "Cancelled" }),
    Order.countDocuments({ status: "Pending" }),
    Order.countDocuments({ status: "Confirmed" }),
    Order.countDocuments({ status: "Cooking" }),
    Order.countDocuments({ status: "ReadyForPickup" }),
    Order.countDocuments({ status: "OutForDelivery" }),
    Order.countDocuments({ status: "Delivered" }),
  ]);

  const fourWeeksAgo = subWeeks(new Date(), 3);
  const newBlogLast4Weeks = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: fourWeeksAgo },
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: { $isoWeek: "$createdAt" },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);
  const finalResult = mergeWeeksWithMongoData(newBlogLast4Weeks);
  return {
    total: totalOrder,
    types: {
      singleOrder,
      regularOrder,
      manualDelivery,
      planDelivery,
      onlineDelivery,
      cashOnDelivery,
      activeOrder,
      inActiveOrder,
    },
    status: {
      cancel,
      pending,
      confirm,
      cooking,
      readyForPickup,
      OutForDelivery,
      delivered,
    },
    topOrder: topDeliveryOrder,
    newBlogsByWeek: finalResult,
  };
};
export const statisticService = {
  getUsersStats,
  getSubsCribersStats,
  getKitchenStats,
  getMealStats,
  getAllBlogs,
  getOrderStats,
};
