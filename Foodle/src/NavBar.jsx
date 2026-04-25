import { useAuth} from "./AuthContext";
import { useState }from "react";
import Home from "./Home.jsx";
import Login from "./Login.jsx";
import SignUp from "./Sign.jsx";


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
            <li><a href="#discover">Discover</a></li>
        <li><a href="#for-you">For You</a></li>
        <li><a href="#recipe">Search</a></li>
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
    { Page === "Discover" ? (<></>) : Page === "For You" ? (<></>) : Page === "Search" ? (<></>) : Page === "Login"? (<><Login/></>) : Page === "Signup" ? (<><SignUp Setpage={setPage} /></>) : (<><Home/></>) }
</>
)
}

export default NavBar;
