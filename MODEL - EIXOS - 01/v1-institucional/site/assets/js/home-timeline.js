/* ============================================
   HOME - TIMELINE DE IMPACTO
   JavaScript para animações e interatividade
   ============================================ */

// ===== TIMELINE DATA =====
const timelineData = [
    {
        year: '2006',
        title: 'Fundação do Instituto',
        description: 'Início das atividades com grupo de voluntários "Amigos do Bem" em Ceilândia-DF.',
        icon: 'fas fa-flag',
        color: 'primary',
        stats: [
            { icon: 'fas fa-users', text: '10 Voluntários' },
            { icon: 'fas fa-map-marker-alt', text: '1 Região' }
        ]
    },
    {
        year: '2010',
        title: 'Formalização Legal',
        description: 'Constituição oficial do Instituto Eixos e obtenção do primeiro espaço físico.',
        icon: 'fas fa-building',
        color: 'green',
        stats: [
            { icon: 'fas fa-certificate', text: 'CNPJ Ativo' },
            { icon: 'fas fa-home', text: 'Sede Própria' }
        ]
    },
    {
        year: '2015',
        title: 'Primeiro Edital Público',
        description: 'Aprovação no primeiro edital de fomento, permitindo profissionalização da equipe.',
        icon: 'fas fa-file-contract',
        color: 'purple',
        stats: [
            { icon: 'fas fa-dollar-sign', text: 'R$ 500k' },
            { icon: 'fas fa-users-cog', text: '5 Funcionários' }
        ]
    },
    {
        year: '2020',
        title: 'Ação COVID-19',
        description: 'Distribuição massiva de alimentos e kits de higiene durante a pandemia.',
        icon: 'fas fa-hands-helping',
        color: 'red',
        stats: [
            { icon: 'fas fa-box', text: '10k Cestas' },
            { icon: 'fas fa-home', text: '5k Famílias' }
        ]
    },
    {
        year: '2024',
        title: 'Expansão Nacional',
        description: 'Início de parcerias interestaduais e ampliação dos projetos sociais.',
        icon: 'fas fa-globe-americas',
        color: 'green',
        stats: [
            { icon: 'fas fa-map-marked-alt', text: '27 Estados' },
            { icon: 'fas fa-project-diagram', text: '20 Projetos' }
        ]
    },
    {
        year: '2026',
        title: 'Brasília 2025',
        description: 'Lançamento do maior projeto de combate à fome do DF.',
        icon: 'fas fa-rocket',
        color: 'primary',
        stats: [
            { icon: 'fas fa-users', text: '2.500 Famílias' },
            { icon: 'fas fa-map-pin', text: '15 Regiões' }
        ]
    }
];

// ===== RENDER TIMELINE =====
function renderTimeline() {
    const container = document.querySelector('.timeline-items');
    if (!container) return;

    container.innerHTML = timelineData.map((item, index) => `
        <div class="timeline-item" data-index="${index}">
            <div class="timeline-content">
                <span class="timeline-year">${item.year}</span>
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                ${item.stats ? `
                    <div class="timeline-stats">
                        ${item.stats.map(stat => `
                            <div class="timeline-stat">
                                <i class="${stat.icon}"></i>
                                <span>${stat.text}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="timeline-marker ${item.color}">
                <i class="${item.icon}"></i>
            </div>
            <div class="timeline-content"></div>
        </div>
    `).join('');

    initTimelineAnimations();
}

// ===== TIMELINE ANIMATIONS =====
function initTimelineAnimations() {
    const items = document.querySelectorAll('.timeline-item');
    
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
    });

    items.forEach(item => {
        timelineObserver.observe(item);
    });
}

// ===== SCROLL PROGRESS LINE =====
function initScrollProgressLine() {
    const line = document.querySelector('.timeline-line');
    if (!line) return;

    window.addEventListener('scroll', () => {
        const timeline = document.querySelector('.impact-timeline');
        if (!timeline) return;

        const rect = timeline.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        // Calculate progress
        const timelineTop = rect.top;
        const timelineHeight = rect.height;
        const progress = Math.max(0, Math.min(1, (windowHeight - timelineTop) / timelineHeight));

        // Update line gradient
        line.style.background = `linear-gradient(180deg, 
            var(--primary) 0%, 
            var(--accent-green) ${progress * 50}%,
            var(--accent-purple) ${progress * 100}%,
            #e2e8f0 ${progress * 100}%
        )`;
    });
}

// ===== INITIALIZE =====
function initHomeTimeline() {
    console.log('🎨 Iniciando Timeline de Impacto...');
    
    renderTimeline();
    initScrollProgressLine();
    
    console.log('✅ Timeline de Impacto carregada!');
}

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomeTimeline);
} else {
    initHomeTimeline();
}

// ===== EXPORT =====
window.HomeTimeline = {
    renderTimeline,
    initTimelineAnimations,
    timelineData
};
