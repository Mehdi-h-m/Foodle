import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import "./RecipeDetail.css";

function getIngredients(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const name    = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim()) {
      ingredients.push({ name: name.trim(), measure: measure ? measure.trim() : "" });
    }
  }
  return ingredients;
}

function getSteps(instructions) {
  if (!instructions) return [];
  return instructions
    .split(/\r\n|\n|\r/)
    .map(s => s.trim())
    .filter(Boolean);
}

function getYoutubeEmbed(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export default function RecipeDetail({ mealId, onBack }) {
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
      .then(data => { setMeal(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [mealId, accessToken]);

  if (loading) return <div className="recipe-status">Loading...</div>;
  if (error)   return <div className="recipe-status">Something went wrong. Please try again.</div>;
  if (!meal)   return null;

  const ingredients  = getIngredients(meal);
  const steps        = getSteps(meal.strInstructions);
  const embedUrl     = getYoutubeEmbed(meal.strYoutube);

  return (
    <section className="recipe-section">

      {/* Back button */}
      <button className="recipe-back" onClick={onBack}>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to Discover
      </button>

      {/* Hero */}
      <div className="recipe-hero">
        <img
          className="recipe-hero-img"
          src={meal.strMealThumb}
          alt={meal.strMeal}
        />

        <div className="recipe-hero-info">
          <div className="recipe-badge">
            <span className="recipe-cat">{meal.strCategory}</span>
            <span className="recipe-dot" />
            <span className="recipe-area">{meal.strArea}</span>
          </div>

          <h1 className="recipe-title">{meal.strMeal}</h1>

          {meal.strSource && (
            <a
              className="recipe-source-link"
              href={meal.strSource}
              target="_blank"
              rel="noreferrer"
            >
              View original recipe
            </a>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="recipe-body">

        {/* Ingredients sidebar */}
        <aside className="recipe-card">
          <h2 className="recipe-card-title">Ingredients</h2>
          <ul className="ingredient-list">
            {ingredients.map((ing, i) => (
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

          {/* Steps */}
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
                  title={meal.strMeal}
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
