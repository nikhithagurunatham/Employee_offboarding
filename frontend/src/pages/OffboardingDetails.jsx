import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getOffboardingDashboard,
  processStage,
  createAccessRevocation,
} from "../services/api";

function OffboardingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ================================
  // STATE
  // ================================

  const [dashboard, setDashboard] = useState(null);

  const [checklist, setChecklist] = useState({});
  const [remarks, setRemarks] = useState("");

  // Access revocation
  const [emailRevoked, setEmailRevoked] = useState(false);
  const [systemRevoked, setSystemRevoked] = useState(false);
  const [accessRemarks, setAccessRemarks] = useState("");

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const [error, setError] = useState("");
  const [accessSuccess, setAccessSuccess] = useState("");

  // ================================
  // APPROVERS
  // ================================

  const APPROVERS = {
    PROJECT_MANAGER: {
      userId: "USR001",
      name: "Priya Sharma",
      role: "PROJECT_MANAGER",
    },

    ADMIN: {
      userId: "USR002",
      name: "Admin User",
      role: "ADMIN",
    },

    ACCOUNTS: {
      userId: "USR003",
      name: "Accounts User",
      role: "ACCOUNTS",
    },

    PERSONNEL: {
      userId: "USR004",
      name: "Personnel User",
      role: "PERSONNEL",
    },

    HR: {
      userId: "USR005",
      name: "HR User",
      role: "HR",
    },
  };

  // ================================
  // LOAD DASHBOARD
  // ================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOffboardingDashboard(id);

      const data = response.data || response;

      setDashboard(data);

      // Load existing access revocation state
      if (data.accessRevocation) {
        setEmailRevoked(
          Boolean(data.accessRevocation.emailAccessRevoked)
        );

        setSystemRevoked(
          Boolean(data.accessRevocation.systemAccessRevoked)
        );

        setAccessRemarks(
          data.accessRevocation.remarks || ""
        );
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load offboarding details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [id]);

  // ================================
  // LOADING
  // ================================

  if (loading) {
    return (
      <div className="details-page">
        <div className="details-container">
          <div className="message">
            Loading offboarding details...
          </div>
        </div>
      </div>
    );
  }

  // ================================
  // NO DATA
  // ================================

  if (!dashboard) {
    return (
      <div className="details-page">
        <div className="details-container">
          <div className="message error">
            {error || "No dashboard data found."}
          </div>
        </div>
      </div>
    );
  }

  // ================================
  // DATA
  // ================================

  const employee = dashboard.employee;
  const offboarding = dashboard.offboarding;

  const stages = dashboard.stages || [];

  const workflow =
    dashboard.workflow ||
    dashboard.workflowInstance ||
    dashboard.workflowData ||
    null;

  const workflowId =
    workflow?._id ||
    dashboard.workflowId ||
    dashboard.workflowInstanceId ||
    null;

  // ================================
  // PROGRESS
  // ================================

  const completedStages = stages.filter(
    (stage) => stage.status === "Approved"
  ).length;

  const totalStages = stages.length;

  const progressPercentage =
    totalStages > 0
      ? Math.round(
          (completedStages / totalStages) * 100
        )
      : 0;

  // ================================
  // ACTIVE STAGE
  // ================================

  const activeStage = stages.find(
    (stage) => stage.status === "Active"
  );

  // ================================
  // CHECKLIST
  // ================================

  const toggleChecklist = (item) => {
    setChecklist((previous) => ({
      ...previous,
      [item]: !previous[item],
    }));
  };

  // ================================
  // APPROVE / REJECT
  // ================================

  const handleApproval = async (action) => {
    if (!activeStage) {
      setError("There is no active workflow stage.");
      return;
    }

    if (!workflowId) {
      setError(
        "Workflow ID is missing from the dashboard response."
      );

      console.error(
        "Dashboard response:",
        dashboard
      );

      return;
    }

    const approver =
      APPROVERS[activeStage.role];

    if (!approver) {
      setError(
        `No approver configured for role: ${activeStage.role}`
      );

      return;
    }

    try {
      setProcessing(true);
      setError("");

      const submittedChecklist =
        activeStage.checklist.map((item) => ({
          item: item.item,

          completed:
            checklist[item.item] !== undefined
              ? checklist[item.item]
              : item.completed,
        }));

      await processStage(
        workflowId,
        activeStage._id,
        action,
        approver,
        remarks,
        submittedChecklist
      );

      setChecklist({});
      setRemarks("");

      await loadDashboard();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Unable to process this stage."
      );
    } finally {
      setProcessing(false);
    }
  };

  // ================================
  // ACCESS REVOCATION
  // ================================

  const handleAccessRevocation = async () => {
    setError("");
    setAccessSuccess("");

    if (!emailRevoked && !systemRevoked) {
      setError(
        "Select at least one access type to revoke."
      );

      return;
    }

    if (!employee?._id) {
      setError("Employee information is missing.");
      return;
    }

    try {
      setRevoking(true);

      // Build systems list
      const systems = [];

      if (emailRevoked) {
        systems.push("Email");
      }

      if (systemRevoked) {
        systems.push("VPN");
        systems.push("GitHub");
        systems.push("Jira");
      }

      const accessData = {
        offboarding: id,

        employee: employee._id,

        emailAccessRevoked: emailRevoked,

        systemAccessRevoked: systemRevoked,

        systems: systems,

        revokedAt: new Date().toISOString(),

        revokedBy: {
          userId: "USR002",
          name: "Admin User",
          role: "ADMIN",
        },

        remarks:
          accessRemarks ||
          "Access revoked during employee offboarding.",
      };

      console.log(
        "Sending access revocation:",
        accessData
      );

      await createAccessRevocation(accessData);

      setAccessSuccess(
        "Access revocation recorded successfully."
      );

      await loadDashboard();
    } catch (err) {
      console.error(
        "Access revocation error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to record access revocation."
      );
    } finally {
      setRevoking(false);
    }
  };

  // ================================
  // STATUS CLASS
  // ================================

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "completed";

      case "In Progress":
        return "progress";

      case "Rejected":
        return "rejected";

      case "Cancelled":
        return "cancelled";

      default:
        return "initiated";
    }
  };

  // ================================
  // UI
  // ================================

  return (
    <div className="details-page">
      <div className="details-container">

        {/* ================================
            BACK
        ================================= */}

        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          ← Back to Dashboard
        </button>


        {/* ================================
            ERROR
        ================================= */}

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}


        {/* ================================
            EMPLOYEE HEADER
        ================================= */}

        <div className="employee-header">
          <div>
            <h1>
              {employee?.name || "Employee"}
            </h1>

            <p>
              {employee?.employeeId || "-"} •{" "}
              {employee?.department || "-"} •{" "}
              {employee?.designation || "-"}
            </p>
          </div>

          <span
            className={`status ${getStatusClass(
              offboarding?.status
            )}`}
          >
            {offboarding?.status || "Unknown"}
          </span>
        </div>


        {/* ================================
            OFFBOARDING INFORMATION
        ================================= */}

        <div className="details-card">
          <h2>Offboarding Information</h2>

          <div className="info-grid">

            <div>
              <span>Employee</span>
              <strong>
                {employee?.name || "-"}
              </strong>
            </div>

            <div>
              <span>Employee ID</span>
              <strong>
                {employee?.employeeId || "-"}
              </strong>
            </div>

            <div>
              <span>Email</span>
              <strong>
                {employee?.email || "-"}
              </strong>
            </div>

            <div>
              <span>Department</span>
              <strong>
                {employee?.department || "-"}
              </strong>
            </div>

            <div>
              <span>Designation</span>
              <strong>
                {employee?.designation || "-"}
              </strong>
            </div>

            <div>
              <span>Manager</span>
              <strong>
                {employee?.manager || "-"}
              </strong>
            </div>

            <div>
              <span>Resignation Date</span>
              <strong>
                {offboarding?.resignationDate
                  ? new Date(
                      offboarding.resignationDate
                    ).toLocaleDateString()
                  : "-"}
              </strong>
            </div>

            <div>
              <span>Last Working Day</span>
              <strong>
                {offboarding?.lastWorkingDay
                  ? new Date(
                      offboarding.lastWorkingDay
                    ).toLocaleDateString()
                  : "-"}
              </strong>
            </div>

            <div>
              <span>Reason</span>
              <strong>
                {offboarding?.reason || "-"}
              </strong>
            </div>

          </div>
        </div>


        {/* ================================
            WORKFLOW PROGRESS
        ================================= */}

        <div className="details-card">

          <div className="progress-heading">

            <div>
              <h2>Workflow Progress</h2>

              <p>
                {completedStages} /{" "}
                {totalStages} stages completed
              </p>
            </div>

            <strong>
              {progressPercentage}%
            </strong>

          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>

        </div>


        {/* ================================
            APPROVAL WORKFLOW
        ================================= */}

        <div className="details-card">

          <h2>Approval Workflow</h2>

          <div className="stage-list">

            {stages.map((stage) => (

              <div
                className={`stage ${
                  stage.status
                    ? stage.status.toLowerCase()
                    : ""
                }`}
                key={stage._id}
              >

                <div className="stage-number">

                  {stage.status === "Approved"
                    ? "✓"
                    : stage.status === "Rejected"
                    ? "!"
                    : stage.order}

                </div>

                <div className="stage-info">

                  <strong>
                    {stage.name}
                  </strong>

                  <span>
                    {stage.role} •{" "}
                    {stage.mode}
                  </span>

                  {stage.approver && (
                    <span>
                      Approved by:{" "}
                      {stage.approver.name}
                    </span>
                  )}

                </div>

                <span className="stage-status">
                  {stage.status}
                </span>

              </div>

            ))}

          </div>

        </div>


        {/* ================================
            ACTIVE STAGE
        ================================= */}

        {activeStage && (

          <div className="details-card">

            <h2>
              Active Stage:{" "}
              {activeStage.name}
            </h2>

            <p>
              Complete all required checklist
              items before approving this stage.
            </p>


            <div className="checklist">

              {activeStage.checklist.map(
                (item) => (

                  <label
                    className="check-item"
                    key={item._id}
                  >

                    <input
                      type="checkbox"

                      checked={
                        checklist[item.item] !==
                        undefined
                          ? checklist[item.item]
                          : item.completed
                      }

                      onChange={() =>
                        toggleChecklist(
                          item.item
                        )
                      }
                    />

                    <span>
                      {item.item}
                    </span>

                  </label>

                )
              )}

            </div>


            <textarea
              className="remarks-input"
              placeholder="Add remarks..."
              value={remarks}
              onChange={(event) =>
                setRemarks(
                  event.target.value
                )
              }
            />


            <div className="approval-actions">

              <button
                className="reject-button"
                disabled={processing}
                onClick={() =>
                  handleApproval("reject")
                }
              >
                {processing
                  ? "Processing..."
                  : "Reject"}
              </button>


              <button
                className="approve-button"
                disabled={processing}
                onClick={() =>
                  handleApproval("approve")
                }
              >
                {processing
                  ? "Processing..."
                  : "Approve Stage"}
              </button>

            </div>

          </div>

        )}


        {/* ================================
            ACCESS REVOCATION
        ================================= */}

        <div className="details-card">

          <h2>Access Revocation</h2>

          <p
            style={{
              color: "#667085",
              fontSize: "14px",
            }}
          >
            Admin & Systems can record the
            employee's email and system access
            revocation.
          </p>


          <div className="checklist">

            {/* EMAIL */}

            <label className="check-item">

              <input
                type="checkbox"

                checked={emailRevoked}

                onChange={(event) => {
                  setEmailRevoked(
                    event.target.checked
                  );

                  setAccessSuccess("");
                  setError("");
                }}
              />

              <span>
                Email access revoked
              </span>

            </label>


            {/* SYSTEM */}

            <label className="check-item">

              <input
                type="checkbox"

                checked={systemRevoked}

                onChange={(event) => {
                  setSystemRevoked(
                    event.target.checked
                  );

                  setAccessSuccess("");
                  setError("");
                }}
              />

              <span>
                System access revoked
              </span>

            </label>

          </div>


          {/* REMARKS */}

          <textarea
            className="remarks-input"
            placeholder="Add access revocation remarks..."
            value={accessRemarks}
            onChange={(event) =>
              setAccessRemarks(
                event.target.value
              )
            }
          />


          {/* SUCCESS */}

          {accessSuccess && (
            <div
              style={{
                color: "#027a48",
                background: "#ecfdf3",
                padding: "10px 12px",
                borderRadius: "6px",
                marginBottom: "12px",
                fontSize: "14px",
              }}
            >
              {accessSuccess}
            </div>
          )}


          {/* BUTTON */}

          <button
            className="approve-button"

            disabled={
              revoking ||
              (!emailRevoked &&
                !systemRevoked)
            }

            onClick={
              handleAccessRevocation
            }
          >
            {revoking
              ? "Recording..."
              : "Record Access Revocation"}
          </button>

        </div>


        {/* ================================
            DOCUMENTS
        ================================= */}

        <div className="details-card">

          <h2>Documents</h2>

          <div className="document-buttons">

            <a
              href={`http://localhost:5000/api/documents/${id}/resignation-acceptance`}
              target="_blank"
              rel="noreferrer"
            >
              Resignation Acceptance
            </a>


            <a
              href={`http://localhost:5000/api/documents/${id}/noc`}
              target="_blank"
              rel="noreferrer"
            >
              NOC / Clearance
            </a>


            <a
              href={`http://localhost:5000/api/documents/${id}/experience-relieving`}
              target="_blank"
              rel="noreferrer"
            >
              Experience / Relieving
            </a>

          </div>

        </div>


        {/* ================================
            COMPLETED
        ================================= */}

        {workflow?.status ===
          "Completed" && (

          <div className="details-card">

            <h2>
              Offboarding Completed
            </h2>

            <p
              style={{
                color: "#027a48",
                margin: 0,
              }}
            >
              All workflow stages have
              been successfully completed.
            </p>

          </div>

        )}

      </div>
    </div>
  );
}

export default OffboardingDetails;