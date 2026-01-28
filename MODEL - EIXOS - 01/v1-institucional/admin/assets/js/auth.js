/**
 * Firebase Authentication - Proteção de Rotas
 * Instituto Eixos - Painel Administrativo
 */

import { auth } from './firebase-config.js';
import {
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

/**
 * Verifica se o usuário está autenticado.
 * Se não estiver, redireciona para a página de login.
 * @param {Function} callback - Função a ser executada se o usuário estiver autenticado
 */
export function requireAuth(callback) {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Usuário autenticado - executa callback
            console.log('Usuário autenticado:', user.email);
            if (callback) callback(user);
        } else {
            // Usuário não autenticado - redireciona para login
            console.log('Usuário não autenticado. Redirecionando...');
            window.location.href = 'login.html';
        }
    });
}

/**
 * Obtém o usuário atualmente logado
 * @returns {Promise<User|null>}
 */
export function getCurrentUser() {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        });
    });
}

/**
 * Realiza logout do usuário
 * @returns {Promise<void>}
 */
export async function logout() {
    try {
        await signOut(auth);
        window.location.href = 'login.html';
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        alert('Erro ao sair. Tente novamente.');
    }
}

/**
 * Atualiza a interface do usuário com as informações do usuário logado
 * @param {User} user - Objeto do usuário do Firebase
 */
export function updateUserUI(user) {
    const userName = document.querySelector('.user-profile h4');
    const userEmail = document.querySelector('.user-profile p');
    const avatar = document.querySelector('.user-avatar img');

    if (user) {
        const displayName = user.displayName || user.email.split('@')[0];
        const avatarUrl = user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2563eb&color=fff`;

        if (userName) userName.textContent = displayName;
        if (userEmail) userEmail.textContent = user.email;
        if (avatar) avatar.src = avatarUrl;
    }
}

/**
 * Configura o botão de logout
 */
export function setupLogoutButton() {
    const logoutBtn = document.getElementById('logout-btn');

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('Deseja realmente sair?')) {
                await logout();
            }
        });
    }
}

// Exporta auth para uso em outros módulos se necessário
export { auth };
