import { createContext, useContext, useState, useEffect } from "react";
import NavBar from "./NavBar.jsx";

const AuthContext = createContext();
function AuthProvider() {

  const [user, setUser] = useState(null);
const [accessToken, setAccessToken] = useState(null);


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("access");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedToken);
    }
  }, []);


   const login = (data) => {
    const userData = {
      username: data.username,
      email: data.email,
    };

    setUser(userData);
    setAccessToken(data.access);

    // persist
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("access", data.access);
    localStorage.setItem("refresh", data.refresh);
  };

    const logout = () => {
    setUser(null);
    setAccessToken(null);

    localStorage.removeItem("user");
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  };

  return (
    <AuthContext.Provider value={{ user,accessToken, login, logout }}>
        <NavBar />  
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
export default AuthProvider;

//////////
