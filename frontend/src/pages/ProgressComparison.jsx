import { useEffect, useState } from "react";
import api from "../services/api";
import "./ProgressComparison.css";

function ComparisonCards({ title, data }) {
  if (!data) return null;

  const items = [
    {
      label: "Workouts",
      current: data.current_period.total_workouts,
      previous: data.previous_period.total_workouts,
      change: data.comparison.workouts_change,
    },
    {
      label: "Duration (minutes)",
      current: data.current_period.total_duration,
      previous: data.previous_period.total_duration,
      change: data.comparison.duration_change,
    },
    {
      label: "Calories Burned",
      current: data.current_period.total_calories,
      previous: data.previous_period.total_calories,
      change: data.comparison.calories_change,
    },
  ];

  return (
    <section className="comparison-section">
      <h2>{title}</h2>

      <div className="comparison-grid">
        {items.map((item) => (
          <article className="comparison-card" key={item.label}>
            <h3>{item.label}</h3>

            <div className="comparison-current">
              {Number(item.current).toLocaleString()}
            </div>

            <p className="comparison-previous">
              Previous: {Number(item.previous).toLocaleString()}
            </p>

            <p
              className={`comparison-change ${
                item.change > 0
                  ? "comparison-positive"
                  : item.change < 0
                  ? "comparison-negative"
                  : "comparison-neutral"
              }`}
            >
              {item.change > 0 ? "+" : ""}
              {Number(item.change).toLocaleString()}
              {" "}compared to previous period
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}


function ProgressComparison() {
  const [weekly, setWeekly] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchComparison() {
    try {
      setLoading(true);
      setError("");

      const [weeklyResponse, monthlyResponse, trendsResponse] =
        await Promise.all([
          api.get("/progress-comparison/weekly"),
          api.get("/progress-comparison/monthly"),
          api.get("/progress-comparison/trends"),
        ]);

      setWeekly(weeklyResponse.data);
      setMonthly(monthlyResponse.data);
      setTrends(trendsResponse.data.trends || []);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load progress comparison."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComparison();
  }, []);

  if (loading) {
    return <p>Loading progress comparison...</p>;
  }

  if (error) {
    return (
      <div className="comparison-error">
        {error}
        <button onClick={fetchComparison}>Try Again</button>
      </div>
    );
  }

  const maxWorkouts = Math.max(
    ...trends.map((item) => item.total_workouts),
    1
  );

  return (
    <div className="progress-comparison">
      <ComparisonCards title="Weekly Comparison" data={weekly} />

      <ComparisonCards title="Monthly Comparison" data={monthly} />

      <section className="trend-section">
        <h2>Workout Trends - Last 30 Days</h2>

        {trends.length === 0 ? (
          <p className="comparison-empty">
            No workout trends available yet.
          </p>
        ) : (
          <div className="trend-list">
            {trends.map((item) => (
              <div className="trend-item" key={item.date}>
                <span className="trend-date">{item.date}</span>

                <div className="trend-bar">
                  <div
                    className="trend-fill"
                    style={{
                      width: `${
                        (item.total_workouts / maxWorkouts) * 100
                      }%`,
                    }}
                  />
                </div>

                <span className="trend-value">
                  {item.total_workouts} workouts
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <button onClick={fetchComparison}>
        Refresh Comparison
      </button>
    </div>
  );
}

export default ProgressComparison;