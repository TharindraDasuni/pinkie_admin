// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggle(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeToggle(newTheme);
}

function updateThemeToggle(theme) {
    const sunIcon = document.querySelector('.theme-toggle .fa-sun');
    const moonIcon = document.querySelector('.theme-toggle .fa-moon');
    const text = document.querySelector('.theme-toggle span');
    
    if (theme === 'light') {
        sunIcon.classList.add('active');
        moonIcon.classList.remove('active');
        text.textContent = 'Light';
    } else {
        moonIcon.classList.add('active');
        sunIcon.classList.remove('active');
        text.textContent = 'Dark';
    }
}

// Add event listener for theme toggle
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Rest of your existing DOMContentLoaded code...
    const currentPage = window.location.pathname.split("/").pop();
    // ... rest of your existing code
});