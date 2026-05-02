import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import RecipeDetail from "./RecipeDetail.jsx";
import "./FYP.css";

function Card({id, category, title, image }) {


  return (
    <div className="d-card">
      <img className="d-card-img" src={image} alt={title} />
      <div className="d-card-body">
        <div className="d-card-cat">{category}</div>
        <div className="d-card-title">{title}</div>
      </div>
    </div>
  );
}

export default function Discover() {

    const [selectedId, setSelectedId] = useState(null);
  const { accessToken } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);


  useEffect(() => {
  fetchDiscover();
}, [accessToken]);

function fetchDiscover() {
  if (!accessToken) return;
  setLoading(true);
  setError(false);

  fetch("https://foodle-back-end.onrender.com/meals/Discover/", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => { setItems(data.meals); setLoading(false); })
    .catch(() => { setError(true); setLoading(false); });
}

    function handleRefresh() {
  fetchDiscover();
}

    if (selectedId) {
    return <RecipeDetail mealId={selectedId} onBack={() => setSelectedId(null)} />;
  }

  return (
    <section className="discover-section">
<div className="discover-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
  <h1 className="discover-title">Discover <span>recipes</span></h1>
  <button
    className={`fyp-refresh${loading ? " spinning" : ""}`}
    onClick={handleRefresh}
    disabled={loading}
  >
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5" strokeLinecap="round" />
      <path d="M8 1v3.5L10.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    Refresh
  </button>
</div>

      <div className="discover-grid">
        {loading && <p className="discover-status">Loading...</p>}
        {error   && <p className="discover-status">Something went wrong. Please try again.</p>}
        {!loading && !error && items.length === 0 && (
          <p className="discover-status">No recipes found.</p>
        )}
        {!loading && !error && items.map((item, index) => (
          <div onClick={() => setSelectedId(item.idMeal)}>
          <Card
            id={item.idMeal}
            title={item.strMeal}
            category={item.strCategory}
            image={item.strMealThumb}
          /> </div>
          
        ))}
      </div>
    </section>
  );
}
