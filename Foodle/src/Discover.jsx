import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

function Card({id, category, title, image }) {
  console.log(id, category, title, image);
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
  const { accessToken } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!accessToken) return;

    setLoading(true);
    setError(false);
    fetch("https://foodle-back-end.onrender.com/meals/Discover/", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setItems(data.meals);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [accessToken]);

  return (
    <section className="discover-section">
      <div className="discover-header">
        <h1 className="discover-title">
          Discover <span>recipes</span>
        </h1>
      </div>

      <div className="discover-grid">
        {loading && <p className="discover-status">Loading...</p>}
        {error   && <p className="discover-status">Something went wrong. Please try again.</p>}
        {!loading && !error && items.length === 0 && (
          <p className="discover-status">No recipes found.</p>
        )}
        {!loading && !error && items.map((item, index) => (
          <Card
            id={item.idMeal}
            title={item.strMeal}
            category={item.strCategory}
            image={item.strMealThumb}
          />
        ))}
      </div>
    </section>
  );
}
