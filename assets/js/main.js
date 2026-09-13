/* ==========================================================================
   JITT ATHLETICS — site behaviour
   Plain JS, no dependencies. Runs after the DOM because the tag is at the
   bottom of <body>.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Current year in the footer ---------- */
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
      if (e.target.tagName === 'A') closeNav();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal elements as they enter the viewport ---------- */
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
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealables.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Count up the hero stats once ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    var suffix = el.textContent.replace(/[\d\s,]/g, '');
    var start = performance.now();
    var duration = 1100;
    function step(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObserver.observe(el); });
  }

  /* ---------- Highlight the section you're looking at ---------- */
  var sections = document.querySelectorAll('main section[id]');
  var navLinks = {};
  document.querySelectorAll('.nav a[href^="#"]').forEach(function (link) {
    navLinks[link.getAttribute('href').slice(1)] = link;
  });
  if ('IntersectionObserver' in window && sections.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = navLinks[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          Object.keys(navLinks).forEach(function (k) { navLinks[k].classList.remove('active'); });
          link.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- Contact form ----------
     Two modes:
       1. If the <form> has an `action` (e.g. a Formspree endpoint), the message
          is POSTed there over fetch and the visitor never leaves the page.
       2. Otherwise it falls back to opening the visitor's email client,
          addressed to the value of data-mailto.
  ------------------------------------- */
  var form = document.getElementById('contactForm');
  var note = document.getElementById('formNote');

  function setError(field, message) {
    var wrapper = field.closest('.field');
    var slot = wrapper.querySelector('[data-error-for="' + field.id + '"]');
    wrapper.classList.toggle('invalid', Boolean(message));
    if (slot) slot.textContent = message || '';
  }

  function validate() {
    var ok = true;
    ['name', 'email', 'message'].forEach(function (id) {
      var field = form.elements[id];
      var value = field.value.trim();
      var message = '';
      if (!value) {
        message = 'This field is required.';
      } else if (id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        message = 'Enter a valid email address.';
      }
      if (message) ok = false;
      setError(field, message);
    });
    return ok;
  }

  if (form) {
    ['name', 'email', 'message'].forEach(function (id) {
      form.elements[id].addEventListener('input', function () {
        if (form.elements[id].closest('.field').classList.contains('invalid')) validate();
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      note.classList.remove('ok');
      if (!validate()) {
        note.textContent = 'Please fix the highlighted fields.';
        return;
      }

      var data = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        topic: form.elements.topic.value,
        message: form.elements.message.value.trim()
      };

      var action = form.getAttribute('action');
      if (action) {
        note.textContent = 'Sending…';
        fetch(action, {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          form.reset();
          note.textContent = 'Thanks — we’ll be in touch within a day.';
          note.classList.add('ok');
        }).catch(function () {
          note.textContent = 'Something went wrong. Email us directly at ' + (form.dataset.mailto || '') + '.';
        });
        return;
      }

      // No endpoint configured yet — hand off to the visitor's email client.
      var to = form.dataset.mailto || '';
      var subject = 'JITT Athletics enquiry — ' + data.topic;
      var body = 'Name: ' + data.name + '\nEmail: ' + data.email + '\nInterested in: ' + data.topic + '\n\n' + data.message;
      window.location.href = 'mailto:' + to +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
      note.textContent = 'Opening your email app… if nothing happens, write to ' + to + '.';
      note.classList.add('ok');
    });
  }
})();
