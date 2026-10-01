/* =========================================================
   HADES GYM — interacciones
   Sin dependencias. Todo degrada con gracia si algo falla.
   ========================================================= */
(function () {
  'use strict';

  var WHATSAPP = '523312345678';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Año del footer ---------- */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header sticky ---------- */
  var header = $('#siteHeader');
  var mobar = $('#mobar');
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle('is-stuck', y > 24);
    if (mobar) mobar.classList.toggle('is-visible', y > 420);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menú móvil ---------- */
  var burger = $('#burger');
  var nav = $('#nav');
  var scrim = $('#navScrim');

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Abrir menú');
    document.body.classList.remove('is-locked');
    if (scrim) scrim.hidden = true;
  }
  function openNav() {
    nav.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Cerrar menú');
    document.body.classList.add('is-locked');
    if (scrim) scrim.hidden = false;
  }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      nav.classList.contains('is-open') ? closeNav() : openNav();
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', closeNav); });
    if (scrim) scrim.addEventListener('click', closeNav);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { closeNav(); burger.focus(); }
    });
    // Si el ancho pasa a escritorio con el menú abierto, el velo se quedaría puesto.
    window.matchMedia('(min-width: 861px)').addEventListener('change', function (e) {
      if (e.matches) closeNav();
    });
  }

  /* ---------- Reveal al hacer scroll ---------- */
  var revealables = $$('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealIO.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealables.forEach(function (el) { revealIO.observe(el); });
  }

  /* ---------- Contadores ---------- */
  var counters = $$('[data-count]');
  function runCounter(el) {
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduced) { el.textContent = prefix + target.toLocaleString('es-MX') + suffix; return; }
    var start = performance.now();
    var dur = 1400;
    function step(now) {
      var p = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased).toLocaleString('es-MX') + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var countIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCounter(entry.target); countIO.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { countIO.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Scrollspy ---------- */
  var links = $$('.nav__link');
  var sections = links
    .map(function (l) { return document.getElementById(l.getAttribute('href').slice(1)); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spyIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) {
          l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spyIO.observe(s); });
  }

  /* ---------- Filtro de clases ---------- */
  var chips = $$('.chip');
  var classCards = $$('.class');
  var emptyMsg = $('#classEmpty');

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var day = chip.getAttribute('data-day');
      chips.forEach(function (c) {
        c.classList.remove('is-active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('is-active');
      chip.setAttribute('aria-pressed', 'true');

      var shown = 0;
      classCards.forEach(function (card) {
        var days = (card.getAttribute('data-days') || '').split(' ');
        var match = day === 'all' || days.indexOf(day) !== -1;
        card.classList.toggle('is-hidden', !match);
        if (match) shown++;
      });
      if (emptyMsg) emptyMsg.hidden = shown !== 0;
    });
  });

  /* ---------- Horario: día actual y estado abierto/cerrado ---------- */
  var SCHEDULE = {
    1: [5, 23], 2: [5, 23], 3: [5, 23], 4: [5, 23], 5: [5, 23],
    6: [7, 20], 0: [8, 16]
  };
  var DAY_KEY = { 0: 'dom', 1: 'lun', 2: 'mar', 3: 'mie', 4: 'jue', 5: 'vie', 6: 'sab' };

  var now = new Date();
  var todayKey = DAY_KEY[now.getDay()];
  var todayRow = $('.htable tr[data-day="' + todayKey + '"]');
  if (todayRow) todayRow.classList.add('is-today');

  var status = $('#openStatus');
  if (status) {
    var range = SCHEDULE[now.getDay()];
    var hourNow = now.getHours() + now.getMinutes() / 60;
    var isOpen = hourNow >= range[0] && hourNow < range[1];
    status.classList.add(isOpen ? 'is-open' : 'is-closed');
    status.textContent = isOpen
      ? 'Abierto ahora · cerramos a las ' + range[1] + ':00'
      : 'Cerrado ahora · hoy el horario es de ' + range[0] + ':00 a ' + range[1] + ':00';
  }

  /* ---------- Lightbox de galería ---------- */
  var lb = $('#lightbox');
  var lbImg = $('#lbImg');
  var gals = $$('.gal');
  var current = 0;
  var lastFocus = null;

  function showAt(i) {
    current = (i + gals.length) % gals.length;
    var btn = gals[current];
    lbImg.src = btn.getAttribute('data-full');
    lbImg.alt = ($('img', btn) || {}).alt || '';
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    showAt(i);
    lb.hidden = false;
    document.body.classList.add('is-locked');
    $('#lbClose').focus();
  }
  function closeLb() {
    lb.hidden = true;
    lbImg.removeAttribute('src');
    document.body.classList.remove('is-locked');
    if (lastFocus) lastFocus.focus();
  }

  if (lb && lbImg && gals.length) {
    gals.forEach(function (btn, i) {
      btn.addEventListener('click', function () { openLb(i); });
    });
    $('#lbClose').addEventListener('click', closeLb);
    $('#lbPrev').addEventListener('click', function () { showAt(current - 1); });
    $('#lbNext').addEventListener('click', function () { showAt(current + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') showAt(current - 1);
      if (e.key === 'ArrowRight') showAt(current + 1);
    });
  }

  /* ---------- Botones de plan: prellenan el formulario ---------- */
  var msgField = $('#f-msg');
  $$('[data-plan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!msgField) return;
      msgField.value = 'Me interesa el plan ' + btn.getAttribute('data-plan') + '. Quiero agendar una visita.';
      setTimeout(function () { msgField.focus({ preventScroll: true }); }, 700);
    });
  });

  /* ---------- Formulario de contacto ---------- */
  var form = $('#contactForm');
  if (form) {
    var okBox = $('#formOk');

    var rules = {
      nombre: function (v) {
        if (!v.trim()) return 'Escribe tu nombre.';
        if (v.trim().length < 3) return 'El nombre es demasiado corto.';
        return '';
      },
      telefono: function (v) {
        var digits = v.replace(/\D/g, '');
        if (!digits) return 'Necesitamos un teléfono para contactarte.';
        if (digits.length < 10) return 'Incluye los 10 dígitos.';
        return '';
      },
      correo: function (v) {
        if (!v.trim()) return 'Escribe tu correo.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Ese correo no parece válido.';
        return '';
      }
    };

    function validateField(name) {
      var input = form.elements[name];
      var err = rules[name](input.value);
      var wrap = input.closest('.field');
      var slot = $('[data-err="' + name + '"]', form);
      wrap.classList.toggle('has-error', !!err);
      input.setAttribute('aria-invalid', err ? 'true' : 'false');
      if (slot) slot.textContent = err;
      return !err;
    }

    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      input.addEventListener('blur', function () { validateField(name); });
      input.addEventListener('input', function () {
        if (input.closest('.field').classList.contains('has-error')) validateField(name);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      var firstBad = null;
      Object.keys(rules).forEach(function (name) {
        var ok = validateField(name);
        if (!ok && !firstBad) firstBad = form.elements[name];
        valid = valid && ok;
      });
      if (!valid) { if (firstBad) firstBad.focus(); return; }

      var text =
        'Hola, quiero información de HADES GYM.\n' +
        'Nombre: ' + form.elements.nombre.value.trim() + '\n' +
        'Teléfono: ' + form.elements.telefono.value.trim() + '\n' +
        'Correo: ' + form.elements.correo.value.trim() +
        (form.elements.mensaje.value.trim() ? '\nMensaje: ' + form.elements.mensaje.value.trim() : '');

      window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text), '_blank', 'noopener');

      if (okBox) okBox.hidden = false;
      form.reset();
    });
  }
})();
