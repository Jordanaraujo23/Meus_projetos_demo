document.addEventListener("DOMContentLoaded", function () {
  // Mobile Menu Toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  // Close menu when clicking a link
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active");
    });
  });

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
});
