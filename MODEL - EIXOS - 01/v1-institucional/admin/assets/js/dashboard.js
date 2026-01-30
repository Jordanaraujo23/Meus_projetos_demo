import { db } from './firebase-config.js';
import { 
    collection, 
    getDocs, 
    onSnapshot, 
    query, 
    where, 
    addDoc, 
    doc,
    limit,
    orderBy,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { initialData } from './migration-data.js';
import { initCommon } from './admin-common.js';

// Initialize Page
initCommon();

// Stats Real-time Listeners
// 1. Visitas no Site (Mês)
onSnapshot(doc(db, "config", "analytics"), (docSnap) => {
    const visitStat = document.querySelector('.stats-grid .stat-card:nth-child(1) .stat-value');
    if (visitStat) {
        visitStat.textContent = docSnap.exists() ? (docSnap.data().visits || 0) : '0';
    }
});

// 2. Projetos
onSnapshot(collection(db, "projetos"), (snapshot) => {
    const projectStat = document.querySelector('.stats-grid .stat-card:nth-child(2) .stat-value');
    if (projectStat) projectStat.textContent = snapshot.size;
});

// 3. Galeria
onSnapshot(collection(db, "galeria"), (snapshot) => {
    const galleryStat = document.querySelector('.stats-grid .stat-card:nth-child(3) .stat-value');
    if (galleryStat) galleryStat.textContent = snapshot.size;
});

// 4. Fale Conosco
onSnapshot(query(collection(db, "fale-conosco"), where("status", "==", "unread")), (snapshot) => {
    const msgDashboardStat = document.querySelector('.stats-grid .stat-card:nth-child(4) .stat-value');
    if (msgDashboardStat) msgDashboardStat.textContent = snapshot.size;
});

// Recent Activity Logic
const activityTbody = document.querySelector('.content-card table tbody');
if (activityTbody) {
    let activities = { news: [], projects: [] };

    const renderActivities = () => {
        const combined = [...activities.news, ...activities.projects]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, 5);

        activityTbody.innerHTML = combined.length ? '' : '<tr><td colspan="4" style="text-align:center; padding:2rem;">Nenhuma atividade recente.</td></tr>';
        
        combined.forEach(act => {
            const dateStr = act.createdAt?.toDate ? act.createdAt.toDate().toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Recente';
            const row = `
                <tr>
                    <td><div style="display:flex; align-items:center; gap:0.5rem;"><img src="https://ui-avatars.com/api/?name=${act.author}&background=random" style="width:24px; height:24px; border-radius:50%"> ${act.author}</div></td>
                    <td>${act.action} "${act.title}"</td>
                    <td>${dateStr}</td>
                    <td><span class="status-badge active">Concluído</span></td>
                </tr>
            `;
            activityTbody.insertAdjacentHTML('beforeend', row);
        });
    };

    onSnapshot(query(collection(db, "noticias"), orderBy("createdAt", "desc"), limit(5)), (snap) => {
        activities.news = snap.docs.map(d => ({ ...d.data(), type: 'news', action: 'Publicou notícia', author: 'Admin' }));
        renderActivities();
    });

    onSnapshot(query(collection(db, "projetos"), orderBy("createdAt", "desc"), limit(5)), (snap) => {
        activities.projects = snap.docs.map(d => ({ ...d.data(), type: 'project', action: 'Criou projeto', author: 'Admin' }));
        renderActivities();
    });
}

// System Status Dynamic Update
const updateSystemStatus = () => {
    const backupElement = document.querySelector('[style*="background: linear-gradient(135deg, #1e293b, #0f172a)"] div:last-child strong');
    if (backupElement) {
        const now = new Date();
        backupElement.textContent = `Hoje, ${now.getHours()}:${now.getMinutes() < 10 ? '0' : ''}${now.getMinutes()}`;
    }
};
updateSystemStatus();

// Migration Check
const checkAndShowMigration = async () => {
    const snap = await getDocs(collection(db, "projetos"));
    if (snap.empty) {
        const container = document.querySelector('.stats-grid');
        if (!container) return;
        
        const migrateBtn = document.createElement('div');
        migrateBtn.className = 'stat-card';
        migrateBtn.style.cursor = 'pointer';
        migrateBtn.style.background = '#2563eb';
        migrateBtn.style.color = 'white';
        migrateBtn.innerHTML = `
            <div class="stat-header">
                <div>
                    <div class="stat-value" style="font-size: 1.25rem;">Sincronizar Dados</div>
                    <div class="stat-label" style="color: rgba(255,255,255,0.85);">Restaurar conteúdo padrão</div>
                </div>
                <div class="stat-icon" style="color: white;"><i class="fas fa-sync-alt"></i></div>
            </div>
        `;
        migrateBtn.onclick = runMigration;
        container.appendChild(migrateBtn);
    }
};

const runMigration = async () => {
    if (!confirm('Deseja sincronizar o conteúdo padrão para o banco de dados?')) return;
    
    try {
        for (const [collName, items] of Object.entries(initialData)) {
            console.log(`Sincronizando ${collName}...`);
            for (const item of items) {
                await addDoc(collection(db, collName), {
                    ...item,
                    createdAt: serverTimestamp()
                });
            }
        }
        alert('Sucesso! Dados sincronizados com sucesso.');
        window.location.reload();
    } catch (error) {
        console.error(error);
        alert('Erro na sincronização: ' + error.message);
    }
};

checkAndShowMigration();
