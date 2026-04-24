import { createContext, useContext, useState } from "react";
import NavBar from "./NavBar.jsx";
const AuthContext = createContext();

function AuthProvider() {
  const [user, setUser] = useState(null);

  const login = (userData) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
        <NavBar />  
    </AuthContext.Provider>
  );
}

export default AuthProvider;
export const useAuth = () => useContext(AuthContext);