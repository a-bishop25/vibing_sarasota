// ===============================
// Load and display businesses
// ===============================
async function loadBusinesses(query = "") {
    const container = document.getElementById("business-list");
    const category = document.body.dataset.category;

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        console.log("No logged-in user found in localStorage");
    } else {
        console.log("Logged-in user loaded from localStorage:", user);
    }
    try {
        let url = "http://localhost:5000/api/businesses";
        if (category) url += `/${category}`;
        if (query) url = `http://localhost:5000/api/search?q=${encodeURIComponent(query)}`;

        const response = await fetch(url);
        const businesses = await response.json();

        // Load favorites
        let userFavorites = [];
        if (user) {
            try {
                const favRes = await fetch(`http://localhost:5000/api/users/${user.id}/favorites`);
                const favData = await favRes.json();
                userFavorites = (favData.favorites || []).map(String);
            } catch (err) {
                console.error("Could not load user favorites:", err);
            }
        } else {
            userFavorites = JSON.parse(localStorage.getItem("favorites") || "[]").map(String);
        }

        container.innerHTML = "";
        if (businesses.length === 0) {
            container.innerHTML = "<p>No businesses found.</p>";
            return;
        }

        // Render cards
        businesses.forEach(b => {
            const card = document.createElement("div");
            card.className = "business-card";

            const isFav = userFavorites.includes(String(b._id));

            card.innerHTML = `
                <h3>${b.name}</h3>
                <p><strong>Category:</strong> ${b.category}</p>
                <p>${b.description}</p>
                <p><strong>Rating:</strong> ${b.rating}</p>

                <button class="favorite-btn ${isFav ? 'favorited' : ''}" data-business-id="${b._id}">
                    ${isFav ? "★ Favorited" : "☆ Favorite"}
                </button>

                <div class="admin-buttons">
                    <button onclick="editBusiness('${b._id}')">✏️ Edit</button>
                    <button onclick="deleteBusiness('${b._id}')">🗑️ Delete</button>
                </div>
            `;

            container.appendChild(card);
        });

        // Attach favorite button event listeners
        container.querySelectorAll(".favorite-btn").forEach(btn => {
            btn.addEventListener("click", () => updateFavorite(btn.dataset.businessId, btn));
        });

    } catch (err) {
        console.error("Error loading businesses:", err);
        container.innerHTML = "<p>Failed to load businesses.</p>";
    }
}

// ===============================
// Add or remove favorites (works with MongoDB and localStorage)
// ===============================
async function updateFavorite(businessId, button) {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        // Not logged in → localStorage only
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]").map(String);
        const index = favorites.indexOf(String(businessId));
        if (index > -1) favorites.splice(index, 1);
        else favorites.push(String(businessId));
        localStorage.setItem("favorites", JSON.stringify(favorites));
        button.classList.toggle("favorited");
        button.textContent = favorites.includes(String(businessId)) ? "★ Favorited" : "☆ Favorite";
        return;
    }

    const userId = user.id; // Use the correct key

    try {
        // Check if already favorited
        const favRes = await fetch(`http://localhost:5000/api/users/${userId}/favorites`);
        const favData = await favRes.json();
        const userFavorites = (favData.favorites || []).map(String);
        const isFav = userFavorites.includes(String(businessId));

        const method = isFav ? "DELETE" : "POST";
        const res = await fetch(`http://localhost:5000/api/users/${userId}/favorites/${businessId}`, { method });

        const updatedUser = await res.json(); // ✅ Make sure updatedUser is always defined

        if (!res.ok) {
            throw new Error(updatedUser.error || "Server error");
        }

        // Update localStorage and button
        const user = JSON.parse(localStorage.getItem("user"));

// Only update favorites, keep all other user info
        user.favorites = updatedUser.favorites;

// Save back to localStorage
        localStorage.setItem("user", JSON.stringify(user));

        if (updatedUser.favorites.map(String).includes(String(businessId))) {
            button.classList.add("favorited");
            button.textContent = "★ Favorited";
        } else {
            button.classList.remove("favorited");
            button.textContent = "☆ Favorite";
        }

        console.log("Favorite updated successfully:", updatedUser);

    } catch (err) {
        console.error("Error updating favorites:", err);
    }
}


// ===============================
// CRUD operations
// ===============================
async function addBusiness(business) {
    try {
        const response = await fetch("http://localhost:5000/api/businesses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(business)
        });
        const data = await response.json();
        loadBusinesses();
        return data;
    } catch (err) {
        console.error("Error adding business:", err);
    }
}

async function editBusiness(id) {
    const name = prompt("Enter new name:");
    const category = prompt("Enter new category:");
    const description = prompt("Enter new description:");
    const rating = parseFloat(prompt("Enter new rating (0-5):"));

    if (!name || !category || !description || isNaN(rating)) {
        alert("All fields are required and rating must be a number!");
        return;
    }

    try {
        await fetch(`http://localhost:5000/api/businesses/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, category, description, rating })
        });
        loadBusinesses();
    } catch (err) {
        console.error("Error editing business:", err);
    }
}

async function deleteBusiness(id) {
    if (!confirm("Are you sure you want to delete this business?")) return;
    try {
        await fetch(`http://localhost:5000/api/businesses/${id}`, { method: "DELETE" });
        loadBusinesses();
    } catch (err) {
        console.error("Error deleting business:", err);
    }
}

// ===============================
// Search functionality
// ===============================
const searchInput = document.getElementById("search");
if (searchInput) {
    searchInput.addEventListener("input", e => {
        loadBusinesses(e.target.value);
    });
}

// ===============================
// Load on page open
// ===============================
window.addEventListener("DOMContentLoaded", () => loadBusinesses());
