import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Inject Loading Tag Styles
const injectLoadingStyles = () => {
    if (document.getElementById('auth-loader-styles')) return;
    const style = document.createElement('style');
    style.id = 'auth-loader-styles';
    style.textContent = `
        .auth-global-loader {
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(12px);
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 0.9rem;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.15);
            transform: translateY(-120%) scale(0.9);
            opacity: 0;
            transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            pointer-events: none;
        }
        .auth-global-loader.active {
            transform: translateY(0) scale(1);
            opacity: 1;
        }
        .auth-global-loader.exiting {
            transform: translateY(-20px) scale(0.95);
            opacity: 0;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .auth-global-loader .loader-dot {
            width: 10px;
            height: 10px;
            background: #3b82f6;
            border-radius: 50%;
            position: relative;
        }
        .auth-global-loader .loader-dot::after {
            content: '';
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            background: inherit;
            border-radius: inherit;
            animation: pulse-ring 1.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }
        @keyframes pulse-ring {
            0% { transform: scale(0.33); opacity: 1; }
            80%, 100% { transform: scale(2.5); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
};

window.showPageLoader = () => {
    injectLoadingStyles();
    let loader = document.querySelector('.auth-global-loader');
    if (!loader) {
        loader = document.createElement('div');
        loader.className = 'auth-global-loader';
        loader.innerHTML = '<div class="loader-dot"></div> <span>Sincronizando dados...</span>';
        document.body.appendChild(loader);
    }
    loader.classList.remove('exiting');
    setTimeout(() => loader.classList.add('active'), 20);
};

window.hidePageLoader = () => {
    const loader = document.querySelector('.auth-global-loader');
    if (loader && loader.classList.contains('active')) {
        loader.classList.add('exiting');
        loader.classList.remove('active');
        setTimeout(() => {
            if (loader.parentNode) loader.remove();
        }, 600);
    }
};

/**
 * Auth Guard - Protects routes without white flash
 * @param {boolean} isAdmin - Whether it's an admin page
 */
export const checkAuth = (isAdmin = true) => {
    const isLoginPage = window.location.pathname.includes('login.html');
    const wasLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

    // Show the aesthetic loading tag
    window.showPageLoader();

    // If we're on the login page, we don't hide the body (it has its own theme)
    // If we have a hint that we were logged in, we DON'T hide the body to avoid flicker
    if (!isLoginPage && !wasLoggedIn) {
        document.body.style.opacity = '0';
    }

    return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
            // Determine relative path to admin/login.html
            const loginPath = isAdmin ? 'login.html' : '../admin/login.html';
            const dashboardPath = isAdmin ? 'dashboard.html' : '../admin/dashboard.html';

            if (!user) {
                // Clear hint if no user
                sessionStorage.removeItem('isLoggedIn');
                
                if (!isLoginPage) {
                    window.location.href = loginPath;
                }
                window.hidePageLoader();
                resolve(null);
            } else {
                // Set hint for next page load
                sessionStorage.setItem('isLoggedIn', 'true');

                if (isLoginPage) {
                    window.location.href = dashboardPath;
                }
                
                // Ensure body is visible (in case it was hidden)
                document.body.style.opacity = '1';
                document.body.style.transition = 'opacity 0.3s ease';
                
                updateUserUI(user);
                
                // Wait 3 seconds after the page is ready before hiding the loader
                const delayedHide = () => {
                    setTimeout(() => window.hidePageLoader(), 3000);
                };

                if (document.readyState === 'complete') {
                    delayedHide();
                } else {
                    window.addEventListener('load', delayedHide, { once: true });
                }
                
                resolve(user);
            }
        });
    });
};

/**
 * Update UI with user information
 */
const updateUserUI = (user) => {
    const userNameElement = document.querySelector('.user-profile h4');
    const userEmailElement = document.querySelector('.user-profile p');
    const userAvatarElement = document.querySelector('.user-avatar img');

    if (userNameElement) userNameElement.textContent = user.displayName || 'Administrador';
    if (userEmailElement) userEmailElement.textContent = user.email;
    if (userAvatarElement && user.photoURL) userAvatarElement.src = user.photoURL;
};

/**
 * Global Logout Function
 */
window.handleLogout = async () => {
    if (confirm('Deseja realmente sair?')) {
        try {
            // Clear session hint
            sessionStorage.removeItem('isLoggedIn');
            
            await signOut(auth);
            
            // Detect proper login path based on current location
            const isGlobalSite = window.location.pathname.includes('/site/');
            window.location.href = isGlobalSite ? '../admin/login.html' : 'login.html';
        } catch (error) {
            console.error('Erro ao sair:', error);
            alert('Erro ao tentar sair. Tente novamente.');
        }
    }
};
