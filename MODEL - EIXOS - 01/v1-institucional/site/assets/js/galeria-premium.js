/* ============================================
   GALERIA - PREMIUM LIGHTBOX
   Masonry grid, lightbox interativo e navegação
   ============================================ */

// ===== GALLERY DATA =====
const galleryImages = [
    { src: 'assets/img/projeto-brasilia-2025-1.png', title: 'Brasília 2025', caption: 'Distribuição de cestas básicas', category: 'projetos' },
    { src: 'assets/img/quem-somos-team.png', title: 'Nossa Equipe', caption: 'Time de voluntários', category: 'equipe' },
    { src: 'assets/img/ong-instituto-eixos.png', title: 'Instituto Eixos', caption: 'Nossa sede', category: 'institucional' },
    { src: 'assets/img/aplicação-instituto-eixos.png', title: 'Atuação', caption: 'Mapa de atuação', category: 'institucional' },
    { src: 'assets/img/quem-somos-r1nd93a231j678w13jhp92onbbjg4k3aktxfpo7pow.webp', title: 'Mutirão da Saúde', caption: 'Atendimento médico', category: 'projetos' },
    { src: 'assets/img/transparencia-r1nd963knjn162rxn2pkyjz13h5jrnehl7vw5i3j68.webp', title: 'Transparência', caption: 'Prestação de contas', category: 'institucional' },
    { src: 'assets/img/ong-instituto-eixos-1024x682.webp', title: 'Ação Social', caption: 'Comunidade atendida', category: 'projetos' },
    { src: 'assets/img/about-hero.png', title: 'Quem Somos', caption: 'Nossa história', category: 'institucional' },
];

let currentImageIndex = 0;
let filteredImages = [...galleryImages];

// ===== RENDER GALLERY =====
function renderGallery(images = galleryImages) {
    const container = document.querySelector('.gallery-masonry');
    if (!container) return;

    container.innerHTML = '';

    images.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.setAttribute('data-category', img.category);
        item.innerHTML = `
            <img src="${img.src}" alt="${img.title}" loading="lazy">
            <div class="gallery-overlay">
                <h4>${img.title}</h4>
                <p>${img.caption}</p>
            </div>
            <div class="gallery-icon">
                <i class="fas fa-search-plus"></i>
            </div>
        `;

        item.addEventListener('click', () => openLightbox(index, images));
        container.appendChild(item);
    });
}

// ===== LIGHTBOX SYSTEM =====
function openLightbox(index, images = filteredImages) {
    currentImageIndex = index;
    filteredImages = images;

    const lightbox = document.getElementById('lightbox');
    const img = document.getElementById('lightbox-img');
    const title = document.getElementById('lightbox-title');
    const caption = document.getElementById('lightbox-caption');

    if (!lightbox || !img) return;

    const currentImg = images[index];
    img.src = currentImg.src;
    title.textContent = currentImg.title;
    caption.textContent = currentImg.caption;

    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Update counter
    updateCounter();

    // Add navigation buttons if not exist
    addNavigationButtons();
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function navigateLightbox(direction) {
    currentImageIndex += direction;

    if (currentImageIndex < 0) {
        currentImageIndex = filteredImages.length - 1;
    } else if (currentImageIndex >= filteredImages.length) {
        currentImageIndex = 0;
    }

    const img = document.getElementById('lightbox-img');
    const title = document.getElementById('lightbox-title');
    const caption = document.getElementById('lightbox-caption');

    if (!img) return;

    const currentImg = filteredImages[currentImageIndex];

    // Fade out
    img.style.opacity = '0';
    img.style.transform = 'scale(0.95)';

    setTimeout(() => {
        img.src = currentImg.src;
        title.textContent = currentImg.title;
        caption.textContent = currentImg.caption;

        // Fade in
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';

        updateCounter();
    }, 200);
}

function updateCounter() {
    let counter = document.querySelector('.lightbox-counter');
    if (!counter) {
        counter = document.createElement('div');
        counter.className = 'lightbox-counter';
        document.querySelector('.lightbox-content').appendChild(counter);
    }
    counter.textContent = `${currentImageIndex + 1} / ${filteredImages.length}`;
}

function addNavigationButtons() {
    const content = document.querySelector('.lightbox-content');
    if (!content || document.querySelector('.lightbox-prev')) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'lightbox-nav lightbox-prev';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateLightbox(-1);
    });

    const nextBtn = document.createElement('button');
    nextBtn.className = 'lightbox-nav lightbox-next';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateLightbox(1);
    });

    content.appendChild(prevBtn);
    content.appendChild(nextBtn);
}

// ===== FILTERS =====
function initFilters() {
    const filtersContainer = document.querySelector('.text-center.mb-5');
    if (!filtersContainer) return;

    const filtersDiv = document.createElement('div');
    filtersDiv.className = 'gallery-filters';
    filtersDiv.innerHTML = `
        <button class="gallery-filter-btn active" data-filter="all">
            <span>Todas</span>
        </button>
        <button class="gallery-filter-btn" data-filter="projetos">
            <span>Projetos</span>
        </button>
        <button class="gallery-filter-btn" data-filter="equipe">
            <span>Equipe</span>
        </button>
        <button class="gallery-filter-btn" data-filter="institucional">
            <span>Institucional</span>
        </button>
    `;

    filtersContainer.after(filtersDiv);

    // Add event listeners
    const filterBtns = filtersDiv.querySelectorAll('.gallery-filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            filterGallery(filter);
        });
    });
}

function filterGallery(category) {
    const items = document.querySelectorAll('.gallery-item');

    if (category === 'all') {
        filteredImages = [...galleryImages];
        items.forEach((item, index) => {
            item.style.display = '';
            item.style.animation = `fadeIn 0.6s ease ${index * 0.05}s forwards`;
        });
    } else {
        filteredImages = galleryImages.filter(img => img.category === category);
        items.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            if (itemCategory === category) {
                item.style.display = '';
                item.style.animation = 'fadeIn 0.6s ease forwards';
            } else {
                item.style.display = 'none';
            }
        });
    }
}

// ===== KEYBOARD NAVIGATION =====
function initKeyboardNav() {
    document.addEventListener('keydown', (e) => {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox || !lightbox.classList.contains('active')) return;

        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                navigateLightbox(-1);
                break;
            case 'ArrowRight':
                navigateLightbox(1);
                break;
        }
    });
}

// ===== CLOSE ON OUTSIDE CLICK =====
function initOutsideClick() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
}

// ===== CLOSE BUTTON =====
function initCloseButton() {
    const closeBtn = document.querySelector('.lightbox-close');
    if (!closeBtn) return;

    closeBtn.addEventListener('click', closeLightbox);
}

// ===== SMOOTH IMAGE TRANSITION =====
function initImageTransition() {
    const img = document.getElementById('lightbox-img');
    if (!img) return;

    img.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
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
    console.log('🎨 Iniciando Galeria Premium...');
    
    renderGallery();
    initFilters();
    initKeyboardNav();
    initOutsideClick();
    initCloseButton();
    initImageTransition();
    initLazyLoading();
    initScrollAnimations();
    
    console.log('✅ Galeria Premium carregada!');
});

// ===== EXPORT =====
window.GaleriaPremium = {
    openLightbox,
    closeLightbox,
    navigateLightbox,
    filterGallery
};
