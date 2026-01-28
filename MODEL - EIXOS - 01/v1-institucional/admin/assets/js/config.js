import { db, auth } from './firebase-config.js';
import { collection, getDocs, deleteDoc, doc, writeBatch, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { initCommon } from './admin-common.js';

initCommon();

// Load Site Settings
const loadSettings = async () => {
    try {
        const docRef = doc(db, "config", "site");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('site-name').value = data.name || '';
            document.getElementById('site-email').value = data.email || '';
            document.getElementById('site-whatsapp').value = data.whatsapp || '';
            document.getElementById('site-address').value = data.address || '';
            document.getElementById('site-instagram').value = data.instagram || '';
            document.getElementById('site-facebook').value = data.facebook || '';
            document.getElementById('site-youtube').value = data.youtube || '';
        }
    } catch (error) {
        console.error("Erro ao carregar configurações:", error);
    }
};

// Save Site Settings
document.getElementById('site-settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';

    const settings = {
        name: document.getElementById('site-name').value,
        email: document.getElementById('site-email').value,
        whatsapp: document.getElementById('site-whatsapp').value,
        address: document.getElementById('site-address').value,
        instagram: document.getElementById('site-instagram').value,
        facebook: document.getElementById('site-facebook').value,
        youtube: document.getElementById('site-youtube').value,
        updatedAt: new Date().toISOString()
    };

    try {
        await setDoc(doc(db, "config", "site"), settings);
        alert('Configurações salvas com sucesso!');
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert('Erro ao salvar as configurações.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
});

// Security Functions
window.sendPasswordReset = async () => {
    const user = auth.currentUser;
    if (user && user.email) {
        if (confirm(`Deseja enviar um e-mail de recuperação de senha para ${user.email}?`)) {
            try {
                await sendPasswordResetEmail(auth, user.email);
                alert('E-mail de recuperação enviado! Verifique sua caixa de entrada.');
            } catch (error) {
                console.error("Erro ao enviar e-mail:", error);
                alert('Erro ao solicitar recuperação de senha.');
            }
        }
    }
};

// Maintenance Functions
window.runDeduplication = async (event) => {
    if (!confirm('Deseja remover registros duplicados?')) return;
    
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Limpando...';

    try {
        const collections = [
            { name: 'projetos', key: 'title' },
            { name: 'noticias', key: 'title' },
            { name: 'galeria', key: 'imageUrl' }
        ];

        let totalRemoved = 0;
        for (const coll of collections) {
            const snap = await getDocs(collection(db, coll.name));
            const seen = new Set();
            const batch = writeBatch(db);
            let collRemoved = 0;

            snap.forEach(docSnap => {
                const val = docSnap.data()[coll.key];
                if (seen.has(val)) {
                    batch.delete(doc(db, coll.name, docSnap.id));
                    totalRemoved++;
                    collRemoved++;
                } else {
                    seen.add(val);
                }
            });
            if (collRemoved > 0) await batch.commit();
        }
        alert(`Sucesso! ${totalRemoved} duplicados removidos.`);
    } catch (error) {
        console.error(error);
        alert('Erro: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
};

// Initial Load
loadSettings();
