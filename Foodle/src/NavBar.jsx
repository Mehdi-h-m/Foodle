import { useAuth} from "./AuthContext";
import { useState }from "react";
import Home from "./Home.jsx";
import Login from "./Login.jsx";
import SignUp from "./Sign.jsx";
import Discover from "./Discover.jsx";
import FeedPage from "./FeedPage.jsx";
import Search from "./Search.jsx";


function NavBar() {

  
  const [Page, setPage] = useState("Home");
  const { user, logout } = useAuth();



  return (
    <>
<nav>
  <button
   class="nav-logo"
    onClick={() => setPage("Home")}
  >Food<span>le</span></button>
  {user ? (
    <>
    <ul class="nav-links">
        <button><a onClick={()=>setPage("Discover")}>Discover</a></button>
        <button><a onClick={()=>setPage("Search")}>Search</a></button>
        <button><a onClick={()=>setPage("For You")}>For You</a></button>
        <button><a onClick={()=>setPage("Liked")}>Liked</a></button>
     </ul>
          <button 
    className="btn btn-primary"
    onClick={() => logout()}
  >
    Logout
  </button>
    </>) : (
        <> 
    <div class="nav-cta">
  <button 
    className="btn btn-ghost"
    onClick={() => setPage("Login")}
  >
    Log In
  </button>

  <button 
    className="btn btn-primary"
    onClick={() => setPage("Signup")}
  >
    Sign Up
  </button>
    </div> </>)}

</nav> 
    { Page === "Discover" ? (<><Discover /></>) : Page === "For You" ? (<><FeedPage type="fyp" /></>) : Page === "Search" ? (<><Search /></>) : Page === "Liked" ? (<><FeedPage type="liked" /></>) : Page === "Login"? (<><Login Setpage={setPage} /></>) : Page === "Signup" ? (<><SignUp Setpage={setPage} /></>) : (<Home setPage={setPage} />) }
</>
)
}

export default NavBar;
