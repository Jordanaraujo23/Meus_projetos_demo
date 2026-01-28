import { auth, db } from './firebase-config.js';
import { checkAuth } from './auth-guard.js';

// Common Admin UI Logic
export const initCommon = async () => {
    console.log("Admin Common UI Initializing...");

    // Protect Route
    await checkAuth();

    // Sidebar Toggle (Mobile)
    const toggleBtn = document.querySelector('.menu-toggle-admin');
    const sidebar = document.querySelector('.sidebar');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target) && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Modal Helpers
    window.openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('open');
    };

    window.closeModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('open');
    };

    // Close on overlay click
    document.querySelectorAll('.admin-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('open');
            }
        });
    });

    // Real Logout
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (typeof window.handleLogout === 'function') {
                await window.handleLogout();
            }
        });
    }
};

