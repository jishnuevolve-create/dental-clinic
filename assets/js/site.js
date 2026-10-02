/* ==========================================================================
   Shared site behaviour: layout (header/footer), utilities, availability,
   scroll reveal, accordions, before/after slider.
   ========================================================================== */
(function () {
  "use strict";
  const { CLINIC, SERVICES, CONSULT, DOCTORS } = window.SITE;

  /* ------------------------------------------------------------- Utilities */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => CLINIC.currency + Number(n).toLocaleString("en-IN");
  const icon = (name, cls = "") => `<i data-lucide="${name}"${cls ? ` class="${cls}"` : ""} aria-hidden="true"></i>`;
  const stars = (n = 5) => `<span class="stars" role="img" aria-label="${n} out of 5 stars">${"★".repeat(n)}</span>`;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const findService = (id) => SERVICES.find((s) => s.id === id) || (id === CONSULT.id ? CONSULT : null);
  const findDoctor = (id) => DOCTORS.find((d) => d.id === id) || null;
  const bookUrl = (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return "book.html" + (q ? `?${q}` : "");
  };
  const refreshIcons = () => window.lucide && window.lucide.createIcons({ attrs: { "stroke-width": 1.75 } });
  const params = new URLSearchParams(location.search);

  // Brand marks removed from Lucide 1.x, inlined here.
  const BRAND = {
    whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1s-.5-.1-.7.1-.8 1-.9 1.2-.3.2-.6.1a8.2 8.2 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6a1.1 1.1 0 0 0-.8.4 3.4 3.4 0 0 0-1 2.5 6 6 0 0 0 1.2 3.1 13.4 13.4 0 0 0 5.2 4.6c1.9.8 2.7.9 3.6.7a3.1 3.1 0 0 0 2-1.4 2.5 2.5 0 0 0 .2-1.4c-.1-.2-.3-.3-.6-.4zM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm8.4-18.2A11.8 11.8 0 0 0 1.8 17.8L.1 24l6.4-1.7a11.8 11.8 0 0 0 5.6 1.4A11.8 11.8 0 0 0 20.4 3.6z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
  };

  const LOGO = `
    <span class="logo__mark" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none"><defs><linearGradient id="lg" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#3B82F6"/><stop offset="1" stop-color="#2DD4BF"/></linearGradient></defs>
      <rect width="32" height="32" rx="10" fill="url(#lg)"/>
      <path d="M11.2 9.5c1.6 0 2.7.8 4.8.8s3.2-.8 4.8-.8c2.4 0 3.7 2 3.7 4.4 0 2.2-.8 3.6-1.4 5.6-.6 2.1-.9 4.5-2.4 4.5-1.7 0-1.6-4.3-4.7-4.3s-3 4.3-4.7 4.3c-1.5 0-1.8-2.4-2.4-4.5-.6-2-1.4-3.4-1.4-5.6 0-2.4 1.3-4.4 3.7-4.4z" fill="#fff"/></svg>
    </span>
    <span class="logo__text">${esc(CLINIC.name)}<span class="logo__sub">Dental Studio</span></span>`;

  /* ---------------------------------------------------------------- Header */
  const page = document.body.dataset.page || "";
  const onHome = page === "home";
  const navLinks = [
    ["Services", "#services"],
    ["Doctors", "#doctors"],
    ["Technology", "#technology"],
    ["Pricing", "#pricing"],
    ["Reviews", "#reviews"],
    ["Contact", "contact.html"],
  ].map(([label, href]) => [label, href.startsWith("#") && !onHome ? `index.html${href}` : href]);

  function renderHeader() {
    const host = $("#site-header");
    if (!host) return;
    host.className = "header";
    host.innerHTML = `
      <div class="container header__inner">
        <a href="index.html" class="logo" aria-label="${esc(CLINIC.fullName)} home">${LOGO}</a>
        <nav class="nav" aria-label="Primary">
          <ul class="nav__list">
            ${navLinks.map(([l, h]) => `<li><a class="nav__link${page === l.toLowerCase() ? " is-active" : ""}" href="${h}">${l}</a></li>`).join("")}
          </ul>
        </nav>
        <div class="header__actions">
          <a class="header__phone" href="${CLINIC.phoneHref}">${icon("phone")}<span>${esc(CLINIC.phone)}</span></a>
          ${page === "book" ? "" : `<a class="btn btn--primary btn--sm header__cta" href="${bookUrl()}">Book Appointment</a>`}
          <button class="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-sheet">${icon("menu")}</button>
        </div>
      </div>`;

    const sheet = document.createElement("div");
    sheet.className = "sheet";
    sheet.id = "mobile-sheet";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-label", "Menu");
    sheet.hidden = true;
    sheet.innerHTML = `
      <div class="sheet__top container">
        <a href="index.html" class="logo">${LOGO}</a>
        <button class="menu-toggle is-close" type="button" aria-label="Close menu">${icon("x")}</button>
      </div>
      <nav class="sheet__nav container" aria-label="Mobile">
        ${navLinks.map(([l, h], i) => `<a href="${h}" style="--i:${i}">${l}${icon("arrow-up-right")}</a>`).join("")}
        <a href="about.html" style="--i:6">About${icon("arrow-up-right")}</a>
        <a href="portal.html" style="--i:7">My appointments${icon("arrow-up-right")}</a>
      </nav>
      <div class="sheet__bottom container">
        <div class="sheet__contact">
          <a class="btn btn--soft" href="${CLINIC.phoneHref}">${icon("phone")} Call</a>
          <a class="btn btn--soft" href="${CLINIC.whatsapp}" target="_blank" rel="noopener">${BRAND.whatsapp} WhatsApp</a>
        </div>
        <a class="btn btn--primary btn--lg btn--block" href="${bookUrl()}">Book Appointment ${icon("arrow-right")}</a>
        <p class="sheet__note">${icon("clock")} Takes less than 60 seconds</p>
      </div>`;
    document.body.appendChild(sheet);

    const openBtn = $(".menu-toggle", host);
    const closeBtn = $(".menu-toggle.is-close", sheet);
    const open = () => {
      sheet.hidden = false;
      requestAnimationFrame(() => sheet.classList.add("is-open"));
      document.documentElement.classList.add("no-scroll");
      openBtn.setAttribute("aria-expanded", "true");
      closeBtn.focus();
    };
    const close = () => {
      sheet.classList.remove("is-open");
      document.documentElement.classList.remove("no-scroll");
      openBtn.setAttribute("aria-expanded", "false");
      setTimeout(() => (sheet.hidden = true), reducedMotion ? 0 : 250);
      openBtn.focus();
    };
    openBtn.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    sheet.addEventListener("click", (e) => e.target.closest(".sheet__nav a") && close());
    sheet.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") trapFocus(e, sheet);
    });

    const onScroll = () => host.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function trapFocus(e, root) {
    const f = $$('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', root).filter((el) => el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------------------------------------------------------------- Footer */
  function renderFooter() {
    const host = $("#site-footer");
    if (!host) return;
    host.className = "footer";
    const year = new Date().getFullYear();
    host.innerHTML = `
      <div class="container">
        <div class="footer__grid">
          <div class="footer__brand">
            <a href="index.html" class="logo">${LOGO}</a>
            <p>Premium, patient-first dentistry. Cosmetic, restorative and general care with advanced technology and a calm, spa-like experience.</p>
            <div class="socials">
              <a href="#" aria-label="Instagram">${BRAND.instagram}</a>
              <a href="#" aria-label="Facebook">${BRAND.facebook}</a>
              <a href="#" aria-label="YouTube">${BRAND.youtube}</a>
              <a href="#" aria-label="LinkedIn">${BRAND.linkedin}</a>
            </div>
          </div>
          <div>
            <h3 class="footer__title">Clinic</h3>
            <ul class="footer__links">
              <li><a href="about.html">About us</a></li>
              <li><a href="${onHome ? "" : "index.html"}#doctors">Our doctors</a></li>
              <li><a href="${onHome ? "" : "index.html"}#pricing">Pricing</a></li>
              <li><a href="${onHome ? "" : "index.html"}#reviews">Reviews</a></li>
              <li><a href="contact.html">Contact</a></li>
              <li><a href="portal.html">My appointments</a></li>
            </ul>
          </div>
          <div>
            <h3 class="footer__title">Services</h3>
            <ul class="footer__links">
              ${SERVICES.map((s) => `<li><a href="service.html?s=${s.id}">${esc(s.name)}</a></li>`).join("")}
            </ul>
          </div>
          <div class="footer__visit">
            <h3 class="footer__title">Visit us</h3>
            <address>
              <a href="${CLINIC.directions}" target="_blank" rel="noopener">${icon("map-pin")}<span>${esc(CLINIC.address.line1)}<br>${esc(CLINIC.address.line2)}</span></a>
              <a href="${CLINIC.phoneHref}">${icon("phone")}<span>${esc(CLINIC.phone)}</span></a>
              <a href="mailto:${CLINIC.email}">${icon("mail")}<span>${esc(CLINIC.email)}</span></a>
              <a href="${CLINIC.whatsapp}" target="_blank" rel="noopener">${BRAND.whatsapp}<span>Chat on WhatsApp</span></a>
            </address>
            <ul class="hours">
              ${CLINIC.hours.map((h) => `<li><span>${h.days}</span><span>${h.time}</span></li>`).join("")}
            </ul>
          </div>
        </div>
        <div class="footer__map">
          <iframe title="Map showing ${esc(CLINIC.fullName)} location" src="${CLINIC.mapEmbed}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>
        <div class="footer__wordmark" aria-hidden="true">${esc(CLINIC.name)}</div>
        <div class="footer__bottom">
          <p>© ${year} ${esc(CLINIC.fullName)}. All rights reserved.</p>
          <p><a href="legal.html#privacy">Privacy Policy</a><a href="legal.html#terms">Terms of Service</a></p>
        </div>
      </div>`;
  }

  /* --------------------------------------------------- Floating mobile CTA */
  function renderFloatingCta() {
    if (page === "book") return;
    const a = document.createElement("a");
    a.className = "fab";
    a.href = bookUrl();
    a.innerHTML = `${icon("calendar-check")} Book Now`;
    document.body.appendChild(a);
    const toggle = () => a.classList.toggle("is-visible", window.scrollY > 420);
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });
  }

  /* ---------------------------------------------------------- Reveal on scroll */
  function initReveal(root = document) {
    const els = $$("[data-reveal]:not(.is-visible)", root);
    if (reducedMotion || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    els.forEach((el) => io.observe(el));
  }

  /* --------------------------------------------- Scroll progress & parallax */
  function initScrollFx() {
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    const hero = $(".hero__visual");
    let ticking = false;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty("--p", max > 0 ? (window.scrollY / max).toFixed(4) : 0);
      if (hero && !reducedMotion && window.scrollY < 1200) hero.style.setProperty("--parallax", `${(window.scrollY * 0.06).toFixed(1)}px`);
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ------------------------------------------------------ Count-up numbers
     <span data-count="18000" data-suffix="+">18,000+</span>  (text is the no-JS fallback) */
  function initCounters(root = document) {
    const els = $$("[data-count]", root);
    if (!els.length) return;
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = (el.dataset.count.split(".")[1] || "").length;
      const suffix = el.dataset.suffix || "";
      const fmt = (v) => (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-IN")) + suffix;
      if (reducedMotion) { el.textContent = fmt(target); return; }
      const start = performance.now(), dur = 1600;
      const step = (now) => {
        const t = Math.min(1, (now - start) / dur);
        el.textContent = fmt(target * (1 - Math.pow(1 - t, 4)));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
    }), { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------- Cursor spotlight on cards */
  function initSpotlight() {
    if (!window.matchMedia("(hover: hover)").matches) return;
    document.addEventListener("pointermove", (e) => {
      const el = e.target.closest && e.target.closest(".card--hover, .bento__card, .price-card");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }, { passive: true });
  }

  /* ------------------------------------------------------------- Accordion */
  function renderAccordion(host, items) {
    host.classList.add("accordion");
    host.innerHTML = items.map(([q, a], i) => `
      <div class="acc-item">
        <h3 class="acc-item__h">
          <button type="button" class="acc-item__btn" aria-expanded="false" aria-controls="${host.id}-p${i}" id="${host.id}-b${i}">
            <span>${esc(q)}</span><span class="acc-item__icon" aria-hidden="true"></span>
          </button>
        </h3>
        <div class="acc-item__panel" id="${host.id}-p${i}" role="region" aria-labelledby="${host.id}-b${i}">
          <div><p>${esc(a)}</p></div>
        </div>
      </div>`).join("");
    host.addEventListener("click", (e) => {
      const btn = e.target.closest(".acc-item__btn");
      if (!btn) return;
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      btn.closest(".acc-item").classList.toggle("is-open", !open);
    });
  }

  /* ------------------------------------------------- Before / after slider */
  function initCompare(el) {
    const range = $("input[type=range]", el);
    const set = (v) => el.style.setProperty("--pos", v + "%");
    range.addEventListener("input", () => set(range.value));
    set(range.value);
  }

  /* -------------------------------------------------------- Availability
     Deterministic mock. Replace BookingAPI methods with real API calls
     (same signatures, returning Promises) to connect a backend/calendar. */
  const SLOT_GROUPS = {
    Morning: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
    Afternoon: ["12:30", "13:00", "14:00", "14:30", "15:00", "15:30", "16:00"],
    Evening: ["17:00", "17:30", "18:00", "18:30", "19:00", "19:30"],
  };
  const hash = (str) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0) / 4294967295;
  };
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const parseYmd = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };

  function slotsFor(dateStr, doctorId = "any") {
    const date = parseYmd(dateStr);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const dow = date.getDay();
    if (date < today || dow === 0) return null; // Sunday closed (emergencies by phone)
    if (hash(dateStr + "closed" + doctorId) < 0.1) return null; // doctor away
    const now = new Date();
    const out = {};
    for (const [group, times] of Object.entries(SLOT_GROUPS)) {
      out[group] = times
        .filter((t) => !(dow === 6 && t >= "17:00")) // Saturday closes 5pm
        .filter((t) => {
          if (ymd(date) !== ymd(now)) return true;
          const [h, m] = t.split(":").map(Number);
          return h * 60 + m > now.getHours() * 60 + now.getMinutes() + 60; // 1h lead time
        })
        .filter((t) => hash(dateStr + t + doctorId) > 0.38);
    }
    return Object.values(out).some((a) => a.length) ? out : null;
  }

  const BookingAPI = {
    async getSlots(dateStr, doctorId) {
      await new Promise((r) => setTimeout(r, reducedMotion ? 150 : 450)); // simulate network
      return slotsFor(dateStr, doctorId);
    },
    isDateAvailable: (dateStr, doctorId) => !!slotsFor(dateStr, doctorId),
    earliest(doctorId, from = new Date()) {
      const d = new Date(from); d.setHours(0, 0, 0, 0);
      for (let i = 0; i < 60; i++) {
        const s = slotsFor(ymd(d), doctorId);
        if (s) for (const g of Object.keys(SLOT_GROUPS)) if (s[g].length) return { date: ymd(d), time: s[g][0] };
        d.setDate(d.getDate() + 1);
      }
      return null;
    },
    async createBooking(payload) {
      await new Promise((r) => setTimeout(r, reducedMotion ? 200 : 900));
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let ref = CLINIC.bookingRefPrefix + "-";
      for (let i = 0; i < 6; i++) ref += chars[Math.floor(Math.random() * chars.length)];
      const booking = { ...payload, ref, status: "upcoming", createdAt: new Date().toISOString() };
      const all = Store.all();
      if (payload.replaces) {
        const old = all.find((b) => b.ref === payload.replaces);
        if (old) old.status = "rescheduled";
      }
      all.unshift(booking);
      Store.save(all);
      return booking;
    },
  };

  // Local persistence for the demo patient portal.
  const Store = {
    key: "aurea.bookings",
    all() { try { return JSON.parse(localStorage.getItem(this.key)) || []; } catch { return []; } },
    save(list) { try { localStorage.setItem(this.key, JSON.stringify(list)); } catch { /* storage unavailable */ } },
    update(ref, patch) { const all = this.all(); const b = all.find((x) => x.ref === ref); if (b) Object.assign(b, patch); this.save(all); return b; },
  };

  const fmtTime = (t) => {
    const [h, m] = t.split(":").map(Number);
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
  };
  const fmtDate = (s, opts = { weekday: "short", day: "numeric", month: "short" }) => parseYmd(s).toLocaleDateString("en-IN", opts);
  const relDay = (s) => {
    const t = new Date(); t.setHours(0, 0, 0, 0);
    const diff = Math.round((parseYmd(s) - t) / 864e5);
    return diff === 0 ? "Today" : diff === 1 ? "Tomorrow" : fmtDate(s);
  };

  /* -------------------------------------------------------------- Boot */
  window.App = {
    $, $$, esc, money, icon, stars, BRAND, bookUrl, findService, findDoctor, params, refreshIcons,
    initReveal, renderAccordion, initCompare, BookingAPI, Store, SLOT_GROUPS, ymd, parseYmd, fmtTime, fmtDate, relDay, reducedMotion, trapFocus,
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderFooter();
    renderFloatingCta();
    document.dispatchEvent(new Event("app:ready"));
    refreshIcons();
    initReveal();
    initScrollFx();
    initCounters();
    initSpotlight();
  });
})();
