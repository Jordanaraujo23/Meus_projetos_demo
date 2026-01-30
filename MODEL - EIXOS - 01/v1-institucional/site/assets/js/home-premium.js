/**
 * PREMIUM HOME PAGE INTERACTIONS
 * Instituto Eixos - Fabuloso Interactive Components
 */

// ============================================
// ANIMATED COUNTERS
// ============================================
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  
  const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        entry.target.classList.add('counted');
        animateCounter(entry.target);
      }
    });
  }, observerOptions);
  
  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
  const target = parseInt(element.getAttribute('data-target'));
  const duration = 2000; // 2 seconds
  const increment = target / (duration / 16); // 60fps
  let current = 0;
  
  const updateCounter = () => {
    current += increment;
    if (current < target) {
      element.textContent = Math.floor(current).toLocaleString('pt-BR');
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target.toLocaleString('pt-BR');
    }
  };
  
  updateCounter();
}

// ============================================
// TESTIMONIALS CAROUSEL
// ============================================
class TestimonialsCarousel {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) return;
    
    this.track = this.container.querySelector('.testimonials-track');
    this.slides = this.container.querySelectorAll('.testimonial-slide');
    this.prevBtn = this.container.querySelector('.carousel-prev');
    this.nextBtn = this.container.querySelector('.carousel-next');
    this.dotsContainer = this.container.querySelector('.carousel-dots');
    
    this.currentIndex = 0;
    this.autoplayInterval = null;
    
    this.init();
  }
  
  init() {
    if (this.slides.length === 0) return;
    
    // Create dots
    this.createDots();
    
    // Event listeners
    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());
    
    // Touch/swipe support
    this.addSwipeSupport();
    
    // Autoplay
    this.startAutoplay();
    
    // Pause on hover
    this.container.addEventListener('mouseenter', () => this.stopAutoplay());
    this.container.addEventListener('mouseleave', () => this.startAutoplay());
  }
  
  createDots() {
    if (!this.dotsContainer) return;
    
    this.slides.forEach((_, index) => {
      const dot = document.createElement('div');
      dot.classList.add('carousel-dot');
      if (index === 0) dot.classList.add('active');
      dot.addEventListener('click', () => this.goToSlide(index));
      this.dotsContainer.appendChild(dot);
    });
    
    this.dots = this.dotsContainer.querySelectorAll('.carousel-dot');
  }
  
  goToSlide(index) {
    this.currentIndex = index;
    const offset = -index * 100;
    this.track.style.transform = `translateX(${offset}%)`;
    
    // Update dots
    if (this.dots) {
      this.dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }
  }
  
  next() {
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
    this.goToSlide(this.currentIndex);
  }
  
  prev() {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(this.currentIndex);
  }
  
  startAutoplay() {
    this.autoplayInterval = setInterval(() => this.next(), 5000);
  }
  
  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
  
  addSwipeSupport() {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    
    this.track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      this.stopAutoplay();
    });
    
    this.track.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
    });
    
    this.track.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      
      const diff = startX - currentX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.next();
        } else {
          this.prev();
        }
      }
      
      this.startAutoplay();
    });
  }
}

// ============================================
// PILLAR CARDS 3D TILT EFFECT
// ============================================
function init3DPillarCards() {
  const cards = document.querySelectorAll('.pillar-card-3d');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      card.style.transform = `
        translateY(-15px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg)
        scale(1.02)
      `;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0) rotateX(0) rotateY(0) scale(1)';
    });
  });
}

// ============================================
// PARALLAX SCROLL EFFECTS
// ============================================
function initParallaxEffects() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    
    parallaxElements.forEach(element => {
      const speed = element.getAttribute('data-parallax') || 0.5;
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px)`;
    });
  });
}

// ============================================
// NEWSLETTER FORM HANDLING
// ============================================
function initNewsletterForm() {
  const form = document.querySelector('.newsletter-form-premium');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const emailInput = form.querySelector('input[type="email"]');
    const nameInput = form.querySelector('input[type="text"]');
    const submitBtn = form.querySelector('.newsletter-submit');
    
    if (!emailInput || !nameInput) return;
    
    const email = emailInput.value.trim();
    const name = nameInput.value.trim();
    
    if (!email || !name) {
      showNotification('Por favor, preencha todos os campos.', 'error');
      return;
    }
    
    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'ENVIANDO...';
    
    try {
      // Here you would integrate with your backend/Firebase
      // For now, simulate success
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      showNotification('Inscrição realizada com sucesso! 🎉', 'success');
      form.reset();
    } catch (error) {
      showNotification('Erro ao processar inscrição. Tente novamente.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'INSCREVER';
    }
  });
}

// ============================================
// NOTIFICATION SYSTEM
// ============================================
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideInRight 0.4s ease;
    font-weight: 600;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOutRight 0.4s ease';
    setTimeout(() => notification.remove(), 400);
  }, 3000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);

// ============================================
// SCROLL PROGRESS INDICATOR
// ============================================
function initScrollProgress() {
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary), var(--accent-green));
    z-index: 9999;
    transform-origin: left;
    transform: scaleX(0);
    transition: transform 0.1s ease;
  `;
  document.body.appendChild(progressBar);
  
  window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.pageYOffset / windowHeight);
    progressBar.style.transform = `scaleX(${scrolled})`;
  });
}

// ============================================
// INITIALIZE ALL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize counters
  animateCounters();
  
  // Initialize carousel
  new TestimonialsCarousel('.testimonials-carousel-wrapper');
  
  // Initialize 3D cards
  init3DPillarCards();
  
  // Initialize parallax
  initParallaxEffects();
  
  // Initialize newsletter
  initNewsletterForm();
  
  // Initialize scroll progress
  initScrollProgress();
  
  console.log('✨ Premium home page features initialized!');
});

// Export for use in other scripts if needed
window.PremiumHome = {
  animateCounters,
  TestimonialsCarousel,
  showNotification
};
