/* ============================================
   TODOS PROJETOS - PREMIUM INTERACTIONS
   Filtros, sorting e infinite scroll
   ============================================ */

// ===== PROJECTS DATA =====
let allProjects = [
    { id: 1, title: 'Brasília 2025', category: 'saude', status: 'active', beneficiaries: 2500, regions: 15, image: 'assets/img/projeto-brasilia-2025-1.png', excerpt: 'Combate à fome no DF' },
    { id: 2, title: 'Mutirão da Saúde', category: 'saude', status: 'active', beneficiaries: 1200, regions: 8, image: 'assets/img/quem-somos-r1nd93a231j678w13jhp92onbbjg4k3aktxfpo7pow.webp', excerpt: 'Atendimento médico itinerante' },
    { id: 3, title: 'Futuro Brilhante', category: 'educacao', status: 'active', beneficiaries: 350, regions: 5, image: 'assets/img/ong-instituto-eixos-1024x682.webp', excerpt: 'Cursos profissionalizantes' },
    { id: 4, title: 'Sorriso Feliz', category: 'saude', status: 'completed', beneficiaries: 500, regions: 3, image: 'assets/img/quem-somos-team.png', excerpt: 'Saúde bucal para crianças' },
    { id: 5, title: 'Arte e Cultura', category: 'cultura', status: 'upcoming', beneficiaries: 200, regions: 4, image: 'assets/img/about-hero.png', excerpt: 'Oficinas culturais' },
    { id: 6, title: 'Esporte para Todos', category: 'educacao', status: 'active', beneficiaries: 450, regions: 6, image: 'assets/img/ong-instituto-eixos.png', excerpt: 'Atividades esportivas' }
];

let filteredProjects = [...allProjects];
let displayedProjects = [];
let currentPage = 0;
const projectsPerPage = 6;

// ===== FILTERS =====
const activeFilters = {
    categories: [],
    status: [],
    search: ''
};

function toggleFilter(type, value) {
    const index = activeFilters[type].indexOf(value);
    
    if (index > -1) {
        activeFilters[type].splice(index, 1);
    } else {
        activeFilters[type].push(value);
    }
    
    applyFilters();
}

function applyFilters() {
    filteredProjects = allProjects.filter(project => {
        // Category filter
        if (activeFilters.categories.length > 0 && !activeFilters.categories.includes(project.category)) {
            return false;
        }
        
        // Status filter
        if (activeFilters.status.length > 0 && !activeFilters.status.includes(project.status)) {
            return false;
        }
        
        // Search filter
        if (activeFilters.search) {
            const searchLower = activeFilters.search.toLowerCase();
            if (!project.title.toLowerCase().includes(searchLower) && 
                !project.excerpt.toLowerCase().includes(searchLower)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Reset pagination
    currentPage = 0;
    displayedProjects = [];
    
    // Update count
    updateProjectsCount();
    
    // Render
    renderProjects(true);
}

function searchProjects(query) {
    activeFilters.search = query;
    applyFilters();
}

// ===== SORTING =====
function sortProjects(criteria) {
    switch(criteria) {
        case 'recent':
            filteredProjects.sort((a, b) => b.id - a.id);
            break;
        case 'impact':
            filteredProjects.sort((a, b) => b.beneficiaries - a.beneficiaries);
            break;
        case 'name':
            filteredProjects.sort((a, b) => a.title.localeCompare(b.title));
            break;
    }
    
    renderProjects(true);
}

// ===== RENDER PROJECTS =====
function renderProjects(reset = false) {
    const container = document.querySelector('.all-projects-grid');
    if (!container) return;
    
    if (reset) {
        container.innerHTML = '';
        displayedProjects = [];
        currentPage = 0;
    }
    
    const start = currentPage * projectsPerPage;
    const end = start + projectsPerPage;
    const projectsToShow = filteredProjects.slice(start, end);
    
    projectsToShow.forEach(project => {
        const card = createProjectCard(project);
        container.appendChild(card);
        displayedProjects.push(project);
    });
    
    currentPage++;
    
    // Update load more button
    updateLoadMoreButton();
}

function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card-full';
    card.innerHTML = `
        <div class="project-image-full">
            <img src="${project.image}" alt="${project.title}" loading="lazy">
            <span class="project-status status-${project.status}">
                ${getStatusLabel(project.status)}
            </span>
            <span class="project-category-badge category-${project.category}">
                ${getCategoryLabel(project.category)}
            </span>
        </div>
        <div class="project-content-full">
            <h3 class="project-title-full">${project.title}</h3>
            <p class="project-excerpt-full">${project.excerpt}</p>
            <div class="project-stats-full">
                <span class="stat-full">
                    <i class="fas fa-users"></i>
                    ${project.beneficiaries} beneficiários
                </span>
                <span class="stat-full">
                    <i class="fas fa-map-marker-alt"></i>
                    ${project.regions} regiões
                </span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        console.log('Abrindo projeto:', project.id);
    });
    
    return card;
}

// ===== INFINITE SCROLL =====
function loadMore() {
    const btn = document.querySelector('.load-more-btn');
    btn.classList.add('loading');
    
    // Show skeleton
    showSkeletonCards();
    
    setTimeout(() => {
        renderProjects();
        btn.classList.remove('loading');
        hideSkeletonCards();
    }, 1000);
}

function showSkeletonCards() {
    const container = document.querySelector('.all-projects-grid');
    for (let i = 0; i < 3; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-card';
        skeleton.innerHTML = `
            <div class="skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton-line"></div>
                <div class="skeleton-line short"></div>
                <div class="skeleton-line"></div>
            </div>
        `;
        container.appendChild(skeleton);
    }
}

function hideSkeletonCards() {
    document.querySelectorAll('.skeleton-card').forEach(el => el.remove());
}

function updateLoadMoreButton() {
    const btn = document.querySelector('.load-more-btn');
    if (!btn) return;
    
    const hasMore = displayedProjects.length < filteredProjects.length;
    btn.style.display = hasMore ? 'inline-flex' : 'none';
}

// ===== HELPER FUNCTIONS =====
function getStatusLabel(status) {
    const labels = {
        'active': 'Ativo',
        'completed': 'Concluído',
        'upcoming': 'Em Breve'
    };
    return labels[status] || status;
}

function getCategoryLabel(category) {
    const labels = {
        'saude': 'Saúde',
        'educacao': 'Educação',
        'cultura': 'Cultura'
    };
    return labels[category] || category;
}

function updateProjectsCount() {
    const countEl = document.querySelector('.projects-count');
    if (countEl) {
        countEl.innerHTML = `Mostrando <strong>${filteredProjects.length}</strong> projetos`;
    }
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Iniciando Todos Projetos Premium...');
    
    renderProjects();
    updateProjectsCount();
    
    // Add filter listeners
    document.querySelectorAll('.filter-checkbox input').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            const type = e.target.getAttribute('data-filter-type');
            const value = e.target.value;
            toggleFilter(type, value);
        });
    });
    
    // Add sort listener
    const sortSelect = document.querySelector('.sort-dropdown select');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortProjects(e.target.value);
        });
    }
    
    console.log('✅ Todos Projetos Premium carregado!');
});

// ===== EXPORT =====
window.TodosProjetosPremium = {
    toggleFilter,
    searchProjects,
    sortProjects,
    loadMore
};
