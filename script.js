const grid = document.getElementById('product-grid');
const adminPanel = document.getElementById('admin-panel');
const loginBtn = document.getElementById('open-login-btn');

// --- 1. THE SESSION FIX ---
// This runs as soon as the JS loads, before anything else
if (localStorage.getItem('sixss_is_admin') === 'true') {
    document.body.classList.add('admin-active');
    setTimeout(() => { adminPanel.style.display = 'block'; }, 100);
    loginBtn.style.display = 'none';
}

// --- 2. THE POSTS FIX ---
let items = JSON.parse(localStorage.getItem('sixss_store')) || [];

function draw() {
    grid.innerHTML = '';
    items.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <button class="del-btn" onclick="remove(${item.id})">×</button>
            <img src="${item.image}">
            <div class="card-content">
                <span class="category">${item.cat}</span>
                <h3>${item.name}</h3>
                <div style="color:var(--snb-yellow); margin-top:10px;">⭐⭐⭐⭐⭐</div>
            </div>
        `;
        grid.appendChild(div);
    });
}

// --- 3. LOGIN LOGIC ---
document.getElementById('submit-login').onclick = () => {
    const u = document.getElementById('user-input').value;
    const p = document.getElementById('pass-input').value;
    const team = ["Zymart", "Brigette", "Lance", "Taduran"];

    if (team.includes(u) && p === "sixssiliciousteam") {
        localStorage.setItem('sixss_is_admin', 'true');
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('access-overlay').style.display = 'flex';
        setTimeout(() => { location.reload(); }, 1000); // Reload to lock admin in
    } else {
        alert("Wrong credentials!");
    }
};

// --- 4. POSTING LOGIC ---
document.getElementById('add-btn').onclick = () => {
    const name = document.getElementById('new-name').value;
    const cat = document.getElementById('new-cat').value;
    const file = document.getElementById('new-image-file').files[0];

    if (name && cat && file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const newItem = { id: Date.now(), name, cat, image: e.target.result };
            items.push(newItem);
            localStorage.setItem('sixss_store', JSON.stringify(items));
            draw();
            document.getElementById('new-name').value = '';
        };
        reader.readAsDataURL(file);
    }
};

window.remove = (id) => {
    items = items.filter(i => i.id !== id);
    localStorage.setItem('sixss_store', JSON.stringify(items));
    draw();
};

document.getElementById('logout-btn').onclick = () => {
    localStorage.clear();
    location.reload();
};

document.getElementById('open-login-btn').onclick = () => document.getElementById('login-modal').style.display='flex';
document.getElementById('close-modal').onclick = () => document.getElementById('login-modal').style.display='none';

// Start
draw();
