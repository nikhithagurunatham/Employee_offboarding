import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { ensureDefaultWorkflowTemplate } from "./services/workflowTemplateService.js";
import { sendPendingStageReminders } from "./services/notificationService.js";
import { checkAndSendReminders } from "./services/workflowService.js";
dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    await ensureDefaultWorkflowTemplate();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
    setInterval(() => {
  checkAndSendReminders();
}, 60 * 1000);
    setInterval(() => {
        sendPendingStageReminders().catch((error) => {
            console.error(`Reminder sweep failed: ${error.message}`);
        });
    }, 60 * 60 * 1000);
};

startServer().catch((error) => {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
});