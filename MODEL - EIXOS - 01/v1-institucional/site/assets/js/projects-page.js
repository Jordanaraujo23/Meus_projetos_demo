import { db } from './firebase-config.js';
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
    const projectsGrid = document.querySelector('.page-grid');
    const heroProjectContent = document.querySelector('.hero-project-content');
    const heroProjectImage = document.querySelector('.hero-project-image img');
    
    let loadedProjects = [];

    if (projectsGrid) {
        const q = query(collection(db, "projetos"), orderBy("createdAt", "desc"));
        onSnapshot(q, (snapshot) => {
            projectsGrid.innerHTML = '';
            
            if (snapshot.empty) {
                projectsGrid.innerHTML = '<div class="col-12 text-center py-5"><p class="lead text-muted">Aguardando novos projetos serem cadastrados...</p></div>';
                return;
            }

            loadedProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            let featured = loadedProjects.find(p => p.isMain === true || p.isMain === "true") || loadedProjects[0];

            if (heroProjectContent && featured) {
                if (heroProjectImage) {
                    heroProjectImage.src = (featured.imageUrl || 'assets/img/projeto-brasilia-2025-1.png').replace('../', '');
                }
                heroProjectContent.innerHTML = `
                    <span class="tag tag-primary mb-3 d-inline-block">Projeto Destaque</span>
                    <h2>${featured.title}</h2>
                    <p class="lead">${featured.excerpt || ''}</p>
                    <div class="d-flex gap-3">
                        <div class="d-flex align-items-center gap-2"><i class="fas fa-home text-primary"></i><span>${featured.stat_main || 'N/A'}</span></div>
                        <div class="d-flex align-items-center gap-2"><i class="fas fa-map-marker-alt text-primary"></i><span>${featured.stat_sec || 'N/A'}</span></div>
                    </div>
                    <button class="btn btn-primary mt-4" onclick="openProjectFromId('${featured.id}')">Conhecer Projeto</button>
                `;
            }

            const gridProjects = loadedProjects.filter(p => p.id !== featured?.id);
            gridProjects.forEach((proj) => {
                const imagesArray = (proj.gallery && proj.gallery.length > 0) ? proj.gallery : [proj.imageUrl || 'assets/img/projeto-brasilia-2025-1.png'];
                const card = `
                    <div class="article-card reveal" style="cursor: pointer" 
                         data-category="${proj.category || 'Geral'}"
                         onclick="openProjectFromId('${proj.id}')">
                        <div class="article-image">
                            <img src="${imagesArray[0].replace('../', '')}" loading="lazy">
                        </div>
                        <div class="article-content">
                            <h3 class="article-title">${proj.title}</h3>
                            <p class="article-excerpt">${proj.excerpt || ''}</p>
                            <button class="btn btn-outline btn-sm mt-auto" onclick="event.stopPropagation(); openProjectFromId('${proj.id}')">Ver Detalhes</button>
                        </div>
                    </div>
                `;
                projectsGrid.insertAdjacentHTML('beforeend', card);
            });
            
            setTimeout(() => {
                document.querySelectorAll('.reveal').forEach(r => r.classList.add('active'));
            }, 100);
        });
    }

    window.openProjectFromId = (id) => {
        const project = loadedProjects.find(p => p.id === id);
        if (project) {
            const imagesArray = (project.gallery && project.gallery.length > 0) ? project.gallery : [project.imageUrl || 'assets/img/projeto-brasilia-2025-1.png'];
            const mockElement = {
                getAttribute: (attr) => {
                    if (attr === 'data-title') return project.title || '';
                    if (attr === 'data-category') return project.category || '';
                    if (attr === 'data-description') return project.excerpt || '';
                    if (attr === 'data-stats') return `${project.stat_main || ''} | ${project.stat_sec || ''}`;
                    if (attr === 'data-full-description') return project.full_description || project.excerpt || '';
                    if (attr === 'data-images') return JSON.stringify(imagesArray.map(url => (url || '').replace('../', '')));
                    return '';
                }
            };
            if (typeof openProjectModal === 'function') openProjectModal(mockElement);
        }
    };
});
