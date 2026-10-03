/* ==========================================================================
   Sub-page renderers: service detail, doctor profile, about, contact, portal
   ========================================================================== */
(function () {
  "use strict";
  const { CLINIC, SERVICES, DOCTORS, TESTIMONIALS, CASES, IMAGES } = window.SITE;
  const {
    $, $$, esc, money, fromPrice, icon, stars, bookUrl, params, findService, findDoctor, refreshIcons,
    renderAccordion, initCompare, BookingAPI, Store, ymd, parseYmd, fmtTime, fmtDate, relDay, initReveal, trapFocus,
  } = window.App;

  const setMeta = (title, desc) => {
    document.title = title;
    const m = $('meta[name="description"]');
    if (m && desc) m.setAttribute("content", desc);
    const og = $('meta[property="og:title"]');
    if (og) og.setAttribute("content", title);
  };
  const notFound = (host, what, back) => {
    host.innerHTML = `<section class="section"><div class="container center"><div class="empty-state card">
      <span class="icon-tile">${icon("search-x")}</span><h1 class="h3">We couldn't find that ${what}</h1>
      <p>It may have moved. Try one of these instead.</p><a class="btn btn--primary" href="${back}">Go back</a></div></div></section>`;
  };
  const ctaBanner = (title = "Your best smile starts with <span class=\"serif\">one visit.</span>", params) => `
    <section class="section"><div class="container"><div class="cta-banner" data-reveal>
      <div class="orb orb--blue" aria-hidden="true"></div><div class="orb orb--mint" aria-hidden="true"></div>
      <h2 class="h2">${title}</h2>
      <p class="lead">Book online in under a minute. Free cancellation up to 24 hours before.</p>
      <div class="cta-banner__actions">${UI.contactButtons({ lg: true }).replace('href="book.html"', `href="${bookUrl(params)}"`)}</div>
    </div></div></section>`;

  /* ------------------------------------------------------- Service detail */
  function servicePage() {
    const host = $("#page");
    const s = findService(params.get("s"));
    if (!s || !s.steps) return notFound(host, "treatment", "index.html#services");
    setMeta(`${s.name} · MA Dental Care, Mukkam`, `${s.lead} ${fromPrice(s.price, false)}. Book online at MA Dental Care.`);
    const docs = DOCTORS.filter((d) => d.services.includes(s.id));
    const others = SERVICES.filter((x) => x.id !== s.id).slice(0, 4);
    const cs = CASES.find((c) => s.name.includes(c.label.split(" ")[0])) || CASES[0];

    host.innerHTML = `
      <section class="page-hero">
        <div class="orb orb--blue" aria-hidden="true"></div><div class="orb orb--mint" aria-hidden="true"></div>
        <div class="container page-hero__grid">
          <div>
            <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>${icon("chevron-right")}<a href="index.html#services">Treatments</a>${icon("chevron-right")}<span aria-current="page">${esc(s.name)}</span></nav>
            <span class="eyebrow">${esc(s.name)}</span>
            <h1 class="h1" style="font-size:clamp(2.25rem,4.6vw,3.5rem)">${esc(s.lead)}</h1>
            <div class="facts">
              <span class="badge">${icon("clock")} ${s.duration} min visit</span>
              <span class="badge badge--blue">${icon("tag")} ${fromPrice(s.price, false)}${s.priceLabel ? ` ${esc(s.priceLabel.toLowerCase())}` : ""}</span>
              <span class="badge badge--mint">${icon("heart-handshake")} Comfort-first care</span>
            </div>
            <div class="hero__ctas">
              <a class="btn btn--primary btn--lg" href="${bookUrl({ service: s.id })}">Book ${esc(s.name.split(" /")[0])} ${icon("arrow-right")}</a>
              <a class="btn btn--secondary btn--lg" href="#process">How it works</a>
            </div>
          </div>
          <div class="frame"><img src="${s.image}" alt="${esc(s.name)} at MA Dental Care" width="900" height="700"></div>
        </div>
      </section>

      <section class="section section--tight">
        <div class="container two-col">
          <div>
            <span class="eyebrow" data-reveal>What it involves</span>
            <h2 class="h2" data-reveal style="font-size:clamp(1.75rem,3vw,2.25rem)">Simple, clear and <em class="serif">comfortable.</em></h2>
            <div class="prose mt-24" data-reveal><p>${esc(s.involves)}</p></div>
            <div class="benefits mt-48" style="grid-template-columns:repeat(2,1fr)">
              ${s.benefits.map(([ic, t, d], i) => `<div class="card benefit" data-reveal style="--d:${i}"><span class="icon-tile">${icon(ic)}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join("")}
            </div>
          </div>
          <aside class="sticky-card">
            <div class="card price-panel" data-reveal>
              <div><span class="from">${s.price == null ? "Pricing" : "Starting from"}</span><div class="amt"${s.price == null ? ' style="font-size:28px"' : ""}>${money(s.price)}</div>${s.priceLabel ? `<span class="from">${esc(s.priceLabel)}</span>` : ""}</div>
              <div class="meta">
                <div><span>Visit length</span><b>${s.duration} min</b></div>
                <div><span>Estimate</span><b>Before treatment</b></div>
                <div><span>Clinics</span><b>Mukkam &amp; Mavoor</b></div>
              </div>
              <a class="btn btn--primary btn--block btn--lg" href="${bookUrl({ service: s.id })}">Book this treatment</a>
              <p class="center" style="font-size:13px">Final cost confirmed after your exam. No surprises.</p>
            </div>
          </aside>
        </div>
      </section>

      <section class="section section--white" id="process">
        <div class="container">
          <div class="section-head"><span class="eyebrow" data-reveal>The process</span><h2 class="h2" data-reveal>Step by <em class="serif">step.</em></h2></div>
          <ol class="timeline" style="padding:0;list-style:none">
            ${s.steps.map(([t, d], i) => `<li class="timeline__item" data-reveal style="--d:${i}"><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join("")}
          </ol>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head section-head--center"><span class="eyebrow" data-reveal>Results</span><h2 class="h2" data-reveal>See the <em class="serif">difference.</em></h2><p class="lead" data-reveal>Drag the slider. Images illustrative, results vary.</p></div>
          <div class="compare" id="compare" style="max-width:880px;margin-inline:auto" data-reveal>
            <img src="${cs.image}" alt="After ${esc(s.name)}" style="object-position:${cs.pos}">
            <img class="compare__before" src="${cs.image}" alt="" style="object-position:${cs.pos}">
            <span class="compare__label compare__label--b">Before</span><span class="compare__label compare__label--a">After</span>
            <div class="compare__handle" aria-hidden="true"><span class="compare__knob">${icon("chevrons-left-right")}</span></div>
            <input type="range" min="0" max="100" value="50" aria-label="Before and after comparison">
          </div>
        </div>
      </section>

      ${docs.length ? `
      <section class="section section--white">
        <div class="container">
          <div class="section-head"><span class="eyebrow" data-reveal>Your dentists</span><h2 class="h2" data-reveal>Who'll <em class="serif">look after you.</em></h2></div>
          <div class="doctors-grid">${docs.map(UI.doctorCard).join("")}</div>
        </div>
      </section>` : ""}

      <section class="section">
        <div class="container faq-layout">
          <div><span class="eyebrow" data-reveal>FAQ</span><h2 class="h2" data-reveal>Good to <em class="serif">know.</em></h2></div>
          <div id="svc-faq" data-reveal></div>
        </div>
      </section>

      <section class="section section--wash section--tight">
        <div class="container">
          <div class="section-head section-head--row"><div><h2 class="h2" style="font-size:clamp(1.75rem,3vw,2.25rem)">Other treatments</h2></div><a class="link" href="index.html#services">All treatments ${icon("arrow-right")}</a></div>
          <div class="services-grid">${others.map(UI.serviceCard).join("")}</div>
        </div>
      </section>
      ${ctaBanner(undefined, { service: s.id })}`;

    renderAccordion($("#svc-faq"), s.faqs);
    initCompare($("#compare"));
  }

  /* ------------------------------------------------------- Doctor profile */
  function doctorPage() {
    const host = $("#page");
    const d = findDoctor(params.get("d"));
    if (!d) return notFound(host, "doctor", "index.html#doctors");
    setMeta(`${d.name}, ${d.role} · MA Dental Care`, `${d.name}, ${d.role} at MA Dental Care, Mukkam. Book an appointment online.`);
    const reviews = TESTIMONIALS.filter((t) => t.doctor === d.id);
    const svcs = d.services.map(findService).filter(Boolean);

    // Next three available days.
    const days = [];
    const cur = new Date(); cur.setHours(0, 0, 0, 0);
    for (let i = 0; i < 30 && days.length < 3; i++) {
      const key = ymd(cur);
      if (BookingAPI.isDateAvailable(key, d.id)) days.push(key);
      cur.setDate(cur.getDate() + 1);
    }

    host.innerHTML = `
      <section class="page-hero">
        <div class="orb orb--blue" aria-hidden="true"></div><div class="orb orb--mint" aria-hidden="true"></div>
        <div class="container">
          <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>${icon("chevron-right")}<a href="index.html#doctors">Doctors</a>${icon("chevron-right")}<span aria-current="page">${esc(d.name)}</span></nav>
          <div class="profile-hero">
            <div class="frame"><img src="${d.photo}" alt="Portrait of ${esc(d.name)}" width="700" height="820"></div>
            <div>
              <span class="eyebrow">${esc(d.role)}</span>
              <h1 class="h1" style="font-size:clamp(2.25rem,4.6vw,3.5rem)">${esc(d.name)}</h1>
              <div class="facts">
                ${d.years ? `<span class="badge">${icon("award")} ${d.years} years experience</span>` : ""}
                ${d.languages.length ? `<span class="badge">${icon("languages")} ${d.languages.join(", ")}</span>` : ""}
                <span class="badge">${icon("map-pin")} MA Dental Care</span>
                ${reviews.length ? `<span class="badge">${stars(5)} ${reviews.length} patient ${reviews.length === 1 ? "story" : "stories"}</span>` : ""}
              </div>
              <p class="lead">${esc(d.bio)}</p>
              <div class="hero__ctas"><a class="btn btn--primary btn--lg" href="${bookUrl({ doctor: d.id })}">Book with ${esc(d.short || d.name.split(" ").slice(0, 2).join(" "))} ${icon("arrow-right")}</a></div>
            </div>
          </div>
        </div>
      </section>

      <section class="section section--tight">
        <div class="container two-col">
          <div style="display:grid;gap:16px">
            ${d.quals.length ? `<div class="card info-card" data-reveal>
              <h2 class="h3" style="margin-bottom:14px">Qualifications</h2>
              <ul class="list-check">${d.quals.map((q) => `<li>${icon("graduation-cap")}<span>${esc(q)}</span></li>`).join("")}</ul>
            </div>` : ""}
            <div class="card info-card" data-reveal>
              ${d.specialties.length ? `<h2 class="h3" style="margin-bottom:14px">Specialisations</h2>
              <div class="row-gap">${d.specialties.map((x) => `<span class="badge badge--blue">${esc(x)}</span>`).join("")}</div>
              <h3 class="h3 mt-24" style="font-size:16px;margin-bottom:12px">Treatments offered</h3>` : `<h2 class="h3" style="margin-bottom:14px">Treatments offered</h2>`}
              <div class="row-gap">${svcs.map((x) => `<a class="badge" href="service.html?s=${x.id}">${icon(x.icon)} ${esc(x.name)}</a>`).join("")}</div>
            </div>
            ${reviews.length ? `
            <div data-reveal>
              <h2 class="h3" style="margin:16px 0">What patients say</h2>
              <div style="display:grid;gap:16px">${reviews.map(UI.reviewCard).join("")}</div>
            </div>` : ""}
          </div>
          <aside class="sticky-card">
            <div class="card info-card" data-reveal>
              <h2 class="h3" style="margin-bottom:4px">Next available</h2>
              <p style="font-size:14px;margin-bottom:18px">Tap a time to start booking.</p>
              <div class="slot-preview" id="slot-preview">
                ${days.map((key) => `
                  <div class="slot-preview__day" data-day="${key}"><strong>${relDay(key)}</strong>
                    <div class="slot-preview__list" aria-busy="true"><div class="skeleton skeleton--slot" style="height:36px;width:100%"></div></div>
                  </div>`).join("") || `<p>No openings in the next 30 days. Please call us.</p>`}
              </div>
              <a class="btn btn--primary btn--block mt-24" href="${bookUrl({ doctor: d.id })}">See all times</a>
            </div>
          </aside>
        </div>
      </section>

      <section class="section section--white section--tight">
        <div class="container">
          <div class="section-head section-head--row"><div><h2 class="h2" style="font-size:clamp(1.75rem,3vw,2.25rem)">Meet the rest of <em class="serif">the team</em></h2></div></div>
          <div class="doctors-grid">${DOCTORS.filter((x) => x.id !== d.id).map(UI.doctorCard).join("")}</div>
        </div>
      </section>
      ${ctaBanner(undefined, { doctor: d.id })}`;

    // Load real slot lists (async, with skeletons).
    days.forEach(async (key) => {
      const s = await BookingAPI.getSlots(key, d.id);
      const box = $(`[data-day="${key}"] .slot-preview__list`);
      if (!box) return;
      const times = s ? Object.values(s).flat().slice(0, 6) : [];
      box.removeAttribute("aria-busy");
      box.innerHTML = times.map((t) => `<a class="slot slot--static" href="${bookUrl({ doctor: d.id, date: key, time: t })}" aria-label="${relDay(key)} at ${fmtTime(t)}">${fmtTime(t)}</a>`).join("") || "<span>Fully booked</span>";
    });
  }

  /* ---------------------------------------------------------------- About */
  function aboutPage() {
    $("#team-grid").innerHTML = DOCTORS.map(UI.doctorCard).join("");
  }

  /* -------------------------------------------------------------- Contact */
  function contactPage() {
    const form = $("#contact-form");
    const rules = {
      name: (v) => (v.trim().length < 2 ? "Please enter your name." : ""),
      phone: (v) => (/^\+?[\d\s-]{7,16}$/.test(v.trim()) ? "" : "Please enter a valid phone number."),
      email: (v) => (!v.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please check your email address."),
      message: (v) => (v.trim().length < 5 ? "Tell us a little more so we can help." : ""),
    };
    const check = (name) => {
      const el = form.elements[name];
      const msg = rules[name](el.value);
      const wrap = el.closest(".field");
      wrap.classList.toggle("is-invalid", !!msg);
      el.setAttribute("aria-invalid", msg ? "true" : "false");
      $(".field__error span", wrap).textContent = msg;
      return !msg;
    };
    Object.keys(rules).forEach((n) => {
      form.elements[n].addEventListener("blur", () => form.elements[n].value && check(n));
      form.elements[n].addEventListener("input", () => form.elements[n].closest(".field").classList.contains("is-invalid") && check(n));
    });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const bad = Object.keys(rules).filter((n) => !check(n));
      if (bad.length) { form.elements[bad[0]].focus(); return; }
      // TODO: POST to your backend / form service here.
      form.hidden = true;
      $("#contact-success").hidden = false;
      $("#contact-success").focus();
    });
  }

  /* --------------------------------------------------------------- Portal */
  function portalPage() {
    const host = $("#portal-list");
    const dialog = $("#cancel-dialog");
    let tab = "upcoming";
    const today = ymd(new Date());
    const isPast = (b) => b.date < today;

    const card = (b) => {
      const s = findService(b.service), d = findDoctor(b.doctor);
      const dt = parseYmd(b.date);
      const status = b.status === "upcoming" && isPast(b) ? "completed" : b.status;
      const active = status === "upcoming";
      return `
        <article class="card appt${active ? "" : " is-muted"}" data-ref="${esc(b.ref)}">
          <div class="appt__date"><small>${dt.toLocaleDateString("en-IN", { month: "short" })}</small><b>${dt.getDate()}</b></div>
          <div>
            <div class="row-gap" style="gap:8px"><span class="appt__title">${esc(s ? s.name : b.service)}</span><span class="status status--${status}">${status}</span></div>
            <div class="appt__meta">
              <span>${icon("clock")} ${fmtDate(b.date)} · ${fmtTime(b.time)}</span>
              <span>${icon("user-round")} ${d ? esc(d.name) : "Any available"}</span>
              <span>${icon("hash")} ${esc(b.ref)}</span>
            </div>
          </div>
          <div class="appt__actions">
            ${active ? `
              <a class="btn btn--secondary btn--sm" href="book.html?reschedule=${encodeURIComponent(b.ref)}">${icon("calendar-clock")} Reschedule</a>
              <button class="btn btn--ghost btn--sm" type="button" data-cancel="${esc(b.ref)}">Cancel</button>`
            : isPast(b) && status === "completed" ? `<a class="btn btn--soft btn--sm" href="${bookUrl({ service: b.service, doctor: b.doctor })}">Book again</a>` : ""}
          </div>
        </article>`;
    };

    const render = () => {
      const all = Store.all();
      const list = all.filter((b) => (tab === "upcoming" ? b.status === "upcoming" && !isPast(b) : !(b.status === "upcoming" && !isPast(b))))
        .sort((a, b) => (tab === "upcoming" ? 1 : -1) * (a.date + a.time).localeCompare(b.date + b.time));
      $$(".tabs button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === tab)));
      host.innerHTML = list.length ? list.map(card).join("") : `
        <div class="card empty-state">
          <span class="icon-tile">${icon(tab === "upcoming" ? "calendar-plus" : "history")}</span>
          <h2 class="h3">${tab === "upcoming" ? "No upcoming appointments" : "No past visits yet"}</h2>
          <p>${tab === "upcoming" ? "Book your next visit in under a minute." : "Your completed and cancelled visits will appear here."}</p>
          ${tab === "upcoming" ? `<a class="btn btn--primary" href="book.html">Book Appointment</a>` : ""}
        </div>`;
      refreshIcons();
    };

    $(".tabs").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { tab = b.dataset.tab; render(); } });

    let pending = null;
    const openCancel = (ref) => {
      const b = Store.all().find((x) => x.ref === ref);
      if (!b || b.status !== "upcoming") return;
      pending = ref;
      $("#cancel-text").textContent = `${findService(b.service)?.name || "Appointment"} on ${fmtDate(b.date, { weekday: "long", day: "numeric", month: "long" })} at ${fmtTime(b.time)} (${b.ref}).`;
      dialog.showModal();
    };
    host.addEventListener("click", (e) => { const b = e.target.closest("[data-cancel]"); if (b) openCancel(b.dataset.cancel); });
    $("#cancel-keep").addEventListener("click", () => dialog.close());
    $("#cancel-confirm").addEventListener("click", () => {
      Store.update(pending, { status: "cancelled" });
      dialog.close();
      tab = "upcoming";
      render();
      $("#portal-status").textContent = `Booking ${pending} cancelled. Your slot has been released.`;
      $("#portal-status").hidden = false;
    });

    render();
    if (params.get("action") === "cancel" && params.get("ref")) openCancel(params.get("ref"));
  }

  document.addEventListener("app:ready", () => {
    const page = document.body.dataset.page;
    ({ service: servicePage, doctor: doctorPage, about: aboutPage, contact: contactPage, portal: portalPage }[page] || (() => {}))();
  });
})();
