import { db } from './firebase-config.js';
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const allProjectsGrid = document.getElementById('all-projects-grid');
    let loadedProjects = [];

    if (allProjectsGrid) {
        const q = query(collection(db, "projetos"), orderBy("createdAt", "desc"));
        onSnapshot(q, (snapshot) => {
            allProjectsGrid.innerHTML = '';
            
            if (snapshot.empty) {
                allProjectsGrid.innerHTML = '<div class="col-12 text-center py-5"><p class="lead text-muted">Aguardando novos projetos serem cadastrados...</p></div>';
                return;
            }

            loadedProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            loadedProjects.forEach((proj) => {
                const card = `
                    <div class="article-card reveal" style="cursor: pointer" 
                         data-category="${proj.category || 'Geral'}"
                         onclick="openProjectFromId('${proj.id}')">
                        <div class="article-image">
                            <img src="${(proj.imageUrl || 'assets/img/projeto-brasilia-2025-1.png').replace('../', '')}" alt="${proj.title}" loading="lazy">
                        </div>
                        <div class="article-content">
                            <h3 class="article-title">${proj.title}</h3>
                            <div class="card-stats-preview">
                                <span><i class="fas fa-chart-line"></i> ${proj.stat_main || ''}</span>
                            </div>
                            <p class="article-excerpt">${proj.excerpt || ''}</p>
                            <button class="btn btn-outline btn-sm mt-auto" onclick="event.stopPropagation(); openProjectFromId('${proj.id}')">Ver Detalhes</button>
                        </div>
                    </div>
                `;
                allProjectsGrid.insertAdjacentHTML('beforeend', card);
            });
        });
    }

    window.openProjectFromId = (id) => {
        const project = loadedProjects.find(p => p.id === id);
        if (project && typeof openProjectModal === 'function') {
            const mockElement = {
                getAttribute: (attr) => {
                    const imagesArray = (project.gallery && project.gallery.length > 0) ? project.gallery : [project.imageUrl || 'assets/img/projeto-brasilia-2025-1.png'];
                    if (attr === 'data-title') return project.title || '';
                    if (attr === 'data-category') return project.category || '';
                    if (attr === 'data-description') return project.excerpt || '';
                    if (attr === 'data-stats') return `${project.stat_main || ''} | ${project.stat_sec || ''}`;
                    if (attr === 'data-full-description') return project.full_description || project.excerpt || '';
                    if (attr === 'data-images') return JSON.stringify(imagesArray.map(url => (url || '').replace('../', '')));
                    return '';
                }
            };
            openProjectModal(mockElement);
        }
    };
});
