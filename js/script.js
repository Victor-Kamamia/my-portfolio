const body = document.body;
const intro = document.getElementById("intro");
const enterButton = document.getElementById("enterPortfolio");
const header = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const navItems = [...document.querySelectorAll(".nav-links a")];
const revealItems = [...document.querySelectorAll(".reveal")];
const skillBars = [...document.querySelectorAll(".skill")];
const filterButtons = [...document.querySelectorAll(".filter-btn")];
const skillCards = [...document.querySelectorAll(".skill-card")];
const cursorGlow = document.querySelector(".cursor-glow");

body.classList.add("intro-active");
document.getElementById("year").textContent = new Date().getFullYear();

function activateImageSlots() {
  document.querySelectorAll(".portrait-card, .image-slot").forEach((slot) => {
    const image = slot.querySelector("img");
    const hasImage = Boolean(image && image.getAttribute("src") && image.getAttribute("src").trim());
    slot.classList.toggle("has-image", hasImage);
  });
}

function typeIntroText() {
  const target = document.querySelector(".typing-text");
  if (!target) return;

  const text = target.dataset.text || "";
  let index = 0;
  const write = () => {
    target.textContent = text.slice(0, index);
    index += 1;
    if (index <= text.length) {
      window.setTimeout(write, 22);
    }
  };
  write();
}

function enterPortfolio() {
  intro.classList.add("hidden");
  body.classList.remove("intro-active");
  document.getElementById("home").scrollIntoView({ behavior: "smooth" });
}

enterButton.addEventListener("click", enterPortfolio);
window.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !intro.classList.contains("hidden")) {
    enterPortfolio();
  }
});

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navItems.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 40);
});

window.addEventListener("pointermove", (event) => {
  if (!cursorGlow) return;
  cursorGlow.style.transform = `translate3d(${event.clientX - 130}px, ${event.clientY - 130}px, 0)`;
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.16 });

revealItems.forEach((item) => revealObserver.observe(item));

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    skillBars.forEach((skill) => {
      const bar = skill.querySelector("i");
      bar.style.width = `${skill.dataset.level}%`;
    });
    skillObserver.disconnect();
  });
}, { threshold: 0.28 });

const skillsSection = document.getElementById("skills");
if (skillsSection) skillObserver.observe(skillsSection);

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;

    const counter = entry.target;
    const target = Number(counter.dataset.count);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 42));
    const tick = () => {
      current = Math.min(target, current + step);
      counter.textContent = `${current}+`;
      if (current < target) requestAnimationFrame(tick);
    };
    tick();
    countObserver.unobserve(counter);
  });
}, { threshold: 0.5 });

document.querySelectorAll("[data-count]").forEach((counter) => countObserver.observe(counter));

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    const filter = button.dataset.filter;
    skillCards.forEach((card) => {
      card.classList.toggle("is-hidden", filter !== "all" && card.dataset.category !== filter);
    });
  });
});

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const activeLink = navItems.find((link) => link.getAttribute("href") === `#${entry.target.id}`);
    navItems.forEach((link) => link.classList.toggle("active", link === activeLink));
  });
}, { rootMargin: "-42% 0px -52% 0px" });

document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));

document.querySelectorAll("[data-parallax]").forEach((item) => {
  item.addEventListener("pointermove", (event) => {
    const rect = item.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    item.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  });
  item.addEventListener("pointerleave", () => {
    item.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
  });
});

const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");
const submitButton = document.getElementById("submitButton");

function setFieldState(field, message, valid) {
  const errorNode = document.getElementById(`${field.id}Error`);
  const isValid = typeof valid === "boolean" ? valid : true;

  field.setAttribute("aria-invalid", String(!isValid));

  if (errorNode) {
    errorNode.textContent = message || "";
  }

  if (!isValid) {
    field.focus();
  }
}

function validateForm() {
  const formData = {
    name: document.getElementById("name"),
    email: document.getElementById("email"),
    phone: document.getElementById("phone"),
    subject: document.getElementById("subject"),
    message: document.getElementById("message")
  };

  let isValid = true;

  if (!formData.name.value.trim()) {
    setFieldState(formData.name, "Please enter your name.", false);
    isValid = false;
  } else {
    setFieldState(formData.name, "", true);
  }

  if (!formData.email.value.trim()) {
    setFieldState(formData.email, "Please enter your email.", false);
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.value.trim())) {
    setFieldState(formData.email, "Please enter a valid email address.", false);
    isValid = false;
  } else {
    setFieldState(formData.email, "", true);
  }

  if (!formData.subject.value.trim()) {
    setFieldState(formData.subject, "Please enter a subject.", false);
    isValid = false;
  } else {
    setFieldState(formData.subject, "", true);
  }

  if (!formData.message.value.trim()) {
    setFieldState(formData.message, "Please enter your message.", false);
    isValid = false;
  } else {
    setFieldState(formData.message, "", true);
  }

  return isValid;
}

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      formStatus.textContent = "Please fix the highlighted fields and try again.";
      formStatus.className = "form-status error";
      return;
    }

    const payload = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      subject: document.getElementById("subject").value.trim(),
      message: document.getElementById("message").value.trim(),
      submissionDate: document.getElementById("submissionDate").value = new Date().toISOString()
    };

    submitButton.disabled = true;
    submitButton.classList.add("is-loading");
    formStatus.textContent = "Sending your message...";
    formStatus.className = "form-status";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Something went wrong. Please try again or contact me directly.");
      }

      formStatus.textContent = "Message sent successfully. I'll get back to you soon.";
      formStatus.className = "form-status success";
      contactForm.reset();
      document.getElementById("submissionDate").value = "";
    } catch (error) {
      formStatus.textContent = error.message || "Something went wrong. Please try again or contact me directly.";
      formStatus.className = "form-status error";
    } finally {
      submitButton.disabled = false;
      submitButton.classList.remove("is-loading");
    }
  });
}

window.addEventListener("load", () => {
  activateImageSlots();
  typeIntroText();

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(".intro-screen .eyebrow, .intro-screen h1, .intro-roles, .intro-copy, .intro-screen .button-row", {
      y: 24,
      opacity: 0,
      duration: 0.9,
      stagger: 0.12,
      ease: "power3.out"
    });

    gsap.utils.toArray(".project-card, .service-card, .cert-card").forEach((card) => {
      gsap.to(card, {
        y: -10,
        scrollTrigger: {
          trigger: card,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5
        }
      });
    });
  }
});
