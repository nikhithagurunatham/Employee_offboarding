import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getEmployees,
  createOffboarding,
} from "../services/api";

function InitiateOffboarding() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  const [form, setForm] = useState({
    employee: "",
    resignationDate: "",
    lastWorkingDay: "",
    reason: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await getEmployees();

        setEmployees(data.data || data);
      } catch (err) {
        console.error(err);
        setError("Failed to load employees");
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadEmployees();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!form.employee) {
      setError("Please select an employee.");
      return;
    }

    if (!form.resignationDate) {
      setError("Please select the resignation date.");
      return;
    }

    if (!form.lastWorkingDay) {
      setError("Please select the last working day.");
      return;
    }

    try {
      setSubmitting(true);

      await createOffboarding({
        employee: form.employee,
        resignationDate: form.resignationDate,
        lastWorkingDay: form.lastWorkingDay,
        reason: form.reason,
      });

      navigate("/");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to create offboarding request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-container">
        <div className="form-header">
          <div>
            <button
              className="back-button"
              onClick={() => navigate("/")}
            >
              ← Back to Dashboard
            </button>

            <h1>Initiate Offboarding</h1>

            <p>
              Create a new employee offboarding request and start
              the approval workflow.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="offboarding-form">
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="form-section">
            <h2>Employee Information</h2>

            <div className="form-group">
              <label htmlFor="employee">
                Employee <span>*</span>
              </label>

              {loadingEmployees ? (
                <p className="loading-text">
                  Loading employees...
                </p>
              ) : (
                <select
                  id="employee"
                  name="employee"
                  value={form.employee}
                  onChange={handleChange}
                >
                  <option value="">
                    Select an employee
                  </option>

                  {employees.map((employee) => (
                    <option
                      key={employee._id}
                      value={employee._id}
                    >
                      {employee.name} — {employee.employeeId}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {form.employee && (
              <div className="employee-preview">
                {(() => {
                  const selectedEmployee = employees.find(
                    (employee) =>
                      employee._id === form.employee
                  );

                  if (!selectedEmployee) return null;

                  return (
                    <>
                      <div>
                        <span>Name</span>
                        <strong>
                          {selectedEmployee.name}
                        </strong>
                      </div>

                      <div>
                        <span>Department</span>
                        <strong>
                          {selectedEmployee.department}
                        </strong>
                      </div>

                      <div>
                        <span>Designation</span>
                        <strong>
                          {selectedEmployee.designation}
                        </strong>
                      </div>

                      <div>
                        <span>Manager</span>
                        <strong>
                          {selectedEmployee.manager || "-"}
                        </strong>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          <div className="form-section">
            <h2>Offboarding Details</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="resignationDate">
                  Resignation Date <span>*</span>
                </label>

                <input
                  id="resignationDate"
                  type="date"
                  name="resignationDate"
                  value={form.resignationDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastWorkingDay">
                  Last Working Day <span>*</span>
                </label>

                <input
                  id="lastWorkingDay"
                  type="date"
                  name="lastWorkingDay"
                  value={form.lastWorkingDay}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="reason">
                Reason / Details
              </label>

              <textarea
                id="reason"
                name="reason"
                value={form.reason}
                onChange={handleChange}
                placeholder="Enter resignation reason or additional details..."
                rows="5"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-button"
              disabled={submitting}
            >
              {submitting
                ? "Creating..."
                : "Create Offboarding"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InitiateOffboarding;