import { useEffect, useState } from "react";

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


function Discover() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("https://foodle-back-end.onrender.com/meals/Discover/")
      .then((res) => res.json())
      .then((data) => setItems(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <section className="discover" id="discover">
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
    </section>
  );
}
export default Discover