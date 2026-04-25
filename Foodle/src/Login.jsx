import { useState } from "react";
import { useAuth } from "./AuthContext.jsx"




function Login({ Setpage }){
  const { login } = useAuth();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

    const handleLogin = async () => {
  try {
    const response = await fetch("https://foodle-back-end.onrender.com/users/login/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });
    const data = await response.json();

    if (response.ok) {
      console.log("User logged in:", data);
      login(data);
      Setpage("Home");
    } else {
      console.error("Error:", data);
    }
  } catch (error) {
    console.error("Network error:", error);
  }
};
return(
        <>
    <section class="auth-section" id="auth">
    <div class="auth-wrapper">
        <div class="auth-copy fade-up">
        <div class="section-label">Join Foodle</div>
        <div class="section-title">Cook smarter.<br/>Eat better.</div>
        <p class="section-sub">Create your free account to unlock your personalised feed, save recipes and track what you've cooked.</p>
        <div class="auth-perks">
            <div class="perk"><div class="perk-icon">📋</div> Save unlimited recipes to your collection</div>
            <div class="perk"><div class="perk-icon">✨</div> Get a personalised "For You" feed</div>
            <div class="perk"><div class="perk-icon">🔔</div> New recipes matching your taste daily</div>
            <div class="perk"><div class="perk-icon">📊</div> Track nutrition and cooking history</div>
        </div>
        </div>

        <div class="auth-form fade-up">
        <div class="auth-tab">
            <h1 id="tab-login">Logging In</h1>
        </div>

      <div id="register-fields">
        <div class="form-group">
          <label class="form-label">UserName</label>
          <input class="form-input" type="text" placeholder="Jamie Oliver" value={fullName} onChange={(e) => setFullName(e.target.value)}/>
        </div>
      </div>

        <div class="form-group">
            <label class="form-label">Password</label>
            <input class="form-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}/>
        </div>

        <button class="form-submit" id="form-btn" onClick={handleLogin}>
            Log In
        </button>

        </div>
    </div>
    </section>
        </>
    )
}

export default Login
