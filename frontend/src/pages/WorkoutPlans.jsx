import { useEffect, useState } from "react";
import api from "../services/api";
import "./WorkoutPlans.css";

function WorkoutPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    scheduled_date: "",
  });

  async function loadPlans() {
    try {
      setError("");
      const response = await api.get("/workout-plans/");
      setPlans(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load workout plans."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function resetForm() {
    setForm({
      title: "",
      description: "",
      scheduled_date: "",
    });
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      if (editingId) {
        await api.patch(`/workout-plans/${editingId}`, form);
        setMessage("Workout plan updated successfully!");
      } else {
        await api.post("/workout-plans/", form);
        setMessage("Workout plan created successfully!");
      }

      resetForm();
      await loadPlans();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to save workout plan."
      );
    }
  }

  function handleEdit(plan) {
    setEditingId(plan.id);
    setForm({
      title: plan.title,
      description: plan.description || "",
      scheduled_date: plan.scheduled_date,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this workout plan?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await api.delete(`/workout-plans/${id}`);
      setMessage("Workout plan deleted successfully!");
      await loadPlans();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to delete workout plan."
      );
    }
  }

  return (
    <div className="plans-page">
      <header className="plans-header">
        <div>
          <h1>Workout Planner</h1>
          <p>Plan your workouts and stay consistent with your fitness goals.</p>
        </div>
        <a href="/dashboard" className="plans-back">
          Back to Dashboard
        </a>
      </header>

      <section className="plans-form-card">
        <h2>{editingId ? "Update Workout Plan" : "Create Workout Plan"}</h2>

        {message && <p className="plans-success">{message}</p>}
        {error && <p className="plans-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label>Workout Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Example: Morning Cardio"
            minLength="2"
            maxLength="120"
            required
          />

          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your planned workout"
            maxLength="500"
            rows="3"
          />

          <label>Scheduled Date</label>
          <input
            type="date"
            name="scheduled_date"
            value={form.scheduled_date}
            onChange={handleChange}
            required
          />

          <div className="plans-form-actions">
            <button type="submit">
              {editingId ? "Update Plan" : "Add Workout Plan"}
            </button>

            {editingId && (
              <button
                type="button"
                className="plans-cancel"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="plans-list-section">
        <div className="plans-list-heading">
          <h2>My Workout Plans</h2>
          <span>{plans.length} Plans</span>
        </div>

        {loading ? (
          <p>Loading workout plans...</p>
        ) : plans.length === 0 ? (
          <div className="plans-empty">
            <h3>No workout plans yet</h3>
            <p>Create your first workout plan using the form above.</p>
          </div>
        ) : (
          <div className="plans-grid">
            {plans.map((plan) => (
              <article className="plan-card" key={plan.id}>
                <div className="plan-card-top">
                  <span className="plan-icon">🏋️</span>
                  <span className="plan-date">
                    {new Date(
                      `${plan.scheduled_date}T00:00:00`
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h3>{plan.title}</h3>

                <p className="plan-description">
                  {plan.description || "No description provided."}
                </p>

                <div className="plan-actions">
                  <button onClick={() => handleEdit(plan)}>
                    Edit
                  </button>

                  <button
                    className="plan-delete"
                    onClick={() => handleDelete(plan.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default WorkoutPlans;