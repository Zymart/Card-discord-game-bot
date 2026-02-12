// Elements
const openLoginBtn = document.getElementById('open-login-btn');
const loginModal = document.getElementById('login-modal');
const closeModal = document.getElementById('close-modal');
const submitLogin = document.getElementById('submit-login');
const adminPanel = document.getElementById('admin-panel');
const publicSite = document.getElementById('public-site');
const menuDisplay = document.getElementById('menu-display');

// 1. Open Login Modal
openLoginBtn.onclick = () => {
    loginModal.style.display = 'flex';
};

// 2. Close Login Modal
closeModal.onclick = () => {
    loginModal.style.display = 'none';
};

// 3. Login Logic
submitLogin.onclick = () => {
    const user = document.getElementById('user-input').value;
    const pass = document.getElementById('pass-input').value;
    const team = ["Zymart", "Brigette", "Lance", "Taduran"];

    if (team.includes(user) && pass === "sixssiliciousteam") {
        loginModal.style.display = 'none';
        adminPanel.style.display = 'block'; // Show tools
        openLoginBtn.style.display = 'none'; // Hide login button
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
};

// 4. Add Product Logic
document.getElementById('post-btn').onclick = () => {
    const name = document.getElementById('item-name').value;
    const desc = document.getElementById('item-desc').value;
    const price = document.getElementById('item-price').value;

    if (name && price) {
        // Remove placeholder text if it exists
        const placeholder = document.querySelector('.placeholder-text');
        if (placeholder) placeholder.remove();

        // Create Card
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div>
                <div style="font-size: 1.3rem; text-transform: uppercase;">${name}</div>
                <div style="color: #888; font-size: 0.9rem; font-family: sans-serif;">${desc}</div>
            </div>
            <div style="font-size: 1.5rem; color: var(--accent);">${price}</div>
        `;

        menuDisplay.appendChild(card);

        // Clear Form
        document.getElementById('item-name').value = '';
        document.getElementById('item-desc').value = '';
        document.getElementById('item-price').value = '';
    }
};

// 5. Logout
document.getElementById('logout-btn').onclick = () => {
    location.reload();
};
