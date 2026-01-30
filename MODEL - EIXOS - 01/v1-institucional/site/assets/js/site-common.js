// Remoção temporária de checkAuth para diagnosticar desaparecimento da página
// import { checkAuth } from '../../../admin/assets/js/auth-guard.js';
import { db } from './firebase-config.js';
import { doc, updateDoc, increment, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Visit Tracking
const trackVisit = async () => {
    try {
        const sessionKey = 'site-visit-counted';
        if (!sessionStorage.getItem(sessionKey)) {
            const analyticsRef = doc(db, "config", "analytics");
            try {
                await updateDoc(analyticsRef, {
                    visits: increment(1),
                    lastVisit: new Date().toISOString()
                });
            } catch (e) {
                // If doc doesn't exist, create it
                await setDoc(analyticsRef, { visits: 1, lastVisit: new Date().toISOString() });
            }
            sessionStorage.setItem(sessionKey, 'true');
        }
    } catch (error) {
        console.warn("Analytics error:", error);
    }
};
trackVisit();

document.addEventListener("DOMContentLoaded", function () {
    // Forçar visibilidade do site em caso de bloqueio por scripts anteriores
    document.body.style.opacity = '1';
    document.body.style.visibility = 'visible';

    // 1. Mobile Menu Logic
    const menuToggle = document.querySelector(".menu-toggle");
    const navMenu = document.querySelector(".nav-menu");
    const logo = document.querySelector(".header-seal-logo");

    if (menuToggle && navMenu) {
        menuToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
        });

        // Close menu when clicking a link
        document.querySelectorAll(".nav-link").forEach((link) => {
            link.addEventListener("click", () => {
                navMenu.classList.remove("active");
            });
        });
    }

    // --- FLUID PULL-DOWN MENU GESTURE (Logo) ---
    let startY = 0;
    let currentY = 0;
    if (logo && navMenu) {
        logo.addEventListener("touchstart", (e) => {
            startY = e.touches[0].clientY;
            logo.style.transition = "none";
            navMenu.style.transition = "none";
        }, { passive: true });

        logo.addEventListener("touchmove", (e) => {
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            const menuHeight = navMenu.offsetHeight;
            const isOpen = navMenu.classList.contains("active");

            if (!isOpen && diff > 0) {
                logo.style.transform = `translateY(${diff}px)`;
                const menuPixelOffset = diff - menuHeight; 
                navMenu.style.transform = `translateY(${menuPixelOffset}px)`;
            }

            if (isOpen && diff < 0) {
                logo.style.transform = `translateY(${diff}px)`;
                navMenu.style.transform = `translateY(${diff}px)`;
            }
        }, { passive: true });

        logo.addEventListener("click", (e) => {
            if (window.innerWidth <= 900) {
                e.preventDefault();
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
            logo.style.transition = "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)";
            navMenu.style.transition = "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)";
            logo.style.transform = ""; 

            if (!isOpen) {
                if (diff > 150 && window.innerWidth <= 900) {
                    navMenu.style.transform = ""; 
                    navMenu.classList.add("active"); 
                    if (navigator.vibrate) navigator.vibrate(50);
                } else {
                    navMenu.style.transform = ""; 
                }
            } else {
                if (diff < -100) {
                    navMenu.style.transform = "";
                    navMenu.classList.remove("active");
                    if (navigator.vibrate) navigator.vibrate(50);
                } else {
                    navMenu.style.transform = "";
                }
            }
        });
    }

    // 2. Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: "smooth" });
                if (navMenu) navMenu.classList.remove("active");
            }
        });
    });

    // 3. Scroll Reveal Observer
    const revealElements = document.querySelectorAll(".reveal, .reveal-text");
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                if (!entry.target.classList.contains('reveal-text')) {
                    observer.unobserve(entry.target);
                }
            }
        });
    }, { threshold: 0.15 });
    revealElements.forEach((el) => revealObserver.observe(el));

    // 4. Floating Socials
    const isContactPage = window.location.pathname.includes("fale-conosco");
    if (!isContactPage && !document.querySelector('.floating-socials')) {
        const socialContainer = document.createElement("div");
        socialContainer.className = "floating-socials";
        socialContainer.innerHTML = `
            <a href="https://wa.me/5561981030472" target="_blank" class="social-float-btn btn-whatsapp"><i class="fab fa-whatsapp"></i></a>
            <a href="https://www.instagram.com/institutoeixos/" target="_blank" class="social-float-btn btn-instagram"><i class="fab fa-instagram"></i></a>
        `;
        document.body.appendChild(socialContainer);
    }

    // 5. Magnetic Buttons
    if (window.innerWidth > 768) {
        document.querySelectorAll(".btn").forEach(btn => {
            btn.addEventListener("mousemove", (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
            });
            btn.addEventListener("mouseleave", () => {
                btn.style.transform = "translate(0, 0)";
            });
        });
    }
});
