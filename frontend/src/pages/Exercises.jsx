import { useEffect, useState } from "react";
import api from "../services/api";
import "./Exercises.css";

function Exercises() {
  const [exercises, setExercises] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "Cardio",
    description: "",
    duration: "",
  });

  async function loadExercises() {
    try {
      setError("");

      const response = await api.get("/exercises/", {
        params: {
          search: search || undefined,
          category: category || undefined,
        },
      });

      setExercises(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to load exercises."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExercises();
  }, [search, category]);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/exercises/", {
        ...form,
        duration: Number(form.duration),
      });

      setMessage("Exercise added successfully!");

      setForm({
        name: "",
        category: "Cardio",
        description: "",
        duration: "",
      });

      await loadExercises();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to add exercise."
      );
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this exercise?")) return;

    try {
      await api.delete(`/exercises/${id}`);
      setMessage("Exercise deleted successfully!");
      await loadExercises();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Unable to delete exercise."
      );
    }
  }

  return (
    <div className="exercise-page">
      <header className="exercise-header">
        <div>
          <h1>Exercise Library</h1>
          <p>Explore and manage your fitness exercises.</p>
        </div>

        <a href="/dashboard" className="exercise-back">
          Back to Dashboard
        </a>
      </header>

      {message && <p className="exercise-success">{message}</p>}
      {error && <p className="exercise-error">{error}</p>}

      <section className="exercise-form-card">
        <h2>Add New Exercise</h2>

        <form onSubmit={handleSubmit}>
          <label>Exercise Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Example: Running"
            minLength="2"
            maxLength="120"
            required
          />

          <label>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
          >
            <option value="Cardio">Cardio</option>
            <option value="Strength">Strength</option>
            <option value="Yoga">Yoga</option>
          </select>

          <label>Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe the exercise"
            maxLength="500"
            rows="3"
          />

          <label>Duration (minutes)</label>
          <input
            type="number"
            name="duration"
            value={form.duration}
            onChange={handleChange}
            min="1"
            max="300"
            required
          />

          <button type="submit">Add Exercise</button>
        </form>
      </section>

      <section className="exercise-list-section">
        <h2>Available Exercises</h2>

        <div className="exercise-filters">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exercises..."
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Cardio">Cardio</option>
            <option value="Strength">Strength</option>
            <option value="Yoga">Yoga</option>
          </select>
        </div>

        {loading ? (
          <p>Loading exercises...</p>
        ) : exercises.length === 0 ? (
          <p className="exercise-empty">No exercises found.</p>
        ) : (
          <div className="exercise-grid">
            {exercises.map((exercise) => (
              <article className="exercise-card" key={exercise.id}>
                <span className="exercise-category">
                  {exercise.category}
                </span>

                <h3>{exercise.name}</h3>

                <p>
                  {exercise.description || "No description available."}
                </p>

                <strong>{exercise.duration} minutes</strong>

                <button
                  className="exercise-delete"
                  onClick={() => handleDelete(exercise.id)}
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Exercises;