const adminBtn = document.getElementById('admin-login-btn');
const loginModal = document.getElementById('login-modal');
const authBtn = document.getElementById('auth-btn');
const closeBtn = document.getElementById('close-btn');
const menuContainer = document.getElementById('menu-container');

// Open/Close Modal
adminBtn.onclick = () => loginModal.style.display = 'flex';
closeBtn.onclick = () => loginModal.style.display = 'none';

// Auth Logic
authBtn.onclick = function() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const team = ["Zymart", "Brigette", "Lance", "Taduran"];
    
    if (team.includes(user) && pass === "sixssiliciousteam") {
        loginModal.style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        adminBtn.style.display = 'none'; // Hide login button once logged in
    } else {
        document.getElementById('error-msg').style.display = 'block';
    }
};

// Add Product Logic
document.getElementById('add-product-btn').onclick = function() {
    const name = document.getElementById('new-item-name').value;
    const desc = document.getElementById('new-item-desc').value;
    const price = document.getElementById('new-item-price').value;

    if (name && price) {
        // Remove the "no items" message if it's there
        if (document.querySelector('.no-items')) {
            menuContainer.innerHTML = '';
        }

        // Create the new menu item HTML
        const itemHTML = `
            <div class="menu-item">
                <div>
                    <div style="font-size: 1.2rem; color: var(--accent);">${name}</div>
                    <div style="font-size: 0.9rem; color: #aaa;">${desc}</div>
                </div>
                <div style="font-size: 1.2rem;">${price}</div>
            </div>
        `;

        menuContainer.innerHTML += itemHTML;

        // Clear the form
        document.getElementById('new-item-name').value = '';
        document.getElementById('new-item-desc').value = '';
        document.getElementById('new-item-price').value = '';
    }
};

// Logout
document.getElementById('logout-btn').onclick = () => location.reload();
