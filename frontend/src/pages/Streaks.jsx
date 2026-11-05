
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Streaks.css";

function Streaks() {
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStreak = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/streaks/summary");
      setStreak(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to load workout streak information."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreak();
  }, []);

  const formatDate = (value) => {
    if (!value) return "No workouts yet";

    return new Date(value + "T00:00:00").toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  if (loading) {
    return (
      <div className="streak-loading">
        Loading your workout streak...
      </div>
    );
  }

  if (error) {
    return (
      <div className="streak-page">
        <h1>Workout Streaks</h1>
        <p className="streak-error">{error}</p>
        <button onClick={fetchStreak}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="streak-page">

      <div className="streak-header">
        <div>
          <h1>Workout Streaks</h1>
          <p>
            Stay consistent and build healthy workout habits.
          </p>
        </div>

        <button onClick={fetchStreak}>
          Refresh Streak
        </button>
      </div>

      <div className="streak-grid">

        <div className="streak-card current-streak">
          <div className="streak-icon">🔥</div>
          <h3>Current Streak</h3>
          <div className="streak-number">
            {streak.current_streak}
          </div>
          <p>Consecutive workout days</p>
        </div>

        <div className="streak-card longest-streak">
          <div className="streak-icon">🏆</div>
          <h3>Longest Streak</h3>
          <div className="streak-number">
            {streak.longest_streak}
          </div>
          <p>Best workout streak achieved</p>
        </div>

        <div className="streak-card last-workout">
          <div className="streak-icon">📅</div>
          <h3>Last Workout</h3>
          <div className="streak-date">
            {formatDate(streak.last_workout_date)}
          </div>
          <p>Your most recent workout date</p>
        </div>

      </div>

      <section className="streak-message">
        <h2>Keep Moving Forward!</h2>

        {streak.current_streak > 0 ? (
          <p>
            Great job! You have maintained a streak of{" "}
            <strong>{streak.current_streak} days.</strong>
            {" "}Keep it going!
          </p>
        ) : (
          <p>
            Start your fitness journey today.
            Complete a workout to begin your streak!
          </p>
        )}
      </section>

    </div>
  );
}

export default Streaks;
