# Foodle

A personalized recipe discovery app built with React. Foodle helps users explore thousands of meals from around the world, get personalized recommendations, and keep track of their favourite recipes.

---

## Tech Stack

- **Frontend** — React (Vite)
- **Styling** — Plain CSS with CSS variables
- **Backend** — Django REST API hosted on Render (`https://foodle-back-end.onrender.com`)
- **Data source** — TheMealDB API (via backend)
- **Auth** — JWT (access token stored via `AuthContext`)

---

## Project Structure

```
Foodle/src/
├── App.css              # Global CSS variables and shared component styles
├── AuthContext.jsx       # JWT auth context (login, logout, accessToken)
├── NavBar.jsx            # Top navigation and page routing
├── Home.jsx              # Landing page
├── Home.css
├── Discover.jsx          # Browse all recipes
├── Discover.css
├── Search.jsx            # Search and filter recipes
├── Search.css
├── FYP.jsx               # Personalized "For You" feed
├── FYP.css
├── Liked.jsx             # All liked recipes
├── Liked.css
├── RecipeDetail.jsx      # Full recipe detail view
└── RecipeDetail.css
```

---

## Pages

### Home
Landing page shown to unauthenticated users. Displays a short app description, key stats, and Log In / Sign Up buttons.

### Discover
Browses all available recipes fetched from `/meals/Discover/`. Includes a refresh button to load a new set of meals.

### Search
Allows filtering recipes by name, category, area, and ingredient. Category, area, and ingredient fields are dropdowns populated from static lists. Results are paginated.

**Endpoint:** `GET /meals/search/?q=&category=&area=&ingredient=&page=1`

### For You (FYP)
Personalized feed based on the user's liked and viewed meals. Uses a random seed on each load to vary results. Includes a refresh button to fetch a new set. Cards tagged with `exploration: true` show a "New for you" badge.

**Endpoint:** `GET /meals/recommendation/?seed=<random>`

### Liked
Displays all meals the user has liked, with pagination.

**Endpoint:** `GET /interactions/liked/?page=1`

### Recipe Detail
Full detail view for a single recipe, opened by clicking any card. Displays the meal image, category, area, ingredients list, step-by-step instructions, and an embedded YouTube video when available.

Automatically tracks a view on load and includes a like/unlike toggle button.

**Endpoints:**
- `GET /meals/<meal_id>/`
- `POST /interactions/view/` — auto-called on load
- `POST /interactions/like/` — toggled by the like button

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Install dependencies
```bash
cd Foodle
npm install
```

### Run locally
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Authentication

All pages except Home require a valid JWT access token. Auth state is managed via `AuthContext`. The token is attached as a Bearer header on every API request.

Log in and sign up are handled via:
- `POST /auth/login/`
- `POST /auth/register/`

---

## Navigation

Routing is handled entirely in `NavBar.jsx` using a `Page` state string. There is no React Router — each page is conditionally rendered based on the current page value.

To navigate to the recipe detail view from any page, pass an `onSelectMeal` prop that sets the selected meal ID and switches the page to `"RecipeDetail"`.

```jsx
<Discover onSelectMeal={(id) => { setSelectedMeal(id); setPage("RecipeDetail"); }} />
```
