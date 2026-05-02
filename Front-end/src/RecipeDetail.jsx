import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import "./RecipeDetail.css";

function getYoutubeEmbed(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function getSteps(instructions) {
  if (!instructions) return [];
  return instructions
    .split(/\r\n|\n|\r/)
    .map(s => s.trim())
    .filter(Boolean);
}

export default function RecipeDetail({ mealId, onBack }) {
  const [liked, setLiked] = useState(false);
  const { accessToken } = useAuth();
  const [meal, setMeal]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    if (!accessToken || !mealId) return;

    setLoading(true);
    setError(false);

    fetch(`https://foodle-back-end.onrender.com/meals/${mealId}/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
  setMeal(data);
  setLiked(data.liked ?? false); 
  setLoading(false);

  // Auto-track view
  fetch("https://foodle-back-end.onrender.com/interactions/view/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ meal_id: mealId }),
  });
})
      .catch(() => { setError(true); setLoading(false); });
  }, [mealId, accessToken]);

  if (loading) return <div className="recipe-status">Loading...</div>;
  if (error)   return <div className="recipe-status">Something went wrong. Please try again.</div>;
  if (!meal)   return null;

  const steps    = getSteps(meal.instructions);
  const embedUrl = getYoutubeEmbed(meal.youtube);

  function toggleLike() {
  fetch("https://foodle-back-end.onrender.com/interactions/like/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ meal_id: mealId }),
  })
    .then(res => res.json())
    .then(data => setLiked(data.liked))
    .catch(err => console.error(err));
}

  return (
    <section className="recipe-section">

      <button className="recipe-back" onClick={onBack}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      {/* Hero */}
      <div className="recipe-hero">
        <img className="recipe-hero-img" src={meal.image} alt={meal.title} />

        <div className="recipe-hero-info">
          <div className="recipe-badge">
            <span className="recipe-cat">{meal.category}</span>
            <span className="recipe-dot" />
            <span className="recipe-area">{meal.area}</span>
          </div>
          <h1 className="recipe-title">{meal.title}</h1>
          <button
          className={`like-btn${liked ? " liked" : ""}`}
          onClick={toggleLike}
        >
          {liked ? "♥" : "♡"} {liked ? "Liked" : "Like"}
        </button>
        </div>
      </div>

      {/* Body */}
      <div className="recipe-body">

        {/* Ingredients */}
        <aside className="recipe-card">
          <h2 className="recipe-card-title">Ingredients</h2>
          <ul className="ingredient-list">
            {meal.ingredients.map((ing, i) => (
              <li key={i} className="ingredient-item">
                <span className="ingredient-name">{ing.name}</span>
                {ing.measure && (
                  <span className="ingredient-measure">{ing.measure}</span>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {/* Right column */}
        <div className="recipe-right">

          {/* Instructions */}
          <div>
            <h2 className="recipe-section-title">Instructions</h2>
            <ol className="steps-list">
              {steps.map((step, i) => (
                <li key={i} className="step-item">
                  <div className="step-number">{i + 1}</div>
                  <p className="step-text">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Video */}
          {embedUrl && (
            <div>
              <h2 className="recipe-section-title">Video</h2>
              <div className="recipe-video">
                <iframe
                  src={embedUrl}
                  title={meal.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
