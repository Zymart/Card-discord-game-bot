const BIN_ID = '698dbb6d43b1c97be9795688';
const API_KEY = '$2a$10$McXg3fOwbLYW3Sskgfroj.nzMjtwwubDEz08zXpBN32KQ.8MvCJgK';

// 1. SMART NOTIFICATION SYSTEM
function showNotify(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    const icon = type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check';
    
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// 2. IMAGE OPTIMIZER (Maximum Space Saving)
async function optimizeImage(base64Str) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Str;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_W = 600; // Aggressive resize to fit more products
            const scale = MAX_W / img.width;
            canvas.width = MAX_W;
            canvas.height = img.height * scale;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.6)); // Lower quality = way more storage
        };
    });
}

// 3. CLOUD LOGIC
async function loadCloud() {
    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest?meta=false`, {
            headers: { 'X-Master-Key': API_KEY }
        });
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

// 4. DRAWING & ANIMATION
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
}, { threshold: 0.1 });

async function render() {
    const items = await loadCloud();
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <button class="del-btn" onclick="deleteItem('${item.id}')">×</button>
            <img src="${item.img}">
            <div class="card-content">
                <span class="cat-label">${item.cat}</span>
                <h3 style="margin:5px 0;">${item.name}</h3>
                <span class="price-display">₱${item.price}</span>
            </div>
        `;
        grid.appendChild(card);
        scrollObserver.observe(card);
    });
}

// 5. ADMIN ACTIONS
document.getElementById('add-btn').onclick = async () => {
    const name = document.getElementById('new-name').value;
    const price = document.getElementById('new-price').value;
    const cat = document.getElementById('new-cat').value;
    const file = document.getElementById('new-image-file').files[0];

    if (!name || !price || !file) {
        showNotify("Please complete the form", "error");
        return;
    }

    const btn = document.getElementById('add-btn');
    btn.innerText = "UPLOADING..."; btn.disabled = true;

    const reader = new FileReader();
    reader.onload = async (e) => {
        const smallImg = await optimizeImage(e.target.result);
        let list = await loadCloud();
        list.push({ id: Date.now().toString(), name, price, cat, img: smallImg });

        if (await saveCloud(list)) {
            showNotify(`Success! ${name} is live.`);
            document.getElementById('new-name').value = '';
            document.getElementById('new-price').value = '';
            render();
        } else {
            showNotify("Cloud is full! Delete old items.", "error");
        }
        btn.innerText = "PUBLISH"; btn.disabled = false;
    };
    reader.readAsDataURL(file);
};

window.deleteItem = async (id) => {
    if(!confirm("Are you sure?")) return;
    let list = await loadCloud();
    list = list.filter(i => i.id !== id);
    if(await saveCloud(list)) {
        showNotify("Item removed.");
        render();
    }
};

// 6. INITIALIZE
if (localStorage.getItem('snb_auth') === 'true') {
    document.getElementById('admin-panel').style.display = 'block';
    document.body.classList.add('admin-mode');
    document.getElementById('open-login-btn').style.display = 'none';
}

document.getElementById('submit-login').onclick = () => {
    const u = document.getElementById('user-input').value;
    const p = document.getElementById('pass-input').value;
    if (["Zymart", "Brigette", "Lance", "Taduran"].includes(u) && p === "sixssiliciousteam") {
        localStorage.setItem('snb_auth', 'true');
        location.reload();
    } else {
        showNotify("Wrong username or key!", "error");
    }
};

document.getElementById('open-login-btn').onclick = () => document.getElementById('login-modal').style.display='flex';
document.getElementById('close-modal').onclick = () => document.getElementById('login-modal').style.display='none';
document.getElementById('logout-btn').onclick = () => { localStorage.clear(); location.reload(); };

render();
