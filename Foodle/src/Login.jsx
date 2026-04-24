
function Login(){
return(
        <>
        {console.log("Login")}
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

        <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-input" type="email" placeholder="hello@foodle.com"/>
        </div>

        <div class="form-group">
            <label class="form-label">Password</label>
            <input class="form-input" type="password" placeholder="••••••••"/>
        </div>

        <button class="form-submit" id="form-btn">Log In</button>

        </div>
    </div>
    </section>
        </>
    )
}

export default Login
