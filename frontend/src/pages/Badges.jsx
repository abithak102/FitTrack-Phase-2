
import { useEffect, useState } from "react";
import api from "../services/api";
import "./Badges.css";

function Badges() {
  const [badgeData, setBadgeData] = useState({
    total_badges: 0,
    earned_badges: 0,
    badges: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/badges/summary");
      setBadgeData(response.data);
    } catch (err) {
      console.error("Badge loading error:", err);
      setError(
        err.response?.data?.detail ||
        "Unable to load achievement badges."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="badges-page">
        <p className="badges-loading">Loading achievements...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="badges-page">
        <div className="badges-error">{error}</div>
        <button onClick={fetchBadges}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="badges-page">
      <div className="badges-header">
        <div>
          <h1>Achievement Badges 🏆</h1>
          <p>Celebrate your fitness milestones and achievements.</p>
        </div>

        <button
          className="badges-refresh"
          onClick={fetchBadges}
        >
          Refresh
        </button>
      </div>

      <div className="badges-stats">
        <div className="badge-stat-card">
          <h3>Total Badges</h3>
          <h2>{badgeData.total_badges}</h2>
        </div>

        <div className="badge-stat-card">
          <h3>Earned Badges</h3>
          <h2>{badgeData.earned_badges}</h2>
        </div>

        <div className="badge-stat-card">
          <h3>Remaining</h3>
          <h2>
            {badgeData.total_badges - badgeData.earned_badges}
          </h2>
        </div>
      </div>

      <div className="badges-section">
        <h2>Your Achievements</h2>

        <div className="badges-grid">
          {badgeData.badges.map((badge) => (
            <div
              className={`badge-card ${
                badge.earned ? "earned" : "locked"
              }`}
              key={badge.id}
            >
              <div className="badge-icon">
                {badge.icon}
              </div>

              <h3>{badge.name}</h3>

              <p>{badge.description}</p>

              <div className="badge-requirement">
                Target: {badge.requirement_value}{" "}
                {badge.requirement_type}
              </div>

              <span
                className={`badge-status ${
                  badge.earned ? "status-earned" : "status-locked"
                }`}
              >
                {badge.earned ? "✓ Earned" : "🔒 Locked"}
              </span>

              {badge.earned && badge.earned_at && (
                <small className="badge-date">
                  Earned:{" "}
                  {new Date(badge.earned_at).toLocaleDateString()}
                </small>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Badges;
