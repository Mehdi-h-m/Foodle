import { useAuth} from "./AuthContext";


export default function Home({ setPage }) {
   const { user, logout } = useAuth();
  return (
    <section className="home-section">

      <h1 className="home-title">
        Discover recipes<br />
        made for <em>you</em>
      </h1>

      <p className="home-sub">
        Foodle brings together thousands of recipes from around the world
        and tailors them to your taste — so you always know what to cook next.
      </p>

      <div className="home-stats">
        {[
          ["40 000+", "Recipes"],
          ["180+",    "Cuisines"],
          ["1.2 M",   "Cooks"],
        ].map(([n, l]) => (
          <div key={l}>
            <div className="home-stat-number">{n}</div>
            <div className="home-stat-label">{l}</div>
          </div>
        ))}
      </div>

      <div className="home-divider" />
  {user ? (<></>) : (<>
      <div className="home-actions">
        <button className="btn btn-ghost" onClick={() => setPage("Login")}>Log In</button>
        <button className="btn btn-primary" onClick={() => setPage("Signup")}>Sign Up</button>
      </div>
      </>)}
    </section>
  );
}