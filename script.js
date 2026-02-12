// --- CONFIGURATION ---
const BIN_ID = '698dbb6d43b1c97be9795688';
const API_KEY = '$2a$10$McXg3fOwbLYW3Sskgfroj.nzMjtwwubDEz08zXpBN32KQ.8MvCJgK';
const grid = document.getElementById('product-grid');
const adminDock = document.getElementById('admin-panel');

// --- 1. CLOUD SYNC LOGIC (FIXED) ---
async function loadFromCloud() {
    try {
        // Adding ?meta=false ensures we get ONLY the product array
        const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest?meta=false`, {
            headers: { 'X-Master-Key': API_KEY }
        });
        if (!res.ok) throw new Error("Cloud Error");
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.warn("Cloud offline, loading local cache...");
        return JSON.parse(localStorage.getItem('snb_cache')) || [];
    }
}

async function saveToCloud(data) {
    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json', 
                'X-Master-Key': API_KEY 
            },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            localStorage.setItem('snb_cache', JSON.stringify(data));
            console.log("Cloud Updated!");
        }
    } catch (err) {
        console.error("Cloud Save Failed:", err);
    }
}

// --- 2. REPEAT SCROLL ANIMATION ---
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        } else {
            // Reset state when scrolling away
            entry.target.classList.remove('is-visible'); 
        }
    });
}, { threshold: 0.1 });

// --- 3. RENDERING ---
async function draw() {
    grid.innerHTML = '<p style="color:var(--accent); text-align:center; width:100%;">Syncing Cloud Data...</p>';
    const posts = await loadFromCloud();
    grid.innerHTML = '';

    if (posts.length === 0) {
        grid.innerHTML = '<p style="text-align:center; width:100%; opacity:0.5;">No products found in cloud.</p>';
    }

    posts.forEach((p) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <button class="del-btn" onclick="removePost('${p.id}')">×</button>
            <img src="${p.img}">
            <div class="card-content">
                <span style="color:var(--accent); font-weight:700; font-size:0.7rem;">${p.cat}</span>
                <h3 style="margin:10px 0;">${p.name}</h3>
                <div style="color:var(--accent);">⭐⭐⭐⭐⭐ 5.0</div>
            </div>
        `;
        grid.appendChild(card);
        scrollObserver.observe(card);
    });
}

// --- 4. ADMIN & AUTH ---
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
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('access-overlay').style.display = 'flex';
        setTimeout(() => { location.reload(); }, 1200);
    } else {
        document.getElementById('error-msg').style.display = 'block';
    }
};

// --- 5. ADD POST (LAPTOP TO PHONE SYNC) ---
document.getElementById('add-btn').onclick = async () => {
    const name = document.getElementById('new-name').value;
    const cat = document.getElementById('new-cat').value;
    const file = document.getElementById('new-image-file').files[0];

    if (name && cat && file) {
        const btn = document.getElementById('add-btn');
        btn.innerText = "CLOUD SYNCING...";
        btn.disabled = true;

        const reader = new FileReader();
        reader.onload = async (e) => {
            let currentPosts = await loadFromCloud();
            const newItem = { id: Date.now().toString(), name, cat, img: e.target.result };
            currentPosts.push(newItem);
            
            await saveToCloud(currentPosts);
            await draw();
            
            btn.innerText = "PUBLISH";
            btn.disabled = false;
            document.getElementById('new-name').value = '';
        };
        reader.readAsDataURL(file);
    }
};

window.removePost = async (id) => {
    if(confirm("Delete this everywhere?")) {
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

// Load
draw();
