/* =========================================================
   PORTFOLIO — app.js
   John Cedrick A. Libradilla
   ========================================================= */

/* ===== SIDEBAR TOGGLE ===== */
const navToggle = document.getElementById("nav-toggle");
const navClose = document.getElementById("nav-close");
const sidebar = document.getElementById("sidebar");

if (navToggle) {
  navToggle.addEventListener("click", () => {
    sidebar.classList.add("show-sidebar");
  });
}
if (navClose) {
  navClose.addEventListener("click", () => {
    sidebar.classList.remove("show-sidebar");
  });
}

/* ===== ACTIVE NAV LINK ON SCROLL ===== */
const sections = document.querySelectorAll("section[id]");

function scrollActive() {
  const scrollY = window.scrollY;
  sections.forEach((current) => {
    const sectionHeight = current.offsetHeight;
    const sectionTop = current.offsetTop - 120;
    const sectionId = current.getAttribute("id");
    const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

    if (navLink) {
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLink.classList.add("active-link");
      } else {
        navLink.classList.remove("active-link");
      }
    }
  });
}
window.addEventListener("scroll", scrollActive);

/* Close sidebar when a nav link is clicked on mobile */
const navLinks = document.querySelectorAll(".nav-link");
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    sidebar.classList.remove("show-sidebar");
  });
});

/* ===== SKILLS ACCORDION ===== */
const skillsHeaders = document.querySelectorAll(".skills-header");

skillsHeaders.forEach((header) => {
  header.addEventListener("click", () => {
    const target = header.dataset.target;
    const alreadyActive = header.classList.contains("skills-active");

    // Remove active from all headers and content
    skillsHeaders.forEach((h) => h.classList.remove("skills-active"));
    document.querySelectorAll(".skills-group").forEach((g) => {
      g.classList.remove("skills-active");
    });

    // Activate clicked if not already active
    if (!alreadyActive) {
      header.classList.add("skills-active");
      const targetEl = document.querySelector(target);
      if (targetEl) targetEl.classList.add("skills-active");
    }
  });
});

/* ===== WORK FILTER (MixItUp) ===== */
let mixer;
try {
  mixer = mixitup(".work-container", {
    selectors: { target: ".work-card" },
    animation: { duration: 300, easing: "ease-in-out" },
  });
} catch (e) {
  // MixItUp not available
}

const workFilters = document.querySelectorAll(".work-item");
workFilters.forEach((filter) => {
  filter.addEventListener("click", () => {
    workFilters.forEach((f) => f.classList.remove("active-work"));
    filter.classList.add("active-work");
  });
});

/* ===== PORTFOLIO POPUP ===== */
const workCards = document.querySelectorAll(".work-card");
const portfolioPopup = document.getElementById("portfolio-popup");
const popupClose = document.getElementById("portfolio-popup-close");

const popupImg = document.getElementById("popup-img");
const popupTitle = document.getElementById("popup-title");
const popupDescription = document.getElementById("popup-description");
const popupInfo = document.getElementById("popup-info");

workCards.forEach((card) => {
  const btn = card.querySelector(".work-button");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const img = card.querySelector(".work-img");
    const title = card.querySelector(".work-title");
    const details = card.querySelector(".portfolio-item-details");

    if (!details) return;

    const detailTitle = details.querySelector(".details-title");
    const detailDesc = details.querySelector(".details-description");
    const detailInfoItems = details.querySelectorAll(".details-info li");

    if (popupImg) {
      popupImg.src = img ? img.src : "";
      popupImg.alt = img ? img.alt : "";
    }
    if (popupTitle) popupTitle.textContent = detailTitle ? detailTitle.textContent : "";
    if (popupDescription) popupDescription.textContent = detailDesc ? detailDesc.textContent : "";
    if (popupInfo) {
      popupInfo.innerHTML = "";
      detailInfoItems.forEach((li) => {
        popupInfo.appendChild(li.cloneNode(true));
      });
    }

    portfolioPopup.classList.add("open");
    document.body.style.overflow = "hidden";
  });
});

if (popupClose) {
  popupClose.addEventListener("click", closePopup);
}
portfolioPopup?.addEventListener("click", (e) => {
  if (e.target === portfolioPopup) closePopup();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closePopup();
});

function closePopup() {
  portfolioPopup?.classList.remove("open");
  document.body.style.overflow = "";
}

/* ===== SERVICES MODAL ===== */
const modalBtns = document.querySelectorAll("[id^='modal-btn-']");
const modalCloses = document.querySelectorAll("[id^='modal-close-']");

modalBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const modalId = btn.id.replace("modal-btn-", "modal-");
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("active-modal");
      document.body.style.overflow = "hidden";
    }
  });
});

modalCloses.forEach((closeBtn) => {
  closeBtn.addEventListener("click", () => {
    const modalId = closeBtn.id.replace("modal-close-", "modal-");
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("active-modal");
      document.body.style.overflow = "";
    }
  });
});

// Close modal on backdrop click
document.querySelectorAll(".services-modal").forEach((modal) => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("active-modal");
      document.body.style.overflow = "";
    }
  });
});

/* ===== CONTACT FORM LABEL FLOAT ===== */
const inputContainers = document.querySelectorAll(".input-container");

inputContainers.forEach((container) => {
  const input = container.querySelector(".input");
  if (!input) return;

  input.addEventListener("focus", () => container.classList.add("focus"));
  input.addEventListener("blur", () => {
    if (input.value.trim() === "") container.classList.remove("focus");
  });
  // Re-check on load (if pre-filled)
  if (input.value.trim() !== "") container.classList.add("focus");
});

/* ===== CONTACT FORM SUBMIT ===== */
const contactForm = document.getElementById("contact-form");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = document.getElementById("contact-submit");
    const original = btn ? btn.innerHTML : "";

    if (btn) {
      btn.innerHTML = '<i class="uil uil-check-circle button-icon"></i> Sent!';
      btn.style.pointerEvents = "none";
      btn.style.opacity = "0.8";
    }

    setTimeout(() => {
      if (btn) {
        btn.innerHTML = original;
        btn.style.pointerEvents = "";
        btn.style.opacity = "";
      }
      contactForm.reset();
      inputContainers.forEach((c) => c.classList.remove("focus"));
    }, 3000);
  });
}

/* ===== SWIPER (TESTIMONIALS) ===== */
let swiperInstance;
try {
  swiperInstance = new Swiper(".testimonials-container", {
    loop: true,
    grabCursor: true,
    spaceBetween: 24,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    breakpoints: {
      576: { slidesPerView: 1 },
      768: { slidesPerView: 1 },
    },
  });
} catch (e) {
  // Swiper not available
}

/* ===== SCROLL REVEAL (subtle fade-up) ===== */
function revealOnScroll() {
  const reveals = document.querySelectorAll(
    ".about-container, .qualification-container, .skills-container, .work-card, .services-content, .testimonial-card, .contact-container"
  );

  reveals.forEach((el) => {
    const windowHeight = window.innerHeight;
    const elementTop = el.getBoundingClientRect().top;
    const revealPoint = 80;

    if (elementTop < windowHeight - revealPoint) {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }
  });
}

// Initialize styles for reveal elements
document.querySelectorAll(
  ".about-container, .qualification-container, .skills-container, .work-card, .services-content, .testimonial-card, .contact-container"
).forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(30px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
});

window.addEventListener("scroll", revealOnScroll);
revealOnScroll(); // Run once on load
