'use strict';

const THEMES = ['system', 'light', 'dark'];
const root = document.documentElement;
const themeOptions = document.querySelectorAll('[data-theme-opt]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function commitTheme(theme) {
  const nextTheme = THEMES.includes(theme) ? theme : 'system';
  root.dataset.theme = nextTheme;
  localStorage.setItem('portfolio-theme', nextTheme);
  themeOptions.forEach(button => {
    const isActive = button.dataset.themeOpt === nextTheme;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function setTheme(theme, event = null) {
  const nextTheme = THEMES.includes(theme) ? theme : 'system';
  const target = event?.currentTarget;
  const rect = target?.getBoundingClientRect();
  const x = event?.clientX || (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
  const y = event?.clientY || (rect ? rect.top + rect.height / 2 : window.innerHeight / 2);
  root.style.setProperty('--theme-x', `${x}px`);
  root.style.setProperty('--theme-y', `${y}px`);

  if (document.startViewTransition && !reducedMotion.matches && event) {
    document.startViewTransition(() => commitTheme(nextTheme));
  } else {
    commitTheme(nextTheme);
  }
}

function cycleTheme(event = null) {
  const currentIndex = THEMES.indexOf(root.dataset.theme);
  setTheme(THEMES[(currentIndex + 1) % THEMES.length], event);
}

commitTheme(root.dataset.theme || 'system');

themeOptions.forEach(button => {
  button.addEventListener('click', event => setTheme(button.dataset.themeOpt, event));
});

const menu = document.getElementById('mobile-menu');
const menuToggle = document.querySelector('.menu-toggle');
const menuClose = document.querySelector('.menu-close');

function openMenu() {
  menu.classList.add('open');
  menu.setAttribute('aria-hidden', 'false');
  menuToggle.setAttribute('aria-expanded', 'true');
  document.body.classList.add('menu-open');
  menuClose.focus();
}

function closeMenu(restoreFocus = false) {
  if (!menu.classList.contains('open')) return;
  menu.classList.remove('open');
  menu.setAttribute('aria-hidden', 'true');
  menuToggle.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
  if (restoreFocus) menuToggle.focus();
}

menuToggle.addEventListener('click', openMenu);
menuClose.addEventListener('click', () => closeMenu(true));
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu(false)));

const progressBar = document.querySelector('[data-scroll-progress]');
let scrollFrame = 0;

function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
  progressBar.style.transform = `scaleX(${progress})`;
  scrollFrame = 0;
}

window.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(updateScrollProgress);
}, { passive: true });
updateScrollProgress();

const localTime = document.querySelector('[data-local-time]');
const manilaClock = new Intl.DateTimeFormat('en-PH', {
  timeZone: 'Asia/Manila',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});

function updateLocalTime() {
  const now = new Date();
  localTime.dateTime = now.toISOString();
  localTime.textContent = `${manilaClock.format(now)} PHT`;
}

updateLocalTime();
window.setInterval(updateLocalTime, 1000);

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reducedMotion.matches) {
  document.querySelectorAll('[data-tilt]').forEach(card => {
    let tiltFrame = 0;
    let pointerX = 0;
    let pointerY = 0;

    card.addEventListener('pointermove', event => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (tiltFrame) return;
      tiltFrame = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = (pointerX - rect.left) / rect.width;
        const y = (pointerY - rect.top) / rect.height;
        card.style.setProperty('--tilt-x', `${(0.5 - y) * 1.8}deg`);
        card.style.setProperty('--tilt-y', `${(x - 0.5) * 1.8}deg`);
        card.style.setProperty('--glow-x', `${x * 100}%`);
        card.style.setProperty('--glow-y', `${y * 100}%`);
        tiltFrame = 0;
      });
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      card.style.setProperty('--glow-x', '50%');
      card.style.setProperty('--glow-y', '50%');
    });
  });
}

const commandDialog = document.getElementById('command-dialog');
const commandInput = document.querySelector('[data-command-input]');
const commandItems = Array.from(document.querySelectorAll('[data-command-item]'));
const commandEmpty = document.querySelector('[data-command-empty]');
let commandIndex = 0;

function visibleCommandItems() {
  return commandItems.filter(item => !item.hidden);
}

function selectCommandItem(index) {
  const items = visibleCommandItems();
  commandItems.forEach(item => item.removeAttribute('data-selected'));
  if (!items.length) return;
  commandIndex = (index + items.length) % items.length;
  items[commandIndex].setAttribute('data-selected', 'true');
  items[commandIndex].scrollIntoView({ block: 'nearest' });
}

function filterCommands() {
  const query = commandInput.value.trim().toLowerCase();
  commandItems.forEach(item => {
    const haystack = `${item.textContent} ${item.dataset.keywords || ''}`.toLowerCase();
    item.hidden = Boolean(query) && !haystack.includes(query);
  });
  commandEmpty.hidden = visibleCommandItems().length > 0;
  selectCommandItem(0);
}

function openCommand() {
  closeMenu(false);
  commandInput.value = '';
  filterCommands();
  commandDialog.showModal();
  requestAnimationFrame(() => commandInput.focus());
}

function closeCommand() {
  if (commandDialog.open) commandDialog.close();
}

document.querySelectorAll('[data-command-open]').forEach(button => button.addEventListener('click', openCommand));
document.querySelector('[data-command-close]').addEventListener('click', closeCommand);
commandInput.addEventListener('input', filterCommands);
commandInput.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown') {
    event.preventDefault();
    selectCommandItem(commandIndex + 1);
  } else if (event.key === 'ArrowUp') {
    event.preventDefault();
    selectCommandItem(commandIndex - 1);
  } else if (event.key === 'Enter') {
    const selected = visibleCommandItems()[commandIndex];
    if (selected) {
      event.preventDefault();
      selected.click();
    }
  }
});

commandDialog.addEventListener('click', event => {
  if (event.target === commandDialog) closeCommand();
});

commandItems.filter(item => item.matches('a')).forEach(link => {
  link.addEventListener('click', closeCommand);
});

document.querySelector('[data-command-theme]').addEventListener('click', event => {
  cycleTheme(event);
  closeCommand();
});

const revealElements = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 70, 330)}ms`;
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach(element => element.classList.add('in'));
}

window.setTimeout(() => {
  revealElements.forEach(element => element.classList.add('in'));
}, 1200);

const sidebarLinks = document.querySelectorAll('.sidebar-nav a[data-section]');
const observedSections = document.querySelectorAll('section[id]');
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      sidebarLinks.forEach(link => {
        const isActive = link.dataset.section === entry.target.id;
        link.classList.toggle('active', isActive);
        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  observedSections.forEach(section => sectionObserver.observe(section));
}

const CASE_STUDIES = {
  pasahero: {
    title: 'PasaHERO — AI-Assisted Multimodal Navigation',
    eyebrow: 'Capstone · 2025—present · in development',
    image: 'assets/PASAHERO.webp',
    summary: 'A commuter-first navigation platform designed around the realities of Cebu City public transportation.',
    challenge: 'Jeepney routes are difficult to understand, transfers are unclear, and commuters lack one dependable source for route, fare, and landmark guidance.',
    response: 'We designed a rule-based recommendation system that compares route availability, estimated fare, walking distance, transfers, and nearby landmarks, then presents the result through an interactive map.',
    role: 'I contribute across responsive interface development, Node and Express services, the MySQL data model, Mapbox integration, recommendation logic, testing, architecture diagrams, and technical documentation.',
    stack: ['React', 'Tailwind CSS', 'Node.js', 'Express', 'MySQL', 'Sequelize', 'Mapbox GL JS', 'Figma']
  },
  ltoreviewer: {
    title: 'LTO Reviewer — Quiz Master',
    eyebrow: 'Full-stack learning tool · 2025 · live',
    image: 'assets/bettergovfeaturesreviewer.webp',
    summary: 'An interactive exam-preparation platform for Philippine driver’s-license applicants.',
    challenge: 'Static PDFs provide no immediate feedback, make progress difficult to assess, and create a poor study experience on mobile devices.',
    response: 'I built a responsive quiz engine with categorized questions, immediate explanations, score summaries, signed quiz sessions, server-side rate limiting, and automated browser tests.',
    role: 'Product design, frontend and API implementation, question-data architecture, security controls, responsive behavior, testing, and deployment.',
    stack: ['Next.js 15', 'React 18', 'TypeScript', 'Tailwind CSS 4', 'API routes', 'Node test runner', 'Playwright', 'Vercel'],
    live: 'https://quizziz-cedrick.vercel.app/',
    feature: 'https://www.facebook.com/share/p/1PLsyqtzPx/'
  },
  clothing: {
    title: '1968 Clothing — E-Commerce Experience',
    eyebrow: 'Brand landing page · 2025 · live',
    image: 'assets/1968 CLOTHING LANDING PAGE.webp',
    summary: 'A fast, responsive product showcase for a contemporary streetwear identity.',
    challenge: 'The brand needed a distinct online presence that could introduce its visual identity and make apparel easy to explore on mobile and desktop.',
    response: 'I created a bold but direct product experience with a responsive catalog, custom card system, interactive imagery, and optimized local assets.',
    role: 'Visual direction, information architecture, responsive frontend development, catalog structure, interaction design, and deployment.',
    stack: ['HTML5', 'CSS3', 'JavaScript', 'Local JSON', 'Git', 'Vercel'],
    live: 'https://1968-clothing.vercel.app/'
  }
};

const caseDialog = document.getElementById('case-dialog');
const caseContent = document.querySelector('[data-dialog-content]');
const caseClose = document.querySelector('[data-dialog-close]');

function caseBlock(title, content) {
  return `<section class="case-block"><h3>${title}</h3><p>${content}</p></section>`;
}

function openCaseStudy(key) {
  const study = CASE_STUDIES[key];
  if (!study) return;
  const tags = study.stack.map(item => `<li>${item}</li>`).join('');
  const liveLink = study.live
    ? `<a class="button button-primary" href="${study.live}" target="_blank" rel="noopener noreferrer">Open live site ↗</a>`
    : '';
  const featureLink = study.feature
    ? `<a class="text-link" href="${study.feature}" target="_blank" rel="noopener noreferrer">BetterGov.ph feature ↗</a>`
    : '';

  caseContent.innerHTML = `
    <p class="dialog-eyebrow">${study.eyebrow}</p>
    <h2 id="case-dialog-title">${study.title}</h2>
    <p class="dialog-summary">${study.summary}</p>
    <img class="dialog-hero" src="${study.image}" alt="${study.title} project preview">
    ${caseBlock('Challenge', study.challenge)}
    ${caseBlock('Response', study.response)}
    ${caseBlock('My role', study.role)}
    <section class="case-block"><h3>Stack</h3><ul>${tags}</ul></section>
    ${(liveLink || featureLink) ? `<div class="dialog-actions">${liveLink}${featureLink}</div>` : ''}
  `;
  caseDialog.showModal();
}

document.querySelectorAll('[data-case-study]').forEach(button => {
  button.addEventListener('click', () => openCaseStudy(button.dataset.caseStudy));
});

caseClose.addEventListener('click', () => caseDialog.close());
caseDialog.addEventListener('click', event => {
  if (event.target === caseDialog) caseDialog.close();
});

const imageDialog = document.getElementById('image-dialog');
const dialogImage = document.querySelector('[data-dialog-image]');
const dialogCaption = document.querySelector('[data-image-caption]');

document.querySelectorAll('[data-gallery] button').forEach(button => {
  button.addEventListener('click', () => {
    dialogImage.src = button.dataset.image;
    dialogImage.alt = button.dataset.caption;
    dialogCaption.textContent = button.dataset.caption;
    imageDialog.showModal();
  });
});

document.querySelector('[data-image-close]').addEventListener('click', () => imageDialog.close());
imageDialog.addEventListener('click', event => {
  if (event.target === imageDialog) imageDialog.close();
});

document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (commandDialog.open) closeCommand();
    else openCommand();
    return;
  }
  if (event.key === 'Escape' && menu.classList.contains('open')) closeMenu(true);
});

const copyButton = document.querySelector('[data-copy-email]');
const commandCopy = document.querySelector('[data-command-copy]');

async function copyEmail(trigger) {
  const label = trigger.querySelector('span') || trigger;
  const original = label.textContent;
  try {
    await navigator.clipboard.writeText('johncedricklibradilla@gmail.com');
    label.textContent = 'copied ✓';
  } catch {
    label.textContent = 'copy unavailable';
  }
  window.setTimeout(() => { label.textContent = original; }, 2200);
}

copyButton.addEventListener('click', () => copyEmail(copyButton));
commandCopy.addEventListener('click', async () => {
  await copyEmail(commandCopy);
  window.setTimeout(closeCommand, 450);
});

const legacyPortal = document.querySelector('[data-legacy-portal]');
const legacyToggle = document.querySelector('[data-legacy-toggle]');
const legacyMenu = document.querySelector('[data-legacy-menu]');
const legacyTop = document.querySelector('[data-legacy-top]');

function setLegacyMenu(open) {
  legacyMenu.hidden = !open;
  legacyToggle.setAttribute('aria-expanded', String(open));
  legacyToggle.setAttribute('aria-label', open ? 'Close legacy portfolio options' : 'Open legacy portfolio options');
}

legacyToggle.addEventListener('click', () => {
  setLegacyMenu(legacyMenu.hidden);
});

legacyTop.addEventListener('click', () => {
  setLegacyMenu(false);
  window.scrollTo({ top: 0, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
});

document.addEventListener('pointerdown', event => {
  if (!legacyMenu.hidden && !legacyPortal.contains(event.target)) setLegacyMenu(false);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !legacyMenu.hidden) {
    setLegacyMenu(false);
    legacyToggle.focus();
  }
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();
