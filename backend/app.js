import express from "express";
import cors from "cors";
import employeeRoutes from "./routes/employeeRoutes.js";
import offboardingRoutes from "./routes/offboardingRoutes.js";
import workflowRoutes from "./routes/workflowRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import accessRevocationRoutes from "./routes/accessRevocationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Employee Offboarding API is running"
    });
});

app.use("/api/employees", employeeRoutes);
app.use("/api/offboardings", offboardingRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/audit-logs", auditRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/documents", documentRoutes);
app.use(
  "/api/access-revocations",
  accessRevocationRoutes
);
app.use("/api/dashboard", dashboardRoutes);
export default app;