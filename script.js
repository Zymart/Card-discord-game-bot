const BIN_ID = '698dbb6d43b1c97be9795688';
const API_KEY = '$2a$10$McXg3fOwbLYW3Sskgfroj.nzMjtwwubDEz08zXpBN32KQ.8MvCJgK';

// FIXED IMAGE HANDLING: This shrinks ANY photo so it fits the database
async function processAnyImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                // We force the image to a standard size so it ALWAYS saves
                const width = 500;
                const scale = width / img.width;
                canvas.width = width;
                canvas.height = img.height * scale;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Convert to very efficient JPEG string
                resolve(canvas.toDataURL('image/jpeg', 0.5)); 
            };
        };
    });
}

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

let scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
        if (entry.isIntersecting) {
            setTimeout(() => { entry.target.classList.add('is-visible'); }, idx * 100);
        }
    });
}, { threshold: 0.1 });

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
                <small style="color:var(--accent)">${item.cat || 'MENU'}</small>
                <h3>${item.name}</h3>
                <div class="price-display">₱${item.price}</div>
            </div>
        `;
        grid.appendChild(card);
        scrollObserver.observe(card);
    });
}

// UI EVENTS
document.getElementById('open-product-modal').onclick = () => document.getElementById('product-modal').style.display = 'flex';
document.getElementById('close-product-modal').onclick = () => document.getElementById('product-modal').style.display = 'none';
document.getElementById('open-login-btn').onclick = () => document.getElementById('login-modal').style.display = 'flex';
document.getElementById('close-modal').onclick = () => document.getElementById('login-modal').style.display = 'none';

document.getElementById('add-btn').onclick = async () => {
    const name = document.getElementById('new-name').value;
    const price = document.getElementById('new-price').value;
    const cat = document.getElementById('new-cat').value;
    const file = document.getElementById('new-image-file').files[0];

    if (!name || !price || !file) return alert("Complete all info first.");

    const btn = document.getElementById('add-btn');
    btn.innerText = "PUBLISHING...";
    btn.disabled = true;

    // Process the image regardless of its original size
    const optimizedBase64 = await processAnyImage(file);
    
    let list = await loadCloud();
    list.push({ id: Date.now().toString(), name, price, cat, img: optimizedBase64 });

    if (await saveCloud(list)) {
        location.reload();
    } else {
        alert("Critical Error: Database rejected the data. Try wiping storage.");
        btn.innerText = "PUBLISH ITEM";
        btn.disabled = false;
    }
};

window.deleteItem = async (id) => {
    if(!confirm("Delete this?")) return;
    let list = await loadCloud();
    list = list.filter(i => i.id !== id);
    if(await saveCloud(list)) render();
};

document.getElementById('wipe-btn').onclick = async () => {
    if(confirm("Wipe all data?")) {
        if(await saveCloud([])) location.reload();
    }
};

// LOGIN
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
    } else { alert("Wrong Login"); }
};

document.getElementById('logout-btn').onclick = () => { localStorage.clear(); location.reload(); };

render();
