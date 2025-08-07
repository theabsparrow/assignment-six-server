import { MealProvider } from "../mealProvider/mealProvider.model";
import { User } from "../user/user.model";
import { subWeeks } from "date-fns";
import { mergeWeeksWithMongoData } from "./statistic.utills";
import { Subscriber } from "../subscriber/subscriber.model";
import { Kitchen } from "../kitchen/kitchen.model";

const getUsersStats = async () => {
  const totalUsers = await User.countDocuments();
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
  const totalSubscriber = await Subscriber.countDocuments();
  const [totalActive, totalBlocked] = await Promise.all([
    Subscriber.countDocuments({ status: "active" }),
    Subscriber.countDocuments({ status: "blocked" }),
  ]);
  const fourWeeksAgo = subWeeks(new Date(), 3);
  const newUsersLast4Weeks = await Subscriber.aggregate([
    {
      $match: {
        createdAt: { $gte: fourWeeksAgo },
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
  const totalKitchen = await Kitchen.countDocuments();

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
export const statisticService = {
  getUsersStats,
  getSubsCribersStats,
  getKitchenStats,
};
