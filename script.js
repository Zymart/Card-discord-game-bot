const BIN_ID = '698dbb6d43b1c97be9795688';
const API_KEY = '$2a$10$McXg3fOwbLYW3Sskgfroj.nzMjtwwubDEz08zXpBN32KQ.8MvCJgK';

// NOTIFICATIONS
function showNotify(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderLeftColor = type === 'error' ? 'var(--danger)' : 'var(--accent)';
    toast.innerHTML = `<span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 3000);
}

// IMAGE OPTIMIZER (CRITICAL FIX)
async function optimizeImage(base64Str) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_W = 400; // Small but effective
            const scale = MAX_W / img.width;
            canvas.width = MAX_W;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            // 0.4 quality significantly reduces string size for JSONBin
            resolve(canvas.toDataURL('image/jpeg', 0.4));
        };
    });
}

// CLOUD STORAGE
async function loadCloud() {
    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest?meta=false`, { headers: { 'X-Master-Key': API_KEY } });
        const data = await res.json();
        return data.recipes || [];
    } catch (e) { return []; }
}

async function saveCloud(data) {
    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'X-Master-Key': API_KEY },
            body: JSON.stringify({ "recipes": data })
        });
        return res.ok;
    } catch (e) { return false; }
}

// ANIMATION OBSERVER
let scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
            setTimeout(() => { entry.target.classList.add('is-visible'); }, idx * 100);
        }
    });
}, { threshold: 0.1 });

// MAIN RENDER
async function render() {
    const items = await loadCloud();
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    scrollObserver.disconnect();
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <button class="del-btn" onclick="deleteItem('${item.id}')">×</button>
            <img src="${item.img}">
            <div class="card-content">
                <small style="color:var(--accent); font-weight:bold;">${item.cat || 'MENU'}</small>
                <h3 style="margin:5px 0;">${item.name}</h3>
                <div class="price-display">₱${item.price}</div>
            </div>
        `;
        grid.appendChild(card);
        scrollObserver.observe(card);
    });
}

// UI LOGIC
document.getElementById('open-product-modal').onclick = () => document.getElementById('product-modal').style.display = 'flex';
document.getElementById('close-product-modal').onclick = () => document.getElementById('product-modal').style.display = 'none';
document.getElementById('open-login-btn').onclick = () => document.getElementById('login-modal').style.display = 'flex';
document.getElementById('close-modal').onclick = () => document.getElementById('login-modal').style.display = 'none';

document.getElementById('add-btn').onclick = async () => {
    const name = document.getElementById('new-name').value;
    const price = document.getElementById('new-price').value;
    const cat = document.getElementById('new-cat').value;
    const file = document.getElementById('new-image-file').files[0];

    if (!name || !price || !file) return showNotify("Fill all fields!", "error");

    document.getElementById('add-btn').innerText = "PUBLISHING...";
    const reader = new FileReader();
    reader.onload = async (e) => {
        const smallImg = await optimizeImage(e.target.result);
        let list = await loadCloud();
        list.push({ id: Date.now().toString(), name, price, cat, img: smallImg });
        if (await saveCloud(list)) {
            location.reload();
        } else {
            showNotify("Upload failed. Try a smaller photo.", "error");
            document.getElementById('add-btn').innerText = "PUBLISH ITEM";
        }
    };
    reader.readAsDataURL(file);
};

window.deleteItem = async (id) => {
    if(!confirm("Delete this product?")) return;
    let list = await loadCloud();
    list = list.filter(i => i.id !== id);
    if(await saveCloud(list)) render();
};

document.getElementById('wipe-btn').onclick = async () => {
    if(confirm("DANGER: This will delete everything! Proceed?")) {
        if(await saveCloud([])) location.reload();
    }
};

// AUTHENTICATION
if (localStorage.getItem('snb_auth') === 'true') {
    document.getElementById('admin-panel').style.display = 'block';
    document.getElementById('open-product-modal').style.display = 'block';
    document.body.classList.add('admin-mode');
    document.getElementById('open-login-btn').style.display = 'none';
}

document.getElementById('submit-login').onclick = () => {
    const u = document.getElementById('user-input').value;
    const p = document.getElementById('pass-input').value;
    if (["Zymart", "Brigette", "Lance", "Taduran"].includes(u) && p === "sixssiliciousteam") {
        localStorage.setItem('snb_auth', 'true');
        location.reload();
    } else { showNotify("Access Denied", "error"); }
};

document.getElementById('logout-btn').onclick = () => { localStorage.clear(); location.reload(); };

render();
