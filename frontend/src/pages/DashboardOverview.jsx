import { useEffect, useState } from "react";
import api from "../services/api";
import "./DashboardOverview.css";

function DashboardOverview() {
  const [data, setData] = useState({
    analytics: null,
    streaks: null,
    goals: [],
    upcoming: [],
    badges: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        analytics,
        streaks,
        goals,
        upcoming,
        badges,
      ] = await Promise.all([
        api.get("/analytics/overview"),
        api.get("/streaks/summary"),
        api.get("/goals/"),
        api.get("/workout-plans/upcoming"),
        api.get("/badges/summary"),
      ]);

      setData({
        analytics: analytics.data,
        streaks: streaks.data,
        goals: goals.data,
        upcoming: upcoming.data,
        badges: badges.data,
      });
    } catch (err) {
      console.error("Dashboard overview error:", err);
      setError("Unable to load dashboard overview.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="overview-loading">
        Loading your fitness overview...
      </div>
    );
  }

  if (error) {
    return (
      <div className="overview-error">
        <p>{error}</p>
        <button onClick={loadOverview}>Try Again</button>
      </div>
    );
  }

  const completedGoals = data.goals.filter(
    (goal) => goal.status === "COMPLETED"
  ).length;

  return (
    <section className="dashboard-overview">
      <div className="overview-heading">
        <div>
          <h2>Fitness Overview</h2>
          <p>Your fitness activity at a glance.</p>
        </div>

        <button onClick={loadOverview} className="overview-refresh">
          Refresh
        </button>
      </div>

      <div className="overview-stats">

        <div className="overview-card">
          <span>💪</span>
          <h3>Total Workouts</h3>
          <h2>{data.analytics.total_workouts}</h2>
        </div>

        <div className="overview-card">
          <span>🔥</span>
          <h3>Calories Burned</h3>
          <h2>{data.analytics.total_calories}</h2>
        </div>

        <div className="overview-card">
          <span>⚡</span>
          <h3>Current Streak</h3>
          <h2>{data.streaks.current_streak} Days</h2>
        </div>

        <div className="overview-card">
          <span>🎯</span>
          <h3>Completed Goals</h3>
          <h2>
            {completedGoals}/{data.goals.length}
          </h2>
        </div>

        <div className="overview-card">
          <span>🏆</span>
          <h3>Earned Badges</h3>
          <h2>
            {data.badges.earned_badges}/
            {data.badges.total_badges}
          </h2>
        </div>

      </div>

      <div className="overview-bottom">

        <div className="overview-panel">
          <h3>Upcoming Workouts</h3>

          {data.upcoming.length === 0 ? (
            <p>No upcoming workouts scheduled.</p>
          ) : (
            data.upcoming.slice(0, 5).map((plan) => (
              <div className="overview-item" key={plan.id}>
                <strong>{plan.title}</strong>
                <span>
                  {new Date(
                    plan.scheduled_date + "T00:00:00"
                  ).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="overview-panel">
          <h3>Workout Summary</h3>

          <p>
            Total Duration:{" "}
            <strong>
              {data.analytics.total_duration} minutes
            </strong>
          </p>

          <p>
            Longest Streak:{" "}
            <strong>
              {data.streaks.longest_streak} days
            </strong>
          </p>

          <p>
            Remaining Goals:{" "}
            <strong>
              {data.goals.length - completedGoals}
            </strong>
          </p>
        </div>

      </div>
    </section>
  );
}

export default DashboardOverview;