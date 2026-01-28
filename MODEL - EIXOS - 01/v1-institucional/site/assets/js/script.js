document.addEventListener("DOMContentLoaded", function () {
  // Mobile Menu Toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  // Main Elements
  const logo = document.querySelector(".header-seal-logo");


  // Close menu when clicking a link
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
    });
  });

  // === FLUID PULL-DOWN MENU GESTURE ===
  // const logo declared above
  let startY = 0;
  let currentY = 0;
  
  if (logo && navMenu) {
    logo.addEventListener("touchstart", (e) => {
      startY = e.touches[0].clientY;
      // Disable transitions for instant response
      logo.style.transition = "none";
      navMenu.style.transition = "none";
    }, { passive: true });

    logo.addEventListener("touchmove", (e) => {
      currentY = e.touches[0].clientY;
      const diff = currentY - startY;
      const menuHeight = navMenu.offsetHeight;
      const isOpen = navMenu.classList.contains("active");

      // CASE 1: MENU CLOSED -> PULL DOWN (diff > 0)
      if (!isOpen && diff > 0) {
        // "Bookmark" Physics: 1:1 Movement
        logo.style.transform = `translateY(${diff}px)`;
        
        const menuPixelOffset = diff - menuHeight; 
        navMenu.style.transform = `translateY(${menuPixelOffset}px)`;
      }

      // CASE 2: MENU OPEN -> PUSH UP (diff < 0)
      if (isOpen && diff < 0) {
         // Move everything UP
         logo.style.transform = `translateY(${diff}px)`;
         navMenu.style.transform = `translateY(${diff}px)`;
      }
    }, { passive: true });

    // CLICK EVENT: Open menu on logo click (Mobile)
    logo.addEventListener("click", (e) => {
      if (window.innerWidth <= 900) {
        e.preventDefault(); // Stop navigation to index.html if we want to open menu instead
        
        logo.style.transition = "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)";
        navMenu.style.transition = "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)";
        
        if (!navMenu.classList.contains("active")) {
          navMenu.classList.add("active");
          if (navigator.vibrate) navigator.vibrate(50);
        } else {
          navMenu.classList.remove("active");
        }
      }
    });

    logo.addEventListener("touchend", () => {
      const diff = currentY - startY;
      const isOpen = navMenu.classList.contains("active");
      
      // Re-enable transitions for smooth snap
      logo.style.transition = "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)";
      navMenu.style.transition = "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)";
      
      logo.style.transform = ""; // Reset logo position (always snaps back to top)

      if (!isOpen) {
        // OPENING VISITOR
        if (diff > 150 && window.innerWidth <= 900) {
            navMenu.style.transform = ""; // Clear inline transform
            navMenu.classList.add("active"); // CSS takes over (translateY(0))
            if (navigator.vibrate) navigator.vibrate(50);
        } else {
            // Revert (Close)
            navMenu.style.transform = ""; // Clear inline (returns to -100%)
        }
      } else {
        // CLOSING VISITOR
        if (diff < -100) { // Dragged up by 100px
            navMenu.style.transform = "";
            navMenu.classList.remove("active"); // CSS takes over (translateY(-100%))
            if (navigator.vibrate) navigator.vibrate(50);
        } else {
            // Revert (Stay Open)
            navMenu.style.transform = ""; // Clear inline returns to active (0)
        }
      }
    });
  }

  // Stats Counter Animation
  const stats = document.querySelectorAll(".number");
  let hasAnimated = false;

  const animateStats = () => {
    stats.forEach((stat) => {
      const target = +stat.getAttribute("data-target");
      const speed = 200; // Lower is faster

      const updateCount = () => {
        const count = +stat.innerText.replace(".", "").replace(",", ""); // handle formatting if needed
        const inc = target / speed;

        if (count < target) {
          stat.innerText = Math.ceil(count + inc);
          setTimeout(updateCount, 20);
        } else {
          stat.innerText = target;
        }
      };

      updateCount();
    });
  };

  // Trigger animation on scroll
  const statsSection = document.querySelector(".stats-section");
  if (statsSection) {
    window.addEventListener("scroll", () => {
      const sectionPos = statsSection.getBoundingClientRect().top;
      const screenPos = window.innerHeight / 1.3;

      if (sectionPos < screenPos && !hasAnimated) {
        animateStats();
        hasAnimated = true;
      }
    });
  }

  // Smooth Scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
        });
      }
    });
  });
  // Scroll Reveal Observer
  const revealElements = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target); // Reveal only once
        }
      });
    },
    {
      root: null,
      threshold: 0.15, // Trigger when 15% visible
      rootMargin: "0px 0px -50px 0px",
    },
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // Simple Parallax Effect for Hero
  const heroBg = document.querySelector(".hero-slide-bg");
  if (heroBg) {
    window.addEventListener("scroll", () => {
      const scrollY = window.scrollY;
      // Move background at 50% speed of scroll
      heroBg.style.transform = `translateY(${scrollY * 0.5}px)`;
    });
  }

  // Floating Social Buttons (Exclude Contact Page)
  const isContactPage = window.location.pathname.includes("fale-conosco") || window.location.pathname.includes("contato");
  
  if (!isContactPage) {
      const socialContainer = document.createElement("div");
      socialContainer.className = "floating-socials";
      
      const whatsappLink = "https://wa.me/5561981030472"; // Using number from footer
      const instagramLink = "https://www.instagram.com/institutoeixos/"; // Placeholder
      
      socialContainer.innerHTML = `
          <a href="${whatsappLink}" target="_blank" class="social-float-btn btn-whatsapp" aria-label="Fale conosco no WhatsApp">
              <i class="fab fa-whatsapp"></i>
          </a>
          <a href="${instagramLink}" target="_blank" class="social-float-btn btn-instagram" aria-label="Siga-nos no Instagram">
              <i class="fab fa-instagram"></i>
          </a>
      `;
      
      document.body.appendChild(socialContainer);
  }
  // Text Reveal Observer (Cinematic)
  const textReveals = document.querySelectorAll(".reveal-text");
  const textObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add("active");
          }
      });
  }, { threshold: 0.2 });
  
  textReveals.forEach(el => textObserver.observe(el));

  // 3D Tilt Effect for Cards - Optimized
  const cards = document.querySelectorAll(".article-card");
  
  cards.forEach(card => {
      let ticking = false;

      card.addEventListener("mousemove", (e) => {
          if (!ticking) {
              window.requestAnimationFrame(() => {
                  const rect = card.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;
                  
                  // Reduced tilt for subtle, smoother feel
                  const rotateX = ((y - centerY) / centerY) * -3; 
                  const rotateY = ((x - centerX) / centerX) * 3;

                  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
                  ticking = false;
              });
              ticking = true;
          }
      });

      card.addEventListener("mouseleave", () => {
          card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
      });
  });

  // Magnetic Buttons (Desktop only) - Optimized
  if (window.innerWidth > 768) {
      const btns = document.querySelectorAll(".btn");
      
      btns.forEach(btn => {
          let ticking = false;

          btn.addEventListener("mousemove", (e) => {
              if (!ticking) {
                  window.requestAnimationFrame(() => {
                      const rect = btn.getBoundingClientRect();
                      const x = e.clientX - rect.left - rect.width / 2;
                      const y = e.clientY - rect.top - rect.height / 2;
                      
                      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`; // Reduced factor slightly
                      ticking = false;
                  });
                  ticking = true;
              }
          });
          
          btn.addEventListener("mouseleave", () => {
              btn.style.transform = "translate(0, 0)";
          });
      });
  }

  // Mobile Interaction Sequence (News -> Subscribe)
  if (window.innerWidth <= 768) {
      // Create Popup HTML Structure
      const createPopup = (id, title, text, btnText, btnLink, imgSrc) => {
          const overlay = document.createElement("div");
          overlay.className = "mobile-popup-overlay";
          overlay.id = id;
          
          overlay.innerHTML = `
              <div class="mobile-popup-card">
                  <button class="popup-close">&times;</button>
                  <img src="${imgSrc}" class="popup-image" alt="${title}" loading="lazy">
                  <div class="popup-content">
                      <h3 class="popup-title">${title}</h3>
                      <p class="popup-text">${text}</p>
                      <a href="${btnLink}" class="btn btn-primary" style="width: 100%;">${btnText}</a>
                  </div>
              </div>
          `;
          
          document.body.appendChild(overlay);
          return overlay;
      };

      // 1. News Popup (Delay 2s)
      setTimeout(() => {
          // Check if already subscribed or seen? (Optional logic here)
          const newsPopup = createPopup(
              "popup-news",
              "Novidades Chegando!",
              "Confira as últimas ações e conquistas do Instituto Eixos na nossa página de notícias.",
              "Ler Notícias",
              "noticias.html",
              "assets/img/projeto-brasilia-2025-1.webp" 
          );

          // Show News Popup
          requestAnimationFrame(() => newsPopup.classList.add("active"));

          // Handle Close News -> Trigger Subscribe
          newsPopup.querySelector(".popup-close").addEventListener("click", () => {
              newsPopup.classList.remove("active");
              setTimeout(() => newsPopup.remove(), 300); // Clean up DOM

              // 2. Subscribe Popup (Delay 500ms after close)
              setTimeout(() => {
                  const subPopup = createPopup(
                      "popup-subscribe",
                      "Fique por Dentro",
                      "Inscreva-se para receber atualizações exclusivas e oportunidades de voluntariado.",
                      "Inscrever-se",
                      "#newsletter-footer", // Jump to footer form
                      "assets/img/hero-bg.jpg" // Or another image
                  );
                  
                  requestAnimationFrame(() => subPopup.classList.add("active"));
                  
                  // Handle Close Subscribe
                  subPopup.querySelector(".popup-close").addEventListener("click", () => {
                      subPopup.classList.remove("active");
                      setTimeout(() => subPopup.remove(), 300);
                  });

                  // If they click the CTA, also close
                  subPopup.querySelector(".btn").addEventListener("click", () => {
                      subPopup.classList.remove("active");
                  });

              }, 500);
          });
      }, 3000); // 3 seconds initial delay
  }

// === PROJECT MODAL LOGIC ===
let currentSlide = 0;
let totalSlides = 0;

window.openProjectModal = function(card) {
    const modal = document.getElementById("project-modal");
    
    // Get Data
    const title = card.getAttribute("data-title");
    const category = card.getAttribute("data-category");
    const desc = card.getAttribute("data-full-description") || card.getAttribute("data-description");
    const stats = card.getAttribute("data-stats");
    const images = JSON.parse(card.getAttribute("data-images"));
    
    // Populate Info
    document.getElementById("modal-title").innerText = title;
    document.getElementById("modal-category").innerText = category;
    document.getElementById("modal-stats").innerText = stats;

    // --- ACCORDION GENERATION ---
    const accordionContainer = document.getElementById("modal-accordion");
    accordionContainer.innerHTML = ""; // Clear existing

    // Define Sections
    const sections = [
        {
            title: "Sumário do Projeto",
            content: desc // From data attribute
        },
        {
            title: "Dados do Instrumento da Parceria",
            content: "<p>Informações detalhadas sobre a parceria e vigência.</p><p><strong>Vigência:</strong> 2025 - 2026</p><p><strong>Órgão:</strong> Governo do Distrito Federal</p>"
        },
        {
            title: "Termo de Fomento",
            content: "<p>Acesse o documento oficial do Termo de Fomento deste projeto.</p>",
            pdf: "Termo de Fomento.pdf"
        },
        {
            title: "Equipe Técnica e Recursos Humanos",
            content: "<p><strong>Coordenação Geral:</strong> Dra. Ana Sophia</p><p><strong>Assistência Social:</strong> Equipe Multidisciplinar Eixos</p>"
        },
        {
            title: "Relatório Final de Execução",
            content: "<p>Resultados alcançados e prestação de contas final.</p>",
            pdf: "Relatório Final.pdf"
        }
    ];

    sections.forEach((section) => {
        // Create Item
        const item = document.createElement("div");
        item.className = "accordion-item";
        
        const header = document.createElement("div");
        header.className = "accordion-header";
        header.innerHTML = `<h4>${section.title}</h4><i class="fas fa-chevron-down"></i>`;
        
        const body = document.createElement("div");
        body.className = "accordion-body";
        
        if (section.pdf) {
            body.innerHTML = `${section.content} <a href="${section.pdf}" class="btn-link" target="_blank"><i class="fas fa-file-pdf"></i> Baixar Arquivo</a>`;
        } else {
            body.innerHTML = section.content;
        }

        // Toggle Logic
        header.onclick = () => {
            const isActive = item.classList.contains("active");
            
            // Close all others
            document.querySelectorAll(".accordion-item").forEach(i => i.classList.remove("active"));
            
            // Toggle clicked
            if (!isActive) item.classList.add("active");
        };

        item.appendChild(header);
        item.appendChild(body);
        accordionContainer.appendChild(item);
    });

    
    // Setup Carousel
    const track = document.getElementById("modal-carousel-track");
    const dotsContainer = document.getElementById("carousel-dots");
    
    track.innerHTML = "";
    dotsContainer.innerHTML = "";
    currentSlide = 0;
    totalSlides = images.length;
    
    images.forEach((imgSrc, index) => {
        // Create Slide
        const img = document.createElement("img");
        img.src = imgSrc;
        img.className = "carousel-slide";
        img.loading = "lazy"; // Optimization
        track.appendChild(img);
        
        // Create Dot
        const dot = document.createElement("div");
        dot.className = index === 0 ? "carousel-dot active" : "carousel-dot";
        dot.onclick = () => goToSlide(index);
        dotsContainer.appendChild(dot);
    });
    
    // Show Modal
    modal.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scroll
}

window.closeProjectModal = function() {
    const modal = document.getElementById("project-modal");
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
}

window.moveCarousel = function(direction) {
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    updateCarousel();
}

window.goToSlide = function(index) {
    currentSlide = index;
    updateCarousel();
}

function updateCarousel() {
    const track = document.getElementById("modal-carousel-track");
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    const dots = document.querySelectorAll(".carousel-dot");
    dots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === currentSlide);
    });
}

// Close on outside click
document.getElementById("project-modal")?.addEventListener("click", (e) => {
    if (e.target.id === "project-modal") {
        closeProjectModal();
    }
});
});

// === AUTO-SCROLL TRAJECTORY CAROUSEL ===
document.addEventListener("DOMContentLoaded", function() {
    const container = document.querySelector(".timeline-container");
    const track = document.querySelector(".timeline-track");

    if (container && track) {
        // Clone items for infinite effect
        const items = Array.from(track.children);
        items.forEach(item => {
            const clone = item.cloneNode(true);
            track.appendChild(clone);
        });

        // Auto Scroll Logic
        let scrollAmount = 0;
        let speed = 0.5; // Adjust speed (pixels per frame)
        let isPaused = false;
        let animationId;

        function scrollStep() {
            if (!isPaused) {
                scrollAmount += speed;
                
                // Reset when half is reached (since we duplicated contents)
                if (scrollAmount >= track.scrollWidth / 2) {
                    scrollAmount = 0;
                }
                
                container.scrollLeft = scrollAmount;
            }
            animationId = requestAnimationFrame(scrollStep);
        }

        // Start
        animationId = requestAnimationFrame(scrollStep);

        // Pause on Hover
        container.addEventListener("mouseenter", () => isPaused = true);
        container.addEventListener("mouseleave", () => isPaused = false);
        
        // Mobile Touch Support (Optional: Allow manual scroll overrides or pause)
        container.addEventListener("touchstart", () => isPaused = true);
        container.addEventListener("touchend", () => {
             // Resume after a delay? Or keep running? 
             // For simple behavior, just resume.
             setTimeout(() => isPaused = false, 1000);
        });
    }
    // === PROJECT FILTERS ===
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.article-card');

    if (filterBtns.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 1. Remove active class from all
                filterBtns.forEach(b => b.classList.remove('active'));
                // 2. Add active to clicked
                btn.classList.add('active');

                // 3. Get filter value
                const filterValue = btn.textContent.trim();

                // 4. Filter Items
                projectCards.forEach(card => {
                    const category = card.getAttribute('data-category');
                    
                    // Show if 'Todos' or category matches (safeguard against null)
                    if (filterValue === 'Todos' || (category && category.includes(filterValue))) {
                        card.style.display = 'block';
                        // Add fade in animation reset
                        card.classList.remove('reveal');
                        void card.offsetWidth; // trigger reflow
                        card.classList.add('reveal', 'active');
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
});

// === LIGHTBOX LOGIC (Gallery Carousel) ===
document.addEventListener("DOMContentLoaded", () => {
    // Inject Lightbox HTML with Navigation Arrows
    if (!document.getElementById("lightbox")) {
        const lightboxHTML = `
            <div id="lightbox" class="lightbox">
                <button class="lightbox-close">&times;</button>
                <button class="lightbox-prev" aria-label="Anterior"><i class="fas fa-chevron-left"></i></button>
                <div class="lightbox-container">
                    <img id="lightbox-img" class="lightbox-content" src="" alt="Zoom">
                    <div class="lightbox-footer">
                        <h3 id="lightbox-title"></h3>
                        <p id="lightbox-caption"></p>
                    </div>
                </div>
                <button class="lightbox-next" aria-label="Próximo"><i class="fas fa-chevron-right"></i></button>
            </div>
            <style>
                .lightbox-prev, .lightbox-next {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255, 255, 255, 0.1);
                    color: white;
                    border: none;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    font-size: 1.5rem;
                    cursor: pointer;
                    z-index: 1001;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .lightbox-prev:hover, .lightbox-next:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: translateY(-50%) scale(1.1);
                }
                .lightbox-prev { left: 20px; }
                .lightbox-next { right: 20px; }
                @media (max-width: 768px) {
                    .lightbox-prev { left: 10px; width: 40px; height: 40px; font-size: 1.2rem; }
                    .lightbox-next { right: 10px; width: 40px; height: 40px; font-size: 1.2rem; }
                }
            </style>
        `;
        document.body.insertAdjacentHTML("beforeend", lightboxHTML);
    }

    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxTitle = document.getElementById("lightbox-title");
    const lightboxCaption = document.getElementById("lightbox-caption");
    const lightboxClose = document.querySelector(".lightbox-close");
    const btnPrev = document.querySelector(".lightbox-prev");
    const btnNext = document.querySelector(".lightbox-next");

    let galleryItems = [];
    let currentIndex = 0;

    const updateLightbox = () => {
        if (galleryItems.length === 0) return;
        const item = galleryItems[currentIndex];
        
        // Fade effect
        lightboxImg.style.opacity = '0.5';
        setTimeout(() => {
            lightboxImg.src = item.src;
            lightboxTitle.innerText = item.title || "";
            lightboxCaption.innerText = item.caption || "";
            lightboxImg.style.opacity = '1';
        }, 150);
    };

    // Close
    const closeLightbox = () => {
        lightbox.classList.remove("active");
        setTimeout(() => {
            lightboxImg.src = "";
            galleryItems = []; // Clear
        }, 300); 
    };

    // Navigation
    const showNext = (e) => {
        if(e) e.stopPropagation();
        currentIndex = (currentIndex + 1) % galleryItems.length;
        updateLightbox();
    };

    const showPrev = (e) => {
        if(e) e.stopPropagation();
        currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
        updateLightbox();
    };

     lightboxClose.addEventListener("click", closeLightbox);
    
    // Close on background click
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-container')) closeLightbox();
    });

    btnNext.addEventListener("click", showNext);
    btnPrev.addEventListener("click", showPrev);

    // Keyboard Support
    document.addEventListener("keydown", (e) => {
        if (!lightbox.classList.contains("active")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") showNext();
        if (e.key === "ArrowLeft") showPrev();
    });

    // Global Open Function
    // Can be called with (index, itemsArray) OR legacy (src, title, caption)
    window.openLightbox = function(arg1, arg2, arg3) {
        // Mode 1: Legacy (src, title, caption) - Single Image
        if (typeof arg1 === 'string') {
            galleryItems = [{ src: arg1, title: arg2, caption: arg3 }];
            currentIndex = 0;
            // Hide arrows if only 1
            btnPrev.style.display = 'none';
            btnNext.style.display = 'none';
        } 
        // Mode 2: Gallery (index, allItems)
        else {
            currentIndex = arg1; // index
            galleryItems = arg2; // array of objects {src, title, caption}
            // Show arrows
            btnPrev.style.display = 'flex';
            btnNext.style.display = 'flex';
        }
        
        updateLightbox();
        lightbox.classList.add("active");
    };
});


// === NEWS PAGE LOGIC ===
document.addEventListener("DOMContentLoaded", function() {
    const filterBtns = document.querySelectorAll(".news-controls .filter-btn");
    const newsGrid = document.getElementById("news-grid");
    const loadMoreBtn = document.getElementById("load-more-btn");
    const articles = document.querySelectorAll(".article-card");

    // 1. Category Filtering
    if (filterBtns.length > 0 && newsGrid) {
        filterBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                // Remove active class
                filterBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");

                const filter = btn.getAttribute("data-filter");

                document.querySelectorAll(".article-card").forEach(card => {
                    const category = card.getAttribute("data-category");

                    if (filter === "all" || category === filter) {
                        card.style.display = "flex"; // Restore display
                        // Small animation reset
                        card.style.animation = "none";
                        card.offsetHeight; /* trigger reflow */
                        card.style.animation = "fadeInUp 0.6s ease forwards";
                    } else {
                        card.style.display = "none";
                    }
                });
            });
        });
    }

    // 2. Load More Simulation
    if (loadMoreBtn && newsGrid) {
        loadMoreBtn.addEventListener("click", () => {
            // Loading State
            const originalText = loadMoreBtn.innerHTML;
            loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Carregando...';
            loadMoreBtn.disabled = true;

            setTimeout(() => {
                // Simulate fetching new data by cloning existing cards
                const currentCards = document.querySelectorAll(".article-card");
                const count = currentCards.length;
                
                // Clone the first 3 cards to simulate "new" old posts
                if (count < 12) { // Limit total
                    const cardsToClone = Array.from(articles).slice(0, 3);
                    
                    cardsToClone.forEach(card => {
                        const clone = card.cloneNode(true);
                        // Update date to look "older" or just random
                        const dateEl = clone.querySelector(".meta-date");
                        if(dateEl) dateEl.innerHTML = `<i class="far fa-calendar-alt"></i> 10 Dez, 2025`;
                        
                        newsGrid.appendChild(clone);
                    });

                    // Restore Button
                    loadMoreBtn.innerHTML = originalText;
                    loadMoreBtn.disabled = false;
                } else {
                    // No more content
                    loadMoreBtn.innerHTML = "Não há mais notícias";
                    loadMoreBtn.disabled = true;
                }

            }, 1500); // 1.5s simulated delay
        });
    }
    
    // 3. Search Bar Mock
    const searchInput = document.querySelector(".search-bar input");
    if (searchInput) {
        searchInput.addEventListener("keyup", (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll(".article-card").forEach(card => {
                const title = card.querySelector(".article-title").innerText.toLowerCase();
                if (title.includes(term)) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }

    // === NEWS PAGE MODAL LOGIC ===
    let newsCarouselInterval;
    let currentNewsSlide = 0;

    window.openNewsModal = function(card) {
        const modal = document.getElementById("news-modal");
        if (!modal) return;

        // Get Data
        const title = card.getAttribute("data-title");
        const category = card.getAttribute("data-category");
        const date = card.getAttribute("data-date");
        const content = card.getAttribute("data-content");
        const images = JSON.parse(card.getAttribute("data-images") || "[]");

        // Populate Info
        document.getElementById("news-modal-title").innerText = title;
        document.getElementById("news-modal-body").innerHTML = content;
        document.getElementById("news-modal-date").innerHTML = `<i class="far fa-calendar-alt"></i> ${date}`;
        
        const catSpan = document.getElementById("news-modal-category");
        catSpan.innerText = category;
        // Reset classes and add specific color class based on category
        catSpan.className = "tag"; 
        if (category === "saude") catSpan.classList.add("tag-green");
        else if (category === "educacao") catSpan.classList.add("tag-red");
        else catSpan.classList.add("tag-primary");

        // Setup Carousel
        setupNewsCarousel(images);

        // Show Modal
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    };

    window.closeNewsModal = function() {
        const modal = document.getElementById("news-modal");
        modal.classList.remove("active");
        document.body.style.overflow = "auto";
        stopNewsCarousel();
    };

    function setupNewsCarousel(images) {
        const track = document.getElementById("news-carousel-track");
        const dotsContainer = document.getElementById("news-carousel-dots");
        
        track.innerHTML = "";
        dotsContainer.innerHTML = "";
        currentNewsSlide = 0;

        // If no images, use a placeholder or hide?
        if (images.length === 0) {
            images = ["assets/img/instituto-eixos-logo.png"];
        }

        images.forEach((src, index) => {
            const img = document.createElement("img");
            img.src = src;
            img.className = "carousel-slide";
            track.appendChild(img);

            const dot = document.createElement("div");
            dot.className = index === 0 ? "carousel-dot active" : "carousel-dot";
            dot.onclick = () => goToNewsSlide(index);
            dotsContainer.appendChild(dot);
        });

        // Start Auto Play
        stopNewsCarousel(); // clear any existing
        newsCarouselInterval = setInterval(nextNewsSlide, 3000); // 3 seconds
    }

    function nextNewsSlide() {
        const track = document.getElementById("news-carousel-track");
        const slides = track.children;
        if (slides.length <= 1) return;

        currentNewsSlide = (currentNewsSlide + 1) % slides.length;
        updateNewsCarousel();
    }

    window.goToNewsSlide = function(index) {
        currentNewsSlide = index;
        updateNewsCarousel();
        // Reset timer on manual interaction
        stopNewsCarousel();
        newsCarouselInterval = setInterval(nextNewsSlide, 3000);
    }

    function updateNewsCarousel() {
        const track = document.getElementById("news-carousel-track");
        track.style.transform = `translateX(-${currentNewsSlide * 100}%)`;

        const dots = document.getElementById("news-carousel-dots").children;
        Array.from(dots).forEach((dot, idx) => {
            dot.classList.toggle("active", idx === currentNewsSlide);
        });
    }

    function stopNewsCarousel() {
        if (newsCarouselInterval) clearInterval(newsCarouselInterval);
    }

    // Close on outside click
    document.getElementById("news-modal")?.addEventListener("click", (e) => {
        if (e.target.id === "news-modal") closeNewsModal();
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && document.getElementById("news-modal").classList.contains("active")) {
            closeNewsModal();
        }
    });


  // === DONATION WIZARD LOGIC ===
  const donationTabs = document.querySelectorAll(".donation-tab");
  const methodContents = document.querySelectorAll(".donation-method-content");
  const amountBtns = document.querySelectorAll(".amount-btn");
  const customInput = document.querySelector(".custom-amount-input");

  // 1. Tab Switching
  donationTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      // Remove active from tabs
      donationTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      // Show target content
      const target = tab.getAttribute("data-target");
      methodContents.forEach((content) => {
        content.classList.remove("active");
        if (content.id === `method-${target}`) {
          content.classList.add("active");
        }
      });
    });
  });

  // 2. Amount Selection
  amountBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      amountBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      if (customInput) customInput.value = ""; // Clear custom if preset selected
    });
  });

  if (customInput) {
    customInput.addEventListener("input", () => {
      amountBtns.forEach((b) => b.classList.remove("active"));
    });
  }

  // 3. PIX Copy Logic
  window.copyPix = function () {
    const pixCode = document.querySelector(".copy-box code").innerText;
    navigator.clipboard.writeText(pixCode).then(() => {
      const btn = document.querySelector(".copy-box .btn");
      const originalText = btn.innerText;
      btn.innerText = "Copiado!";
      btn.classList.add("btn-green"); // Assuming a green style exists or adding inline
      btn.style.background = "var(--accent-green)";
      
      setTimeout(() => {
        btn.innerText = originalText;
        btn.style.background = "";
      }, 2000);
    }).catch(err => {
      console.error('Erro ao copiar: ', err);
      alert('Não foi possível copiar o código. Por favor, selecione e copie manualmente.');
    });
  };
});
