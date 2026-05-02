import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import "./Liked.css";
import RecipeDetail from "./RecipeDetail.jsx";

function Card({ item, onClick }) {
  return (
    <div className="d-card">
      <img
        className="d-card-img"
        src={item.image}
        alt={item.title}
        style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
      />
      <div className="d-card-body">
        <div className="d-card-cat">{item.category}</div>
        <div className="d-card-title">{item.title}</div>
        <div className="d-card-meta">
          <span>{item.area}</span>
        </div>
      </div>
    </div>
  );
}

export default function Liked() {

  const [selectedId, setSelectedId] = useState(null);
  const { accessToken } = useAuth();
  const [items, setItems]         = useState([]);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);

  function fetchLiked(currentPage) {
    if (!accessToken) return;

    setLoading(true);
    setError(false);

    fetch(`https://foodle-back-end.onrender.com/interactions/liked/?page=${currentPage}`, {
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
        if (Array.isArray(data)) {
          setItems(data);
          setTotalPages(1);
        } else {
          setItems(data.results ?? []);
          setTotalPages(data.total_pages ?? 1);
        }
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }

  useEffect(() => {
    fetchLiked(1);
  }, [accessToken]);

  function handlePageChange(p) {
    setPage(p);
    fetchLiked(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

    if (selectedId) {
      return <RecipeDetail mealId={selectedId} onBack={() => setSelectedId(null)} />;
    }
  

  return (
    <section className="liked-section">

      <div className="liked-header">
        <h1 className="liked-title">
          Liked <span>recipes</span>
        </h1>
        {!loading && !error && items.length > 0 && (
          <p className="liked-sub">
            {items.length} meal{items.length !== 1 ? "s" : ""} liked
            {totalPages > 1 && ` — page ${page} of ${totalPages}`}
          </p>
        )}
      </div>

      <div className="liked-grid">
        {loading && <p className="liked-status">Loading...</p>}
        {error   && <p className="liked-status">Something went wrong. Please try again.</p>}
        {!loading && !error && items.length === 0 && (
          <p className="liked-status">No liked recipes yet. Start exploring and like what you love.</p>
        )}
        {!loading && !error && items.map((item, i) => (
          <div onClick={() => setSelectedId(item.id)}>
          <Card key={item.id ?? i} item={item} />
          </div>
        ))}
      </div>

      {!loading && !error && totalPages > 1 && (
        <div className="liked-pagination">
          <button
            className="page-btn"
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
          >‹</button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`page-btn${p === page ? " active" : ""}`}
              onClick={() => handlePageChange(p)}
            >{p}</button>
          ))}

          <button
            className="page-btn"
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
          >›</button>
        </div>
      )}

    </section>
  );
}
