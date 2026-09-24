const root = document.documentElement;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Theme toggle with circular reveal ---------- */
const toggle = document.getElementById("theme-toggle");

function setTheme(theme) {
  root.dataset.theme = theme;
  try { localStorage.setItem("theme", theme); } catch (e) {}
}

toggle.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";

  if (!document.startViewTransition || reduceMotion) {
    setTheme(next);
    return;
  }

  // Expand the new theme outward from the toggle button
  const r = toggle.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.style.setProperty("--tx", `${x}px`);
  root.style.setProperty("--ty", `${y}px`);
  root.style.setProperty("--tr", `${radius}px`);

  document.startViewTransition(() => setTheme(next));
});

// Follow system changes if the user hasn't picked a theme
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (err) {}
  if (!saved) root.dataset.theme = e.matches ? "dark" : "light";
});

/* ---------- Scroll reveal ---------- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

// Stagger siblings that reveal together (project cards, timeline items)
document.querySelectorAll(".projects, .timeline, .minis").forEach((group) => {
  [...group.children].forEach((el, i) => el.style.setProperty("--stagger", `${i * 90}ms`));
});
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ---------- Nav: hide on scroll down, show on scroll up ---------- */
const nav = document.getElementById("nav");
let lastY = scrollY;
let ticking = false;

addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = scrollY;
    nav.classList.toggle("is-scrolled", y > 8);
    nav.classList.toggle("is-hidden", y > lastY && y > 200);
    lastY = y;
    ticking = false;
  });
}, { passive: true });

/* ---------- Active section indicator ---------- */
const links = [...document.querySelectorAll(".nav__links a")];
const indicator = document.querySelector(".nav__indicator");

function moveIndicator(link) {
  if (!link) { indicator.style.opacity = 0; return; }
  const navBox = indicator.parentElement.getBoundingClientRect();
  const box = link.getBoundingClientRect();
  indicator.style.width = `${box.width - 24}px`;
  indicator.style.transform = `translateX(${box.left - navBox.left + 12}px)`;
  indicator.style.opacity = 1;
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const active = links.find((a) => a.getAttribute("href") === `#${entry.target.id}`);
      links.forEach((a) => a.classList.toggle("is-active", a === active));
      moveIndicator(active);
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
document.querySelectorAll("main section[id]").forEach((s) => sectionObserver.observe(s));

/* ---------- Project cards: cursor-following glow ---------- */
document.querySelectorAll(".project").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  });
});

document.getElementById("year").textContent = new Date().getFullYear();
