/* ==========================================================================
   JITT ATHLETICS — site behaviour
   Plain JS, no dependencies.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Mobile navigation ---------- */
  var nav = document.getElementById('nav');
  var toggle = document.getElementById('navToggle');

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
  }

  /* ---------- Header hairline once scrolled ---------- */
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Active nav link ---------- */
  var navLinks = {};
  document.querySelectorAll('.nav > a[href^="#"]').forEach(function (link) {
    navLinks[link.getAttribute('href').slice(1)] = link;
  });
  var sections = document.querySelectorAll('section[id], article[id]');
  if ('IntersectionObserver' in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = navLinks[entry.target.id];
        if (!link || !entry.isIntersecting) return;
        Object.keys(navLinks).forEach(function (k) { navLinks[k].classList.remove('active'); });
        link.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- Join modal ----------
     Every "Join JITT" / "Join the movement" control opens this, so the
     primary CTA has a destination without adding a section to the design.
  ---------------------------------- */
  var modal = document.getElementById('joinModal');
  var joinForm = document.getElementById('joinForm');
  var joinEmail = document.getElementById('joinEmail');
  var joinNote = document.getElementById('joinNote');
  var lastFocused = null;

  function openModal() {
    lastFocused = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    joinEmail.focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  if (modal) {
    document.querySelectorAll('[data-join]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); closeNav(); openModal(); });
    });
    modal.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (!modal.hidden) closeModal(); else closeNav(); }
      // keep focus inside the dialog while it's open
      if (e.key === 'Tab' && !modal.hidden) {
        var f = modal.querySelectorAll('button, input, a[href]');
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Signup ----------
     With an `action` on the form the email is POSTed there in the background.
     Without one it falls back to the visitor's email client.
  ----------------------------- */
  if (joinForm) {
    joinForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = joinEmail.value.trim();
      joinNote.className = 'form-note';

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        joinEmail.classList.add('invalid');
        joinNote.textContent = 'Enter a valid email address.';
        joinNote.classList.add('err');
        joinEmail.focus();
        return;
      }
      joinEmail.classList.remove('invalid');

      var action = joinForm.getAttribute('action');
      if (action) {
        joinNote.textContent = 'Signing you up…';
        fetch(action, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: value })
        }).then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          joinForm.reset();
          joinNote.textContent = 'You’re in. Welcome to JITT.';
          joinNote.classList.add('ok');
        }).catch(function () {
          joinNote.textContent = 'Something went wrong — email ' + (joinForm.dataset.mailto || '') + '.';
          joinNote.classList.add('err');
        });
        return;
      }

      var to = joinForm.dataset.mailto || '';
      window.location.href = 'mailto:' + to +
        '?subject=' + encodeURIComponent('Join JITT') +
        '&body=' + encodeURIComponent('Please add me to the JITT Athletics list: ' + value);
      joinNote.textContent = 'Opening your email app… or write to ' + to + '.';
      joinNote.classList.add('ok');
    });
  }

  /* ---------- Cart placeholder ---------- */
  var cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.addEventListener('click', function () {
      // No store connected yet — see README for wiring this to Shopify.
      openModal();
    });
  }
})();
