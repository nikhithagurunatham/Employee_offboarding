import express from "express";

import {
  getNotifications,
  getNotificationsByOffboarding,
  sendManualReminder,
  markNotificationAsRead
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", getNotifications);

router.get(
  "/offboarding/:offboardingId",
  getNotificationsByOffboarding
);

router.post(
  "/offboarding/:offboardingId/reminder",
  sendManualReminder
);

router.patch(
  "/:id/read",
  markNotificationAsRead
);

export default router;