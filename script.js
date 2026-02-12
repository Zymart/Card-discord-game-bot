document.getElementById('login-btn').addEventListener('click', function() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');
    
    // The Authorized List
    const authorizedUsers = ["Zymart", "Brigette", "Lance", "Taduran"];
    const secretPassword = "sixssiliciousteam";

    if (authorizedUsers.includes(user) && pass === secretPassword) {
        // Hide login and show content
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        
        // Change body layout to top-aligned for the dashboard
        document.body.style.alignItems = 'flex-start';
        document.body.style.paddingTop = '50px';
    } else {
        // Show error message
        errorMsg.style.display = 'block';
    }
});

// Logout functionality
document.getElementById('logout-btn').addEventListener('click', function() {
    location.reload();
});

