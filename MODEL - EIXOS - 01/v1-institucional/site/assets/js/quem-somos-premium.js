/* ============================================
   QUEM SOMOS - PREMIUM INTERACTIONS
   JavaScript para efeitos interativos e animações
   ============================================ */

// ===== PARALLAX EFFECT NO HERO =====
function initParallax() {
  const hero = document.querySelector(".page-header-bg");
  if (!hero) return;

  window.addEventListener("scroll", () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * 0.5;
    hero.style.transform = `translateY(${rate}px)`;
  });
}

// ===== SCROLL REVEAL ANIMATIONS =====
function initScrollReveal() {
  const reveals = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -50px 0px",
    },
  );

  reveals.forEach((reveal) => {
    revealObserver.observe(reveal);
  });
}

// ===== 3D TILT EFFECT NOS CARDS =====
function init3DTilt() {
  const cards = document.querySelectorAll(".value-item, .team-member-card");

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      card.style.transform = `
                perspective(1000px) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg) 
                translateY(-10px)
                scale3d(1.02, 1.02, 1.02)
            `;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform =
        "perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale3d(1, 1, 1)";
    });
  });
}

// ===== TIMELINE SCROLL HORIZONTAL SUAVE =====
function initTimelineScroll() {
  const container = document.querySelector(".timeline-container");
  if (!container) return;

  let isDown = false;
  let startX;
  let scrollLeft;

  container.addEventListener("mousedown", (e) => {
    isDown = true;
    container.style.cursor = "grabbing";
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  container.addEventListener("mouseleave", () => {
    isDown = false;
    container.style.cursor = "grab";
  });

  container.addEventListener("mouseup", () => {
    isDown = false;
    container.style.cursor = "grab";
  });

  container.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 2;
    container.scrollLeft = scrollLeft - walk;
  });

  // Adicionar cursor grab
  container.style.cursor = "grab";
}

// ===== CONTADOR ANIMADO PARA ESTATÍSTICAS =====
function animateCounter(element, target, duration = 2000) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = Math.round(target);
      clearInterval(timer);
    } else {
      element.textContent = Math.round(current);
    }
  }, 16);
}

// ===== SMOOTH SCROLL PARA LINKS INTERNOS =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

// ===== LAZY LOADING DE IMAGENS =====
function initLazyLoading() {
  const images = document.querySelectorAll("img[data-src]");

  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute("data-src");
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach((img) => imageObserver.observe(img));
}

// ===== MODAL PARA MEMBROS DA EQUIPE =====
function initTeamModals() {
  const teamCards = document.querySelectorAll(".team-member-card");

  teamCards.forEach((card) => {
    card.style.cursor = "pointer";

    card.addEventListener("click", () => {
      const name = card.querySelector(".team-name")?.textContent || "Membro";
      const role = card.querySelector(".team-role")?.textContent || "";
      const bio = card.querySelector(".team-bio")?.textContent || "";

      showTeamModal(name, role, bio);
    });
  });
}

function showTeamModal(name, role, bio) {
  // Criar modal dinamicamente
  const modal = document.createElement("div");
  modal.className = "team-modal";
  modal.innerHTML = `
        <div class="team-modal-overlay"></div>
        <div class="team-modal-content">
            <button class="team-modal-close">&times;</button>
            <h2>${name}</h2>
            <p class="modal-role">${role}</p>
            <p class="modal-bio">${bio}</p>
        </div>
    `;

  document.body.appendChild(modal);

  // Adicionar estilos do modal
  const style = document.createElement("style");
  style.textContent = `
        .team-modal {
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease;
        }
        
        .team-modal-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
        }
        
        .team-modal-content {
            position: relative;
            background: white;
            padding: 3rem;
            border-radius: 20px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            animation: slideUp 0.3s ease;
        }
        
        .team-modal-close {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            color: #94a3b8;
            transition: color 0.3s;
        }
        
        .team-modal-close:hover {
            color: var(--primary);
        }
        
        .team-modal-content h2 {
            color: var(--secondary);
            margin-bottom: 0.5rem;
        }
        
        .modal-role {
            color: var(--primary);
            font-weight: 600;
            margin-bottom: 1.5rem;
        }
        
        .modal-bio {
            color: var(--text-light);
            line-height: 1.8;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
  document.head.appendChild(style);

  // Fechar modal
  const closeBtn = modal.querySelector(".team-modal-close");
  const overlay = modal.querySelector(".team-modal-overlay");

  const closeModal = () => {
    modal.style.animation = "fadeOut 0.3s ease";
    setTimeout(() => modal.remove(), 300);
  };

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  // Fechar com ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
}

// ===== PROGRESS BAR DE LEITURA =====
function initReadingProgress() {
  const progressBar = document.createElement("div");
  progressBar.className = "reading-progress";
  progressBar.innerHTML = '<div class="reading-progress-bar"></div>';
  document.body.appendChild(progressBar);

  const style = document.createElement("style");
  style.textContent = `
        .reading-progress {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: rgba(0, 0, 0, 0.05);
            z-index: 9998;
        }
        
        .reading-progress-bar {
            height: 100%;
            background: linear-gradient(90deg, var(--primary), var(--accent-green));
            width: 0%;
            transition: width 0.1s ease;
        }
    `;
  document.head.appendChild(style);

  window.addEventListener("scroll", () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset;
    const progress = (scrollTop / (documentHeight - windowHeight)) * 100;

    const bar = document.querySelector(".reading-progress-bar");
    if (bar) {
      bar.style.width = `${Math.min(progress, 100)}%`;
    }
  });
}

// ===== INICIALIZAR TUDO =====
document.addEventListener("DOMContentLoaded", () => {
  console.log("🎨 Iniciando Quem Somos Premium...");

  initParallax();
  initScrollReveal();
  init3DTilt();
  initTimelineScroll();
  initSmoothScroll();
  initLazyLoading();
  initTeamModals();
  initReadingProgress();

  console.log("✅ Quem Somos Premium carregado!");
});

// ===== EXPORT PARA USO EXTERNO =====
window.QuemSomosPremium = {
  animateCounter,
  showTeamModal,
};
