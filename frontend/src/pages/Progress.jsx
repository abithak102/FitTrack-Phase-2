
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Progress.css";
import ProgressComparison from "./ProgressComparison";


function Progress() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/progress/summary");
      setSummary(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load progress information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (loading) {
    return (
      <div className="progress-loading">
        Loading your fitness progress...
      </div>
    );
  }

  if (error) {
    return (
      <div className="progress-page">
        <h1>My Progress</h1>
        <p className="progress-error">{error}</p>
        <button onClick={fetchProgress}>Try Again</button>
      </div>
    );
  }

  const categories = summary.category_breakdown || [];

  const totalCategoryWorkouts = categories.reduce(
    (total, item) => total + item.count,
    0
  );

  return (
    <div className="progress-page">
      <div className="progress-header">
        <div>
          <h1>My Fitness Progress</h1>
          <p>Track your fitness journey and achievements.</p>
        </div>

        <button onClick={fetchProgress}>
          Refresh Progress
        </button>
      </div>

      {/* STATISTICS CARDS */}

      <div className="progress-stats">
        <div className="progress-card">
          <span className="progress-icon">🏋️</span>
          <h3>Total Workouts</h3>
          <h2>{summary.total_workouts}</h2>
          <p>Workouts completed</p>
        </div>

        <div className="progress-card">
          <span className="progress-icon">🔥</span>
          <h3>Calories Burned</h3>
          <h2>
            {Number(summary.total_calories).toLocaleString()}
          </h2>
          <p>Total calories</p>
        </div>

        <div className="progress-card">
          <span className="progress-icon">⏱️</span>
          <h3>Workout Duration</h3>
          <h2>{summary.total_duration}</h2>
          <p>Total minutes</p>
        </div>
      </div>

      {/* CATEGORY BREAKDOWN */}

      <section className="category-section">
        <h2>Workout Category Breakdown</h2>
        <p className="category-subtitle">
          Your workout distribution by category.
        </p>

        {categories.length === 0 ? (
          <p>No workout category data available yet.</p>
        ) : (
          <div className="category-list">
            {categories.map((item) => {
              const percentage =
                totalCategoryWorkouts > 0
                  ? (item.count / totalCategoryWorkouts) * 100
                  : 0;

              return (
                <div className="category-item" key={item.category}>
                  <div className="category-info">
                    <strong>{item.category}</strong>
                    <span>{item.count} workouts</span>
                  </div>

                  <div className="category-bar">
                    <div
                      className="category-fill"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <p>{percentage.toFixed(1)}%</p>
                </div>
              );
            })}
          </div>
        )}
            </section>

      {/* WEEKLY AND MONTHLY COMPARISON */}

      <ProgressComparison />

    </div>
  );
}

export default Progress;