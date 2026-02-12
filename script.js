const BIN_ID = '698dbb6d43b1c97be9795688';
const API_KEY = '$2a$10$McXg3fOwbLYW3Sskgfroj.nzMjtwwubDEz08zXpBN32KQ.8MvCJgK';
const foodGrid = document.getElementById('food-grid');
const drinksGrid = document.getElementById('drinks-grid');
const adminDock = document.getElementById('admin-panel');

// --- 1. CLOUD SYNC ---
async function loadFromCloud() {
    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest?meta=false`, {
            headers: { 'X-Master-Key': API_KEY }
        });
        const data = await res.json();
        return data.recipes || [];
    } catch (err) {
        console.error("Fetch Error:", err);
        return [];
    }
}

async function saveToCloud(dataArray) {
    try {
        await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
            body: JSON.stringify({ "recipes": dataArray })
        });
        return true;
    } catch (err) {
        console.error("Save Error:", err);
        return false;
    }
}

// --- 2. REPEAT ANIMATION ---
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        } else {
            entry.target.classList.remove('is-visible'); 
        }
    });
}, { threshold: 0.1 });

// --- 3. RENDERING (BY CATEGORY) ---
async function draw() {
    foodGrid.innerHTML = '<p style="color:var(--accent);">Syncing Food...</p>';
    drinksGrid.innerHTML = '<p style="color:var(--accent);">Syncing Drinks...</p>';
    
    const posts = await loadFromCloud();
    
    foodGrid.innerHTML = '';
    drinksGrid.innerHTML = '';

    posts.forEach((p) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <button class="del-btn" onclick="removePost('${p.id}')">×</button>
            <img src="${p.img}">
            <div class="card-content">
                <span style="color:var(--accent); font-weight:700;">${p.cat}</span>
                <h3>${p.name}</h3>
                <div style="color:var(--accent);">⭐⭐⭐⭐⭐</div>
            </div>
        `;

        // SORTING LOGIC
        if (p.cat === "Food") {
            foodGrid.appendChild(card);
        } else {
            drinksGrid.appendChild(card);
        }
        
        scrollObserver.observe(card);
    });
}

// --- 4. AUTH ---
if (localStorage.getItem('snb_auth') === 'true') {
    adminDock.style.display = 'block';
    document.getElementById('open-login-btn').style.display = 'none';
    document.body.classList.add('admin-mode');
}

document.getElementById('submit-login').onclick = () => {
    const user = document.getElementById('user-input').value;
    const pass = document.getElementById('pass-input').value;
    const team = ["Zymart", "Brigette", "Lance", "Taduran"];

    if (team.includes(user) && pass === "sixssiliciousteam") {
        localStorage.setItem('snb_auth', 'true');
        location.reload();
    } else {
        document.getElementById('error-msg').style.display = 'block';
    }
};

// --- 5. ADD PRODUCT ---
document.getElementById('add-btn').onclick = async () => {
    const name = document.getElementById('new-name').value;
    const cat = document.getElementById('new-cat').value;
    const file = document.getElementById('new-image-file').files[0];

    if (name && cat && file) {
        const btn = document.getElementById('add-btn');
        btn.innerText = "SYNCING...";
        btn.disabled = true;

        const reader = new FileReader();
        reader.onload = async (e) => {
            let currentPosts = await loadFromCloud();
            const newItem = { id: Date.now().toString(), name, cat, img: e.target.result };
            currentPosts.push(newItem);
            
            if (await saveToCloud(currentPosts)) {
                await draw();
                document.getElementById('new-name').value = '';
            }
            btn.innerText = "PUBLISH";
            btn.disabled = false;
        };
        reader.readAsDataURL(file);
    }
};

window.removePost = async (id) => {
    if(confirm("Delete everywhere?")) {
        let currentPosts = await loadFromCloud();
        currentPosts = currentPosts.filter(p => p.id !== id);
        await saveToCloud(currentPosts);
        draw();
    }
};

document.getElementById('logout-btn').onclick = () => {
    localStorage.clear();
    location.reload();
};

document.getElementById('open-login-btn').onclick = () => document.getElementById('login-modal').style.display='flex';
document.getElementById('close-modal').onclick = () => document.getElementById('login-modal').style.display='none';

draw();
