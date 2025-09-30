// Global Variables
let users = [];
let currentUser = null;

// Demo Accounts
const demoAccounts = {
    admin: {
        email: 'admin@okul.com',
        password: 'admin123',
        name: 'Yönetici',
        role: 'admin'
    },
    teacher: {
        email: 'ogretmen@okul.com',
        password: 'teacher123',
        name: 'Ahmet Yılmaz',
        role: 'teacher'
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    updateStats();
    initializeEventListeners();
    checkRememberedUser();
});

// Event Listeners
function initializeEventListeners() {
    // Login Form
    document.getElementById('loginFormSubmit').addEventListener('submit', handleLogin);
    
    // Register Form
    document.getElementById('registerFormSubmit').addEventListener('submit', handleRegister);
    
    // Password Strength
    document.getElementById('registerPassword').addEventListener('input', checkPasswordStrength);
}

// Load Users from LocalStorage
function loadUsers() {
    const savedUsers = localStorage.getItem('schoolCalendarUsers');
    if (savedUsers) {
        users = JSON.parse(savedUsers);
    } else {
        // Add demo accounts
        users = [
            {
                id: 1,
                name: 'Yönetici',
                email: 'admin@okul.com',
                password: hashPassword('admin123'),
                role: 'admin',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Ahmet Yılmaz',
                email: 'ogretmen@okul.com',
                password: hashPassword('teacher123'),
                role: 'teacher',
                createdAt: new Date().toISOString()
            }
        ];
        saveUsers();
    }
}

// Save Users to LocalStorage
function saveUsers() {
    localStorage.setItem('schoolCalendarUsers', JSON.stringify(users));
}

// Simple Password Hash (for demo - use proper hashing in production)
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

// Check Remembered User
function checkRememberedUser() {
    const rememberedEmail = localStorage.getItem('rememberedUser');
    if (rememberedEmail) {
        document.getElementById('loginEmail').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }
}

// Switch Between Forms
function switchForm(formType) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (formType === 'register') {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
    } else {
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
    }
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validate
    if (!email || !password) {
        showToast('Lütfen tüm alanları doldurun!', 'error');
        return;
    }
    
    // Show loading
    showLoading();
    
    // Simulate network delay
    setTimeout(() => {
        const user = users.find(u => u.email === email);
        
        if (!user) {
            hideLoading();
            showToast('Kullanıcı bulunamadı!', 'error');
            return;
        }
        
        if (user.password !== hashPassword(password)) {
            hideLoading();
            showToast('Şifre hatalı!', 'error');
            return;
        }
        
        // Remember user if checked
        if (rememberMe) {
            localStorage.setItem('rememberedUser', email);
        } else {
            localStorage.removeItem('rememberedUser');
        }
        
        // Save current user
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        hideLoading();
        showToast(`Hoş geldiniz, ${user.name}!`, 'success');
        
        // Redirect after 1 second
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
        
    }, 1500);
}

// Handle Register
function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const role = document.getElementById('registerRole').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    // Validate
    if (!name || !email || !role || !password || !passwordConfirm) {
        showToast('Lütfen tüm alanları doldurun!', 'error');
        return;
    }
    
    if (!agreeTerms) {
        showToast('Kullanım koşullarını kabul etmelisiniz!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Şifre en az 6 karakter olmalıdır!', 'error');
        return;
    }
    
    if (password !== passwordConfirm) {
        showToast('Şifreler eşleşmiyor!', 'error');
        return;
    }
    
    // Check if email exists
    if (users.find(u => u.email === email)) {
        showToast('Bu e-posta adresi zaten kayıtlı!', 'error');
        return;
    }
    
    // Show loading
    showLoading();
    
    // Simulate network delay
    setTimeout(() => {
        // Create new user
        const newUser = {
            id: Date.now(),
            name,
            email,
            password: hashPassword(password),
            role,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        saveUsers();
        
        hideLoading();
        showToast('Hesabınız başarıyla oluşturuldu!', 'success');
        
        // Switch to login form
        setTimeout(() => {
            switchForm('login');
            document.getElementById('loginEmail').value = email;
        }, 1500);
        
    }, 1500);
}

// Demo Login
function loginDemo(type) {
    const account = demoAccounts[type];
    
    document.getElementById('loginEmail').value = account.email;
    document.getElementById('loginPassword').value = account.password;
    
    showToast(`Demo hesap bilgileri yüklendi: ${account.name}`, 'info');
}

// Toggle Password Visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.toggle-password');
    const eyeOpen = button.querySelector('.eye-open');
    const eyeClosed = button.querySelector('.eye-closed');
    
    if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.style.display = 'none';
        eyeClosed.style.display = 'block';
    } else {
        input.type = 'password';
        eyeOpen.style.display = 'block';
        eyeClosed.style.display = 'none';
    }
}

// Check Password Strength
function checkPasswordStrength() {
    const password = document.getElementById('registerPassword').value;
    const strengthBar = document.getElementById('strengthBar');
    const strengthText = document.getElementById('strengthText');
    
    let strength = 0;
    
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    strengthBar.className = 'strength-fill';
    
    if (strength <= 2) {
        strengthBar.classList.add('weak');
        strengthText.textContent = 'Şifre gücü: Zayıf';
        strengthText.style.color = '#ef4444';
    } else if (strength <= 4) {
        strengthBar.classList.add('medium');
        strengthText.textContent = 'Şifre gücü: Orta';
        strengthText.style.color = '#f59e0b';
    } else {
        strengthBar.classList.add('strong');
        strengthText.textContent = 'Şifre gücü: Güçlü';
        strengthText.style.color = '#10b981';
    }
}

// Show Forgot Password
function showForgotPassword() {
    const email = prompt('Lütfen e-posta adresinizi girin:');
    
    if (!email) return;
    
    const user = users.find(u => u.email === email);
    
    if (!user) {
        showToast('Bu e-posta adresi kayıtlı değil!', 'error');
        return;
    }
    
    showToast('Şifre sıfırlama linki e-posta adresinize gönderildi!', 'success');
}

// Update Statistics
function updateStats() {
    // Get events count
    const events = JSON.parse(localStorage.getItem('schoolCalendarEvents') || '[]');
    
    // Animate counters
    animateCounter('totalUsers', users.length);
    animateCounter('totalEvents', events.length);
    animateCounter('activeSchools', 1);
}

// Animate Counter
function animateCounter(elementId, target) {
    const element = document.getElementById(elementId);
    let current = 0;
    const increment = Math.ceil(target / 50);
    const duration = 1000;
    const stepTime = duration / (target / increment);
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = current;
    }, stepTime);
}

// Show Toast
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Show Loading
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('active');
}

// Hide Loading
function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('active');
}

// Get Current User
function getCurrentUser() {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
        return JSON.parse(saved);
    }
    return null;
}

// Logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Check if User is Logged In
function checkAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
    }
    return user;
}

// Export functions for other pages
window.schoolCalendar = {
    getCurrentUser,
    logout,
    checkAuth,
    users,
    saveUsers
};