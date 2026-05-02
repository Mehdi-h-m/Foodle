import { useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

function Card({ category, title, image }) {
  return (
    <div className="d-card fade-up">
      <div className="d-card-img">
        <img src={image} alt={title} />
      </div>

      <div className="d-card-body">
        <div className="d-card-cat">{category}</div>
        <div className="d-card-title">{title}</div>
      </div>
    </div>
  );
}

function FeedPage({ type }) {
  const { accessToken } = useAuth();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const getEndpoint = () => {
    switch (type) {
      case "fyp":
        return "/meals/fyp/";
      case "liked":
        return "/meals/liked/";
      case "search":
        return `/meals/search/?q=${query}`;
      default:
        return "/meals/Discover/";
    }
  };

  const fetchData = () => {
    if (!accessToken) return;

    setLoading(true);

    fetch(`https://foodle-back-end.onrender.com${getEndpoint()}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (type !== "search") {
      fetchData();
    }
  }, [type, accessToken]);

  // 🔍 Search trigger
  const handleSearch = () => {
    if (query.trim() === "") return;
    fetchData();
  };

  return (
    <section className="discover">
      <h2>{type.toUpperCase()}</h2>

      {type === "search" && (
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Search meals..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="discover-grid">
          {items.map((item, index) => (
            <Card
              key={index}
              title={item.title}
              category={item.category}
              image={item.image}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default FeedPage;