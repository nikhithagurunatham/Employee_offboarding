import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ================================
// EMPLOYEES
// ================================

export const getEmployees = async () => {
  const response = await api.get("/employees");
  return response.data;
};

// ================================
// OFFBOARDING
// ================================

export const getOffboardings = async () => {
  const response = await api.get("/offboardings");
  return response.data;
};

export const createOffboarding = async (offboardingData) => {
  const response = await api.post(
    "/offboardings",
    offboardingData
  );

  return response.data;
};

// ================================
// DASHBOARD
// ================================

export const getOffboardingDashboard = async (
  offboardingId
) => {
  const response = await api.get(
    `/dashboard/offboarding/${offboardingId}`
  );

  return response.data;
};

// ================================
// WORKFLOW
// ================================

export const processStage = async (
  workflowId,
  stageId,
  action,
  approver,
  remarks,
  checklist
) => {
  const response = await api.patch(
    `/workflows/${workflowId}/stages/${stageId}`,
    {
      action,
      approver,
      remarks,
      checklist,
    }
  );

  return response.data;
};

// ================================
// ACCESS REVOCATION
// ================================

export const createAccessRevocation = async (data) => {
  const response = await api.post(
    "/access-revocations",
    data
  );

  return response.data;
};

export const getAccessRevocation = async (
  offboardingId
) => {
  const response = await api.get(
    `/access-revocations/offboarding/${offboardingId}`
  );

  return response.data;
};

// ================================
// NOTIFICATIONS
// ================================

export const getNotifications = async () => {
  const response = await api.get("/notifications");
  return response.data;
};

export default api;