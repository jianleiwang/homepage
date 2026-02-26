document.addEventListener('DOMContentLoaded', function () {
  // 1) External links -> open in new tab
  makeAllLinksOpenInNewTab();
  // 如果你页面完全不再动态插入链接，可以把下一行注释掉
  setupLinkObserver();

  // 2) Mobile menu toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    // Close menu when any link is clicked
    mobileMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    });
  }

  // 3) Smooth scrolling for in-page anchor links in nav
  const nav = document.querySelector('.nav-links');
  const navLinks = nav ? nav.querySelectorAll('a[href^="#"]') : [];

  navLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const navHeight = getNavHeight();
      const y = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;

      window.scrollTo({ top: y, behavior: 'smooth' });

      // active class
      navLinks.forEach((l) => l.classList.remove('active'));
      this.classList.add('active');

      // close mobile
      if (mobileMenu) mobileMenu.classList.add('hidden');
    });
  });

  // 4) Update active nav link on scroll
  window.addEventListener('scroll', () => {
    if (!navLinks.length) return;

    const navHeight = getNavHeight();
    let currentId = '';

    // 允许 section / div / span 只要有 id 都能参与高亮
    const anchors = document.querySelectorAll('[id]');
    anchors.forEach((el) => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY >= top - navHeight - 120) {
        currentId = el.id;
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      const id = link.getAttribute('href').slice(1);
      if (id && id === currentId) link.classList.add('active');
    });
  });
});

/* ---------- helpers ---------- */

function getNavHeight() {
  const navEl = document.querySelector('.top-nav');
  return navEl ? navEl.offsetHeight : 0;
}

// Open external links in new tab (ignore hash/mailto)
function makeAllLinksOpenInNewTab() {
  document.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;

    if (href.startsWith('#')) return;
    if (href.startsWith('mailto:')) return;
    if (href.startsWith('tel:')) return;

    // If absolute url and host differs -> external
    try {
      const url = new URL(href, window.location.href);
      if (url.host && url.host !== window.location.host) {
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      }
    } catch (_) {
      // ignore invalid href
    }
  });
}

// MutationObserver: ensure dynamically added external links also open in new tab
function setupLinkObserver() {
  if (!window.MutationObserver) return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((m) => {
      if (m.type !== 'childList') return;
      m.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return; // element only

        if (node.matches && node.matches('a[href]')) {
          patchExternalLink(node);
        }
        if (node.querySelectorAll) {
          node.querySelectorAll('a[href]').forEach(patchExternalLink);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function patchExternalLink(a) {
  const href = a.getAttribute('href');
  if (!href) return;
  if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

  try {
    const url = new URL(href, window.location.href);
    if (url.host && url.host !== window.location.host) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    }
  } catch (_) {}
}
