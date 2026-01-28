import { db } from './firebase-config.js';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const editaisList = document.querySelector('.editais-list');
    if (editaisList) {
        const q = query(collection(db, "transparencia"), orderBy("date", "desc"));
        onSnapshot(q, (snapshot) => {
            editaisList.innerHTML = '';
            
            if (snapshot.empty) {
                 editaisList.innerHTML = '<p class="text-center py-5 text-muted">Nenhum documento disponível no momento.</p>';
                 return;
            }

            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                let dateDisplay = 'Recente';
                if (data.date) {
                     const parts = data.date.split('-');
                     if (parts.length === 3) dateDisplay = `${parts[2]}/${parts[1]}/${parts[0]}`;
                } else if (data.createdAt && data.createdAt.toDate) {
                     dateDisplay = data.createdAt.toDate().toLocaleDateString('pt-BR');
                }

                let tagClass = 'tag-primary';
                if (data.status === 'Concluído') tagClass = 'tag-green';
                if (data.status === 'Encerrado') tagClass = 'tag-red';

                const item = `
                    <div class="edital-item" style="display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; border-bottom: 1px solid #e2e8f0;">
                        <div class="edital-info">
                            <span class="tag ${tagClass}" style="margin-bottom: 0.5rem;">${data.status || 'Aberto'}</span>
                            <h3 style="font-size: 1.2rem; margin-bottom: 0.25rem;">${data.title}</h3>
                            <p style="color: var(--text-light); font-size: 0.9rem;">${data.description || ''}</p>
                            <small style="color: var(--text-light);"><i class="far fa-calendar-alt"></i> Publicado em: ${dateDisplay}</small>
                        </div>
                        <a href="${data.fileUrl || '#'}" class="btn btn-outline" style="font-size: 0.85rem;" target="_blank">
                            <i class="fas fa-download"></i> Baixar PDF
                        </a>
                    </div>
                `;
                editaisList.insertAdjacentHTML('beforeend', item);
            });
        });
    }
    
    // Load Dashboard Stats
    async function loadStats() {
        try {
            const docRef = doc(db, "config", "transparency_stats");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                
                // Update Arrecadado
                const arrecadadoVal = document.getElementById('stat-arrecadado-val');
                const arrecadadoSub = document.getElementById('stat-arrecadado-sub');
                if (arrecadadoVal && data.stat_arrecadado_val) {
                    const val = data.stat_arrecadado_val.trim();
                    arrecadadoVal.innerText = val.startsWith('R$') ? val : `R$ ${val}`;
                }
                if (arrecadadoSub && data.stat_arrecadado_sub) {
                    const isUp = data.stat_arrecadado_sub.includes('+') || data.stat_arrecadado_sub.toLowerCase().includes('alta') || data.stat_arrecadado_sub.includes('%');
                    arrecadadoSub.innerHTML = `<i class="fas fa-arrow-${isUp ? 'up' : 'info-circle'}"></i> ${data.stat_arrecadado_sub}`;
                }

                // Update Investido
                const investidoVal = document.getElementById('stat-investido-val');
                const investidoSub = document.getElementById('stat-investido-sub');
                if (investidoVal && data.stat_investido_val) {
                    const val = data.stat_investido_val.trim();
                    investidoVal.innerText = val.startsWith('R$') ? val : `R$ ${val}`;
                }
                if (investidoSub && data.stat_investido_sub) investidoSub.innerText = data.stat_investido_sub;

                // Update Familias
                const familiasVal = document.getElementById('stat-familias-val');
                const familiasSub = document.getElementById('stat-familias-sub');
                if (familiasVal && data.stat_familias_val) familiasVal.innerText = data.stat_familias_val;
                if (familiasSub && data.stat_familias_sub) familiasSub.innerText = data.stat_familias_sub;

                // Update Voluntarios
                const voluntariosVal = document.getElementById('stat-voluntarios-val');
                const voluntariosSub = document.getElementById('stat-voluntarios-sub');
                if (voluntariosVal && data.stat_voluntarios_val) voluntariosVal.innerText = data.stat_voluntarios_val;
                if (voluntariosSub && data.stat_voluntarios_sub) voluntariosSub.innerText = data.stat_voluntarios_sub;
            }

            // Load Institutional Docs
            const instRef = doc(db, "config", "institutional_docs");
            const instSnap = await getDoc(instRef);
            if (instSnap.exists()) {
                const instData = instSnap.data();
                const ids = ['estatuto', 'ata', 'oscip', 'cnpj'];
                ids.forEach(id => {
                    const el = document.getElementById(`link-view-${id}`);
                    if (el && instData[id]) {
                        el.href = instData[id];
                    }
                });
            }
        } catch (error) {
            console.error("Erro ao carregar dashboard stats:", error);
        }
    }

    loadStats();

    // Load Actions & Projects
    const actionsTableBody = document.getElementById('actions-table-body');
    if (actionsTableBody) {
        const qActions = query(collection(db, "transparencia_acoes"), orderBy("createdAt", "desc"));
        onSnapshot(qActions, (snapshot) => {
            actionsTableBody.innerHTML = '';
            
            if (snapshot.empty) {
                actionsTableBody.innerHTML = '<tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--text-light);">Nenhum registro encontrado.</td></tr>';
                return;
            }

            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                let tagClass = 'tag-primary';
                if (data.status === 'CONCLUÍDO') tagClass = 'tag-green';
                
                const valor = data.valor ? (data.valor.startsWith('R$') ? data.valor : `R$ ${data.valor}`) : '---';

                const row = `
                    <tr style="border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 1rem;"><strong>${data.nome}</strong></td>
                        <td style="padding: 1rem;">${data.local}</td>
                        <td style="padding: 1rem;"><span class="tag ${tagClass}">${data.status}</span></td>
                        <td style="padding: 1rem;">${valor}</td>
                        <td style="padding: 1rem;">${data.data}</td>
                    </tr>
                `;
                actionsTableBody.insertAdjacentHTML('beforeend', row);
            });
        });
    }
});

