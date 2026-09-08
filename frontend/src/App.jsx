import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import OffboardingDetails from "./pages/OffboardingDetails";
import { getOffboardings } from "./services/api";
import InitiateOffboarding from "./pages/InitiateOffboarding";
import "./App.css";

function Dashboard() {
  const navigate = useNavigate();

  const [offboardings, setOffboardings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOffboardings = async () => {
      try {
        const data = await getOffboardings();

        setOffboardings(data.data || data);
      } catch (err) {
        console.error(err);
        setError("Failed to load offboarding records");
      } finally {
        setLoading(false);
      }
    };

    fetchOffboardings();
  }, []);

  const total = offboardings.length;

  const completed = offboardings.filter(
    (item) => item.status === "Completed"
  ).length;

  const inProgress = offboardings.filter(
    (item) => item.status === "In Progress"
  ).length;

  const initiated = offboardings.filter(
    (item) => item.status === "Initiated"
  ).length;

  const getStatusClass = (status) => {
    switch (status) {
      case "Completed":
        return "status completed";

      case "In Progress":
        return "status progress";

      case "Rejected":
        return "status rejected";

      case "Cancelled":
        return "status cancelled";

      default:
        return "status initiated";
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Employee Offboarding</h1>

          <p>
            HR Offboarding Management System
          </p>
        </div>

        <button
          className="primary-button"
          onClick={() => navigate("/initiate")}
        >
          + Initiate Offboarding
        </button>
      </header>

      <section className="summary-grid">
        <div className="summary-card">
          <span>Total Offboardings</span>
          <strong>{total}</strong>
        </div>

        <div className="summary-card">
          <span>Initiated</span>
          <strong>{initiated}</strong>
        </div>

        <div className="summary-card">
          <span>In Progress</span>
          <strong>{inProgress}</strong>
        </div>

        <div className="summary-card">
          <span>Completed</span>
          <strong>{completed}</strong>
        </div>
      </section>

      <main className="content">
        <div className="section-header">
          <div>
            <h2>Offboarding Requests</h2>

            <p>
              Track employee offboarding progress and approvals.
            </p>
          </div>
        </div>

        {loading && (
          <div className="message">
            Loading offboarding records...
          </div>
        )}

        {error && (
          <div className="message error">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="table-container">
            {offboardings.length === 0 ? (
              <div className="message">
                No offboarding records found.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Department</th>
                    <th>Resignation Date</th>
                    <th>Last Working Day</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {offboardings.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <strong>
                          {item.employee?.name || "Unknown"}
                        </strong>

                        <small>
                          {item.employee?.email || ""}
                        </small>
                      </td>

                      <td>
                        {item.employee?.employeeId || "-"}
                      </td>

                      <td>
                        {item.employee?.department || "-"}
                      </td>

                      <td>
                        {item.resignationDate
                          ? new Date(
                              item.resignationDate
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        {item.lastWorkingDay
                          ? new Date(
                              item.lastWorkingDay
                            ).toLocaleDateString()
                          : "-"}
                      </td>

                      <td>
                        <span
                          className={getStatusClass(
                            item.status
                          )}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td>
                        <button
                          className="view-button"
                          onClick={() =>
                            navigate(
                              `/offboarding/${item._id}`
                            )
                          }
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />

        <Route
          path="/initiate"
          element={<InitiateOffboarding />}
        />

        <Route
          path="/offboarding/:id"
          element={<OffboardingDetails />}
        />
      </Routes>
    </BrowserRouter>
  );
}



export default App;