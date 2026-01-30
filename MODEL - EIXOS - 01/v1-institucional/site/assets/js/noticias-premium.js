/* ============================================
   NOTÍCIAS - PREMIUM INTERACTIONS
   Filtros, paginação e animações
   ============================================ */

// ===== NEWS DATA =====
const newsData = [
    {
        id: 1,
        title: 'Brasília 2025 Atinge Marca de 2.500 Famílias Atendidas',
        excerpt: 'Nosso principal projeto de combate à fome alcança novo marco histórico, distribuindo cestas básicas e itens essenciais.',
        category: 'projetos',
        date: '2026-01-25',
        author: 'Equipe Eixos',
        image: 'assets/img/projeto-brasilia-2025-1.png',
        featured: true
    },
    {
        id: 2,
        title: 'Mutirão da Saúde Realiza 1.200 Atendimentos',
        excerpt: 'Ação itinerante leva atendimento médico e oftalmológico para comunidades carentes do DF.',
        category: 'eventos',
        date: '2026-01-20',
        author: 'Dr. Ana Costa',
        image: 'assets/img/quem-somos-r1nd93a231j678w13jhp92onbbjg4k3aktxfpo7pow.webp'
    },
    {
        id: 3,
        title: 'Instituto Eixos Recebe Certificação de Transparência',
        excerpt: 'Reconhecimento pela gestão transparente e prestação de contas exemplar.',
        category: 'conquistas',
        date: '2026-01-15',
        author: 'Direção',
        image: 'assets/img/transparencia-r1nd963knjn162rxn2pkyjz13h5jrnehl7vw5i3j68.webp'
    },
    {
        id: 4,
        title: 'Futuro Brilhante Forma 350 Alunos em Cursos Profissionalizantes',
        excerpt: 'Projeto de educação profissional celebra nova turma de formandos prontos para o mercado.',
        category: 'projetos',
        date: '2026-01-10',
        author: 'Coord. Educação',
        image: 'assets/img/ong-instituto-eixos-1024x682.webp'
    },
    {
        id: 5,
        title: 'Novo Edital de Fomento Aprovado',
        excerpt: 'Instituto Eixos é contemplado em edital público para expansão de projetos sociais.',
        category: 'comunicados',
        date: '2026-01-05',
        author: 'Administrativo',
        image: 'assets/img/about-hero.png'
    },
    {
        id: 6,
        title: 'Campanha Sorriso Atende 500 Crianças',
        excerpt: 'Saúde bucal chega às escolas públicas com atendimento odontológico gratuito.',
        category: 'eventos',
        date: '2025-12-28',
        author: 'Equipe Saúde',
        image: 'assets/img/quem-somos-team.png'
    }
];

let currentPage = 1;
const itemsPerPage = 6;
let filteredNews = [...newsData];

// ===== RENDER FEATURED NEWS =====
function renderFeaturedNews() {
    const featured = newsData.find(n => n.featured);
    if (!featured) return;

    const container = document.querySelector('.featured-news-container');
    if (!container) return;

    container.innerHTML = `
        <div class="featured-news reveal">
            <div class="featured-image">
                <img src="${featured.image}" alt="${featured.title}" loading="lazy">
            </div>
            <div class="featured-content">
                <div class="featured-meta">
                    <span class="news-category category-${featured.category}">${getCategoryName(featured.category)}</span>
                    <span class="news-date">
                        <i class="far fa-calendar"></i>
                        ${formatDate(featured.date)}
                    </span>
                </div>
                <h2>${featured.title}</h2>
                <p class="featured-excerpt">${featured.excerpt}</p>
                <button class="btn btn-primary">
                    Ler Notícia Completa
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;
}

// ===== RENDER NEWS GRID =====
function renderNewsGrid(page = 1) {
    const container = document.querySelector('.news-grid');
    if (!container) return;

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageNews = filteredNews.slice(start, end).filter(n => !n.featured);

    container.innerHTML = pageNews.map((news, index) => `
        <div class="news-card reveal delay-${index * 100}" data-category="${news.category}">
            <div class="news-image">
                <img src="${news.image}" alt="${news.title}" loading="lazy">
                <span class="news-category category-${news.category}">
                    ${getCategoryName(news.category)}
                </span>
            </div>
            <div class="news-content">
                <div class="news-date">
                    <i class="far fa-calendar"></i>
                    ${formatDate(news.date)}
                </div>
                <h3 class="news-title">${news.title}</h3>
                <p class="news-excerpt">${news.excerpt}</p>
                <div class="news-footer">
                    <div class="news-author">
                        <div class="author-avatar">${getInitials(news.author)}</div>
                        <span class="author-name">${news.author}</span>
                    </div>
                    <div class="read-more">
                        Ler mais
                        <i class="fas fa-arrow-right"></i>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    renderPagination();
    initScrollAnimations();
}

// ===== RENDER SIDEBAR =====
function renderSidebar() {
    const sidebar = document.querySelector('.news-sidebar');
    if (!sidebar) return;

    const recentNews = newsData.slice(0, 4);

    sidebar.innerHTML = `
        <h3 class="sidebar-title">Notícias Recentes</h3>
        ${recentNews.map(news => `
            <div class="recent-item">
                <div class="recent-thumb">
                    <img src="${news.image}" alt="${news.title}" loading="lazy">
                </div>
                <div class="recent-info">
                    <h4>${news.title}</h4>
                    <div class="recent-date">
                        <i class="far fa-calendar"></i>
                        ${formatDate(news.date)}
                    </div>
                </div>
            </div>
        `).join('')}
    `;
}

// ===== PAGINATION =====
function renderPagination() {
    const container = document.querySelector('.pagination');
    if (!container) return;

    const totalPages = Math.ceil(filteredNews.filter(n => !n.featured).length / itemsPerPage);
    
    let html = '';
    
    // Previous button
    html += `
        <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                ${i}
            </button>
        `;
    }

    // Next button
    html += `
        <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;

    container.innerHTML = html;
}

function changePage(page) {
    const totalPages = Math.ceil(filteredNews.filter(n => !n.featured).length / itemsPerPage);
    if (page < 1 || page > totalPages) return;

    currentPage = page;
    renderNewsGrid(page);
    
    // Scroll to top of news grid
    document.querySelector('.news-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== FILTERS =====
function initFilters() {
    const filtersContainer = document.querySelector('.news-filters');
    if (!filtersContainer) return;

    const filterBtns = filtersContainer.querySelectorAll('.gallery-filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            filterNews(filter);
        });
    });
}

function filterNews(category) {
    if (category === 'all') {
        filteredNews = [...newsData];
    } else {
        filteredNews = newsData.filter(n => n.category === category);
    }

    currentPage = 1;
    renderNewsGrid(1);
}

// ===== HELPER FUNCTIONS =====
function getCategoryName(category) {
    const names = {
        'projetos': 'Projetos',
        'eventos': 'Eventos',
        'comunicados': 'Comunicados',
        'conquistas': 'Conquistas'
    };
    return names[category] || category;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    reveals.forEach(reveal => {
        reveal.style.opacity = '0';
        reveal.style.transform = 'translateY(30px)';
        reveal.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        revealObserver.observe(reveal);
    });
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Iniciando Notícias Premium...');
    
    renderFeaturedNews();
    renderNewsGrid(1);
    renderSidebar();
    initFilters();
    initScrollAnimations();
    
    console.log('✅ Notícias Premium carregadas!');
});

// ===== EXPORT =====
window.changePage = changePage;

window.NoticiasPremium = {
    filterNews,
    renderNewsGrid,
    changePage
};
