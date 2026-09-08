import WorkflowTemplate from "../models/WorkflowTemplate.js";

const DEFAULT_OFFBOARDING_TEMPLATE = {
  name: "Employee Offboarding",
  description: "Global clearance chain for employee offboarding.",
  stages: [
    {
      name: "Project / Reporting Manager Clearance",
      role: "PROJECT_MANAGER",
      order: 1,
      mode: "parallel",
      checklist: ["Project completion", "Knowledge transfer", "Client and system access"]
    },
    {
      name: "Admin & Systems Clearance",
      role: "ADMIN",
      order: 1,
      mode: "parallel",
      checklist: ["Laptop and charger", "Phone, data card and keys", "Email and system access"]
    },
    {
      name: "Accounts Clearance",
      role: "ACCOUNTS",
      order: 1,
      mode: "parallel",
      checklist: ["Travel advances", "Loans and salary advances", "Imprest"]
    },
    {
      name: "Personnel Clearance",
      role: "PERSONNEL",
      order: 1,
      mode: "parallel",
      checklist: ["ID card", "Access card", "Business cards"]
    },
    {
      name: "HR Final Certification",
      role: "HR",
      order: 2,
      mode: "sequential",
      checklist: ["Final clearance review", "Documents ready for issue"]
    }
  ]
};

export const ensureDefaultWorkflowTemplate = async () => {
  const existingTemplate = await WorkflowTemplate.findOne({
    name: DEFAULT_OFFBOARDING_TEMPLATE.name
  });

  if (existingTemplate) return existingTemplate;

  return WorkflowTemplate.create(DEFAULT_OFFBOARDING_TEMPLATE);
};
