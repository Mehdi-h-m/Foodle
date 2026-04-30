import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import "./FYP.css";
import RecipeDetail from "./RecipeDetail.jsx";

function randomSeed() {
  return Math.floor(Math.random() * 1000000);
}

function Card({ item, onClick }) {
  return (
    <div className="d-card">
      <div className="d-card-img" style={{ position: "relative" }}>
        <img
          src={item.image}
          alt={item.title}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {item.exploration && (
          <span className="fyp-explore-badge">New for you</span>
        )}
      </div>
      <div className="d-card-body">
        <div className="d-card-title">{item.title}</div>
      </div>
    </div>
  );
}

export default function FYP() {
  const [selectedId, setSelectedId] = useState(null);
  const { accessToken } = useAuth();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [seed, setSeed]       = useState(randomSeed);

  const fetchFYP = useCallback((currentSeed) => {
    if (!accessToken) return;

    setLoading(true);
    setError(false);

    fetch(`https://foodle-back-end.onrender.com/meals/recommendations/?seed=${currentSeed}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => { setItems(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [accessToken]);

  useEffect(() => {
    fetchFYP(seed);
  }, [accessToken]);

  function handleRefresh() {
    const newSeed = randomSeed();
    setSeed(newSeed);
    fetchFYP(newSeed);
  }

      if (selectedId) {
      return <RecipeDetail mealId={selectedId} onBack={() => setSelectedId(null)} />;
    }
  

  return (
    <section className="fyp-section">

      <div className="fyp-header">
        <div>
          <h1 className="fyp-title">For <span>you</span></h1>
          <p className="fyp-sub">Personalised picks based on what you like and watch.</p>
        </div>

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

      <div className="fyp-grid">
        {loading && <p className="fyp-status">Loading your feed...</p>}
        {error   && <p className="fyp-status">Something went wrong. Please try again.</p>}
        {!loading && !error && items.length === 0 && (
          <p className="fyp-status">Nothing to show yet. Start liking and viewing recipes!</p>
        )}
        {!loading && !error && items.map((item, i) => (
          <div onClick={() => setSelectedId(item.id)}>
          <Card key={item.id ?? i} item={item} />
          </div>
        ))}
      </div>

    </section>
  );
}
