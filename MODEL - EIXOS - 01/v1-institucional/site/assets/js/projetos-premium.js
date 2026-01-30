/* ============================================
   PROJETOS - PREMIUM INTERACTIONS
   Filtros animados, modal interativo e masonry grid
   ============================================ */

// ===== STATE MANAGEMENT =====
let currentFilter = 'Todos';
let currentCarouselIndex = 0;
let carouselImages = [];

// ===== FILTROS ANIMADOS =====
function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.article-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.textContent.trim();
            currentFilter = filter;

            // Animate filter
            filterProjects(filter, projectCards);
        });
    });
}

function filterProjects(filter, cards) {
    cards.forEach((card, index) => {
        const category = card.getAttribute('data-category');
        
        if (filter === 'Todos' || category === filter) {
            // Show card with animation
            card.classList.remove('filtered-out');
            card.classList.add('filtered-in');
            card.style.display = '';
            
            // Stagger animation
            setTimeout(() => {
                card.style.animation = `fadeIn 0.5s ease ${index * 0.1}s forwards`;
            }, 10);
        } else {
            // Hide card with animation
            card.classList.add('filtered-out');
            card.classList.remove('filtered-in');
            
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });

    // Update grid layout
    updateMasonryLayout();
}

// ===== MASONRY GRID LAYOUT =====
function updateMasonryLayout() {
    const grid = document.querySelector('.page-grid');
    if (!grid) return;

    // Force reflow for smooth animation
    grid.style.opacity = '0.7';
    
    setTimeout(() => {
        grid.style.opacity = '1';
    }, 200);
}

// ===== MODAL SYSTEM =====
function openProjectModal(element) {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    // Get data from element
    const title = element.getAttribute('data-title');
    const category = element.getAttribute('data-category');
    const stats = element.getAttribute('data-stats');
    const description = element.getAttribute('data-full-description');
    const imagesJson = element.getAttribute('data-images');

    // Parse images
    try {
        carouselImages = JSON.parse(imagesJson);
    } catch (e) {
        carouselImages = [];
    }

    // Populate modal
    document.getElementById('modal-title').textContent = title || 'Projeto';
    document.getElementById('modal-stats').textContent = stats || '';

    // Setup carousel
    setupCarousel(carouselImages);

    // Setup accordion
    setupAccordion(description, category);

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Add animation
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.animation = 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
}

function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    modal.classList.remove('active');
    document.body.style.overflow = '';
    currentCarouselIndex = 0;
}

// ===== CAROUSEL SYSTEM =====
function setupCarousel(images) {
    const track = document.getElementById('modal-carousel-track');
    const dotsContainer = document.getElementById('carousel-dots');
    
    if (!track || !dotsContainer) return;

    // Clear existing
    track.innerHTML = '';
    dotsContainer.innerHTML = '';

    // Add images
    images.forEach((imgSrc, index) => {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = `Imagem ${index + 1}`;
        img.loading = 'lazy';
        track.appendChild(img);

        // Add dot
        const dot = document.createElement('button');
        dot.className = 'carousel-dot';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    currentCarouselIndex = 0;
    updateCarousel();
}

function moveCarousel(direction) {
    currentCarouselIndex += direction;
    
    if (currentCarouselIndex < 0) {
        currentCarouselIndex = carouselImages.length - 1;
    } else if (currentCarouselIndex >= carouselImages.length) {
        currentCarouselIndex = 0;
    }

    updateCarousel();
}

function goToSlide(index) {
    currentCarouselIndex = index;
    updateCarousel();
}

function updateCarousel() {
    const track = document.getElementById('modal-carousel-track');
    const dots = document.querySelectorAll('.carousel-dot');
    
    if (!track) return;

    // Move track
    const offset = -currentCarouselIndex * 100;
    track.style.transform = `translateX(${offset}%)`;

    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentCarouselIndex);
    });
}

// ===== ACCORDION SYSTEM =====
function setupAccordion(description, category) {
    const accordion = document.getElementById('modal-accordion');
    if (!accordion) return;

    accordion.innerHTML = `
        <div class="accordion-item active">
            <div class="accordion-header">
                <span>📋 Sobre o Projeto</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="accordion-content">
                <div class="accordion-body">
                    ${description || 'Descrição não disponível.'}
                </div>
            </div>
        </div>

        <div class="accordion-item">
            <div class="accordion-header">
                <span>🎯 Objetivos</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="accordion-content">
                <div class="accordion-body">
                    <ul style="padding-left: 1.5rem; line-height: 2;">
                        <li>Promover inclusão social e dignidade</li>
                        <li>Atender famílias em situação de vulnerabilidade</li>
                        <li>Criar impacto positivo e sustentável</li>
                        <li>Fortalecer a comunidade local</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="accordion-item">
            <div class="accordion-header">
                <span>📍 Onde Atuamos</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="accordion-content">
                <div class="accordion-body">
                    <p>Este projeto atua principalmente no <strong>Distrito Federal e Entorno</strong>, com foco nas regiões administrativas de maior vulnerabilidade social.</p>
                    <p style="margin-top: 1rem;">Nossas ações chegam a comunidades que mais precisam de apoio e transformação.</p>
                </div>
            </div>
        </div>

        <div class="accordion-item">
            <div class="accordion-header">
                <span>💡 Como Você Pode Ajudar</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="accordion-content">
                <div class="accordion-body">
                    <p><strong>Existem várias formas de contribuir:</strong></p>
                    <ul style="padding-left: 1.5rem; line-height: 2; margin-top: 1rem;">
                        <li><strong>Doação Financeira:</strong> Contribua com qualquer valor</li>
                        <li><strong>Voluntariado:</strong> Doe seu tempo e talento</li>
                        <li><strong>Doação de Materiais:</strong> Alimentos, roupas, materiais escolares</li>
                        <li><strong>Divulgação:</strong> Compartilhe nosso trabalho</li>
                    </ul>
                </div>
            </div>
        </div>
    `;

    // Add accordion functionality
    const accordionHeaders = accordion.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const wasActive = item.classList.contains('active');

            // Close all
            accordion.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
            });

            // Toggle current
            if (!wasActive) {
                item.classList.add('active');
            }
        });
    });
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(reveal => {
        reveal.style.opacity = '0';
        reveal.style.transform = 'translateY(30px)';
        reveal.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        revealObserver.observe(reveal);
    });
}

// ===== COUNTER ANIMATION =====
function animateCounters() {
    const counters = document.querySelectorAll('.stat-item h3');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const text = counter.textContent;
                const number = parseInt(text.replace(/\D/g, ''));
                
                if (!isNaN(number)) {
                    animateCounter(counter, number, text);
                }
                
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
}

function animateCounter(element, target, originalText) {
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    const suffix = originalText.replace(/[\d,]/g, '');

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = originalText;
            clearInterval(timer);
        } else {
            element.textContent = Math.round(current) + suffix;
        }
    }, 16);
}

// ===== KEYBOARD NAVIGATION =====
function initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('project-modal');
        if (!modal || !modal.classList.contains('active')) return;

        switch(e.key) {
            case 'Escape':
                closeProjectModal();
                break;
            case 'ArrowLeft':
                moveCarousel(-1);
                break;
            case 'ArrowRight':
                moveCarousel(1);
                break;
        }
    });
}

// ===== LAZY LOADING =====
function initLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.src; // Trigger load
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===== CLOSE MODAL ON OUTSIDE CLICK =====
function initModalOutsideClick() {
    const modal = document.getElementById('project-modal');
    if (!modal) return;

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeProjectModal();
        }
    });
}

// ===== INITIALIZE EVERYTHING =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎨 Iniciando Projetos Premium...');
    
    initProjectFilters();
    initScrollAnimations();
    animateCounters();
    initKeyboardNav();
    initLazyLoading();
    initSmoothScroll();
    initModalOutsideClick();
    
    console.log('✅ Projetos Premium carregado!');
});

// ===== EXPORT FUNCTIONS =====
window.openProjectModal = openProjectModal;
window.closeProjectModal = closeProjectModal;
window.moveCarousel = moveCarousel;

window.ProjetosPremium = {
    filterProjects,
    updateMasonryLayout,
    animateCounter
};
