/* ==========================================================================
   Booking flow
   Steps: Service → Doctor → Date & time → Details → Review → Confirmation
   State persists in sessionStorage so data survives Back, refresh and
   navigation. BookingAPI (site.js) is the single integration point for a
   real backend / calendar system.
   ========================================================================== */
(function () {
  "use strict";
  const { CLINIC, SERVICES, CONSULT, DOCTORS } = window.SITE;
  const {
    $, $$, esc, money, fromPrice, icon, BRAND, params, findService, findDoctor, refreshIcons,
    BookingAPI, Store, ymd, parseYmd, fmtTime, fmtDate, relDay, reducedMotion,
  } = window.App;

  const STEPS = ["Service", "Doctor", "Date & time", "Your details", "Confirm"];
  const DRAFT_KEY = "madental.draft";
  const COUNTRY_CODES = [["+91", "IN +91"], ["+971", "AE +971"], ["+1", "US +1"], ["+44", "UK +44"], ["+65", "SG +65"], ["+61", "AU +61"]];
  const GROUP_ICONS = { Morning: "sunrise", Afternoon: "sun", Evening: "sunset" };

  const blank = () => ({
    step: 0, service: null, doctor: null, date: null, time: null, replaces: null,
    patient: { name: "", cc: "+91", phone: "", email: "", age: "", type: "new", notes: "" },
  });

  let state = loadDraft() || blank();
  let viewMonth = null; // Date (1st of month) shown in calendar
  let confirmed = null; // booking after confirmation
  const touched = new Set();

  /* ---------------------------------------------------------- Persistence */
  function loadDraft() {
    try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY)); } catch { return null; }
  }
  function saveDraft() {
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }
  function clearDraft() {
    try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
  }

  /* --------------------------------------------------- Entry-point params */
  function applyParams() {
    const svc = params.get("service");
    const doc = params.get("doctor");
    const resch = params.get("reschedule");

    if (resch) {
      const b = Store.all().find((x) => x.ref === resch);
      if (b) {
        state = blank();
        Object.assign(state, { service: b.service, doctor: b.doctor, patient: { ...b.patient }, replaces: b.ref, step: 2 });
        return;
      }
    }
    if (svc && findService(svc)) {
      if (state.service !== svc) { state.service = svc; }
      state.step = 1;
    }
    if (doc && (findDoctor(doc) || doc === "any")) {
      if (state.doctor !== doc) { state.doctor = doc; state.date = null; state.time = null; }
      if (!svc) state.step = 0;
      // Slot picked on a doctor profile.
      const date = params.get("date"), time = params.get("time");
      if (date && time && BookingAPI.isDateAvailable(date, doc)) { state.date = date; state.time = time; }
    }
    state.step = Math.min(state.step, maxReachableStep());
  }

  /* ----------------------------------------------------------- Validation */
  const validators = {
    name: (v) => (v.trim().length < 2 ? "Please enter your full name." : ""),
    phone: (v) => {
      const d = v.replace(/[\s()-]/g, "");
      if (!d) return "We need a phone number to confirm your visit.";
      return /^\d{7,12}$/.test(d) ? "" : "That number looks incomplete. Use digits only, without the country code.";
    },
    email: (v) => {
      if (!v.trim()) return "Please add an email for your confirmation.";
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please check your email address. Something looks off.";
    },
    age: (v) => {
      if (v === "" || v == null) return "Please enter the patient's age.";
      const n = Number(v);
      return Number.isInteger(n) && n >= 1 && n <= 120 ? "" : "Age should be a whole number between 1 and 120.";
    },
    notes: (v) => (v.length > 500 ? "Please keep this under 500 characters." : ""),
  };
  const detailsValid = () => Object.entries(validators).every(([k, fn]) => !fn(state.patient[k] ?? ""));

  function stepComplete(i) {
    switch (i) {
      case 0: return !!state.service;
      case 1: return !!state.doctor;
      case 2: return !!(state.date && state.time);
      case 3: return detailsValid();
      default: return false;
    }
  }
  function maxReachableStep() {
    let i = 0;
    while (i < 4 && stepComplete(i)) i++;
    return i;
  }

  /* ---------------------------------------------------------- Navigation */
  function goTo(step, { push = true, focus = true } = {}) {
    step = Math.max(0, Math.min(step, maxReachableStep()));
    state.step = step;
    saveDraft();
    if (push) history.pushState({ step }, "", location.pathname + location.search);
    render({ focus });
  }
  window.addEventListener("popstate", (e) => {
    if (confirmed) return;
    const s = e.state && typeof e.state.step === "number" ? e.state.step : 0;
    goTo(s, { push: false });
  });

  function next() {
    if (state.step === 3) {
      Object.keys(validators).forEach((k) => touched.add(k));
      const firstBad = Object.keys(validators).find((k) => validators[k](state.patient[k] ?? ""));
      validateFields();
      if (firstBad) {
        const el = $(`#f-${firstBad}`);
        el && el.focus();
        announce("Please fix the highlighted fields.");
        return;
      }
    }
    if (state.step === 4) return confirm();
    if (stepComplete(state.step)) goTo(state.step + 1);
  }
  function back() {
    if (state.step === 0) { location.href = "index.html"; return; }
    goTo(state.step - 1);
  }

  /* -------------------------------------------------------------- Render */
  const panel = () => $("#book-panel");

  function render({ focus = false } = {}) {
    if (confirmed) return renderConfirmation();
    renderStepper();
    const views = [viewService, viewDoctor, viewDateTime, viewDetails, viewReview];
    panel().innerHTML = `<div class="step-anim">${views[state.step]()}${actionsHtml()}</div>`;
    bindStep();
    renderSummary();
    renderMobileBar();
    refreshIcons();
    if (focus) {
      const h = $("#step-title");
      h && h.focus({ preventScroll: true });
      const top = $("#stepper").getBoundingClientRect().top + window.scrollY - 90;
      if (window.scrollY > top) window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
    }
    announce(`Step ${state.step + 1} of 5: ${STEPS[state.step]}`);
  }

  function announce(msg) {
    const el = $("#sr-status");
    if (el) { el.textContent = ""; setTimeout(() => (el.textContent = msg), 50); }
  }

  function renderStepper() {
    const reach = maxReachableStep();
    $("#stepper").innerHTML = STEPS.map((label, i) => {
      const cls = i === state.step ? "is-current" : i < state.step || (i <= reach && stepComplete(i)) ? "is-done" : "";
      const canJump = i !== state.step && i <= reach;
      return `<button type="button" class="stepper__item ${cls}" data-step="${i}" ${canJump ? "" : "disabled"} ${i === state.step ? 'aria-current="step"' : ""} aria-label="Step ${i + 1}: ${label}${cls === "is-done" ? " (completed)" : ""}">
        <span class="stepper__bar"></span>
        <span class="stepper__label">${cls === "is-done" ? icon("circle-check") : ""}${label}</span>
      </button>`;
    }).join("");
    $("#stepper-mobile").innerHTML = `Step ${state.step + 1} of 5 · <b>${STEPS[state.step]}</b>`;
  }

  const head = (title, sub) => `<h2 class="step-title" id="step-title" tabindex="-1">${title}</h2><p class="step-sub">${sub}</p>`;

  function actionsHtml() {
    const isLast = state.step === 4;
    const disabled = state.step < 3 && !stepComplete(state.step);
    return `
      <div class="book-actions">
        <button type="button" class="btn btn--ghost" data-action="back">${icon("arrow-left")} ${state.step === 0 ? "Home" : "Back"}</button>
        <div class="row-gap">
          <span class="book-actions__hint">${isLast ? "You won't be charged now" : `Step ${state.step + 1} of 5`}</span>
          <button type="button" class="btn btn--primary${isLast ? " btn--lg" : ""}" data-action="next" ${disabled ? 'aria-disabled="true"' : ""}>
            ${isLast ? `Confirm Appointment ${icon("check")}` : `Continue ${icon("arrow-right")}`}
          </button>
        </div>
      </div>`;
  }

  /* Step 1 — Service */
  function viewService() {
    const opt = (s, wide) => `
      <label class="option${wide ? " option--wide" : ""}">
        <input type="radio" name="service" value="${s.id}" ${state.service === s.id ? "checked" : ""}>
        <span class="icon-tile icon-tile--sm">${icon(s.icon)}</span>
        <span class="option__body">
          <span class="option__title">${esc(s.name)}</span>
          <span class="option__desc">${esc(s.short)}</span>
          <span class="option__meta">
            <span>${icon("clock")} ${s.duration} min</span>
            <span>${fromPrice(s.price)}${s.priceLabel ? ` ${esc(s.priceLabel.toLowerCase())}` : ""}</span>
          </span>
        </span>
        <span class="option__check">${icon("check")}</span>
      </label>`;
    return `${head("What can we help with?", "Choose a treatment. You can always discuss options with your dentist.")}
      <div class="options" role="radiogroup" aria-labelledby="step-title">
        ${SERVICES.map((s) => opt(s)).join("")}
        ${opt(CONSULT, true)}
      </div>`;
  }

  /* Step 2 — Doctor */
  function viewDoctor() {
    const svc = findService(state.service);
    const docOpt = (d) => {
      // Only meaningful when a doctor offers a subset of treatments.
      const rec = svc && d.services.includes(svc.id) && d.services.length < SERVICES.length;
      return `
      <label class="option">
        <input type="radio" name="doctor" value="${d.id}" ${state.doctor === d.id ? "checked" : ""}>
        <img class="option__photo" src="${d.photo.replace("w=700", "w=160").replace("h=820", "h=160")}" alt="" width="56" height="56" loading="lazy">
        <span class="option__body">
          <span class="option__title">${esc(d.name)}</span>
          <span class="option__desc">${esc(d.role)}</span>
          <span class="option__meta">${d.years ? `<span>${icon("award")} ${d.years} yrs</span>` : ""}${d.languages.length ? `<span>${icon("languages")} ${d.languages.slice(0, 2).join(", ")}</span>` : ""}</span>
          ${rec ? `<span class="badge badge--mint">${icon("sparkles")} Recommended for ${esc(svc.name.split(" /")[0])}</span>` : ""}
        </span>
        <span class="option__check">${icon("check")}</span>
      </label>`;
    };
    return `${head("Choose your dentist", "Pick your dentist, or let us match you with the first available dentist.")}
      <div class="options" role="radiogroup" aria-labelledby="step-title">
        <label class="option option--wide">
          <input type="radio" name="doctor" value="any" ${state.doctor === "any" ? "checked" : ""}>
          <span class="option__photo option__photo--any">${icon("users")}</span>
          <span class="option__body">
            <span class="option__title">Any available doctor</span>
            <span class="option__desc">Fastest option. We'll match you with the right dentist.</span>
            <span class="badge badge--blue">${icon("zap")} Most flexible times</span>
          </span>
          <span class="option__check">${icon("check")}</span>
        </label>
        ${DOCTORS.map(docOpt).join("")}
      </div>`;
  }

  /* Step 3 — Date & time */
  function viewDateTime() {
    const docId = state.doctor || "any";
    const earliest = BookingAPI.earliest(docId);
    if (!viewMonth) {
      const base = state.date ? parseYmd(state.date) : earliest ? parseYmd(earliest.date) : new Date();
      viewMonth = new Date(base.getFullYear(), base.getMonth(), 1);
    }
    const isEarliestPicked = earliest && state.date === earliest.date && state.time === earliest.time;
    return `${head("Pick a date & time", "Available days are highlighted. All times are local clinic time.")}
      ${earliest ? `
      <div class="quick-earliest">
        <p><span class="live-dot" aria-hidden="true"></span><span>Earliest available: <b>${relDay(earliest.date)}, ${fmtTime(earliest.time)}</b></span></p>
        <button type="button" class="btn btn--sm ${isEarliestPicked ? "btn--soft" : "btn--secondary"}" data-action="earliest" ${isEarliestPicked ? 'aria-pressed="true"' : ""}>
          ${isEarliestPicked ? `${icon("check")} Selected` : "Book earliest"}
        </button>
      </div>` : ""}
      <div class="datetime">
        <div class="cal" id="cal">${calendarHtml(docId)}</div>
        <div class="slots" id="slots" aria-live="polite">${state.date ? "" : slotsEmpty("Select a date to see available times.")}</div>
      </div>`;
  }

  function calendarHtml(docId) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxMonth = new Date(today.getFullYear(), today.getMonth() + 2, 1);
    const y = viewMonth.getFullYear(), m = viewMonth.getMonth();
    const first = new Date(y, m, 1);
    const offset = (first.getDay() + 6) % 7; // Monday-first
    const days = new Date(y, m + 1, 0).getDate();
    const label = first.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    let cells = "";
    for (let i = 0; i < offset; i++) cells += `<span aria-hidden="true"></span>`;
    for (let d = 1; d <= days; d++) {
      const dt = new Date(y, m, d);
      const key = ymd(dt);
      const avail = BookingAPI.isDateAvailable(key, docId);
      const cls = ["cal__day", avail ? "is-avail" : "", key === ymd(today) ? "is-today" : "", key === state.date ? "is-selected" : ""].join(" ");
      const full = dt.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
      cells += `<button type="button" role="gridcell" class="${cls}" data-date="${key}" ${avail ? "" : "disabled"} aria-label="${full}${avail ? ", available" : ", unavailable"}" ${key === state.date ? 'aria-selected="true"' : ""} tabindex="-1">${d}</button>`;
    }
    return `
      <div class="cal__head">
        <span class="cal__month" id="cal-month" aria-live="polite">${label}</span>
        <div class="cal__nav">
          <button type="button" class="icon-btn" data-action="prev-month" aria-label="Previous month" ${viewMonth <= minMonth ? "disabled" : ""}>${icon("chevron-left")}</button>
          <button type="button" class="icon-btn" data-action="next-month" aria-label="Next month" ${viewMonth >= maxMonth ? "disabled" : ""}>${icon("chevron-right")}</button>
        </div>
      </div>
      <div class="cal__grid" role="grid" aria-labelledby="cal-month">
        ${["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => `<span class="cal__dow" aria-hidden="true">${d}</span>`).join("")}
        ${cells}
      </div>
      <div class="cal__legend"><span><i></i> Available</span><span><i class="off"></i> Unavailable</span></div>`;
  }

  const slotsEmpty = (msg) => `<div class="slots__empty">${icon("calendar-clock")}<p>${msg}</p></div>`;
  const slotsSkeleton = () => `
    <div class="skeleton skeleton--label"></div>
    ${[0, 1, 2].map(() => `<div class="slot-group"><div class="skeleton skeleton--label" style="width:70px"></div><div class="slot-list">${'<div class="skeleton skeleton--slot"></div>'.repeat(4)}</div></div>`).join("")}`;

  let slotReq = 0;
  async function loadSlots() {
    const host = $("#slots");
    if (!host || !state.date) return;
    const req = ++slotReq;
    host.setAttribute("aria-busy", "true");
    host.innerHTML = slotsSkeleton();
    const slots = await BookingAPI.getSlots(state.date, state.doctor || "any");
    if (req !== slotReq || !$("#slots")) return;
    host.removeAttribute("aria-busy");
    if (!slots) { host.innerHTML = slotsEmpty("No times left on this day. Try another date."); refreshIcons(); return; }
    host.innerHTML = `
      <div class="slots__date">${fmtDate(state.date, { weekday: "long", day: "numeric", month: "long" })}</div>
      ${Object.entries(slots).filter(([, t]) => t.length).map(([g, times]) => `
        <div class="slot-group" role="group" aria-label="${g}">
          <div class="slot-group__label">${icon(GROUP_ICONS[g])} ${g}</div>
          <div class="slot-list">
            ${times.map((t) => `<button type="button" class="slot" data-time="${t}" aria-pressed="${state.time === t}">${fmtTime(t)}</button>`).join("")}
          </div>
        </div>`).join("")}`;
    refreshIcons();
  }

  /* Step 4 — Details */
  function viewDetails() {
    const p = state.patient;
    const err = (k) => `<span class="field__error" id="e-${k}">${icon("circle-alert")}<span></span></span>`;
    return `${head("Your details", "We'll only use these to confirm and manage your appointment.")}
      <form class="details-grid" id="details-form" novalidate>
        <div class="field full">
          <span class="field__label" id="l-type">Have you visited us before?</span>
          <div class="segmented" role="radiogroup" aria-labelledby="l-type">
            <label><input type="radio" name="type" value="new" ${p.type === "new" ? "checked" : ""}><span>${icon("sparkles")} New patient</span></label>
            <label><input type="radio" name="type" value="returning" ${p.type === "returning" ? "checked" : ""}><span>${icon("refresh-ccw")} Returning</span></label>
          </div>
        </div>
        <div class="field full" data-field="name">
          <label class="field__label" for="f-name">Full name</label>
          <input class="input" id="f-name" name="name" autocomplete="name" value="${esc(p.name)}" placeholder="Your full name" aria-describedby="e-name" required>
          ${err("name")}
        </div>
        <div class="field" data-field="phone">
          <label class="field__label" for="f-phone">Phone number</label>
          <div class="phone-group">
            <select class="select" id="f-cc" name="cc" aria-label="Country code" autocomplete="tel-country-code">
              ${COUNTRY_CODES.map(([v, l]) => `<option value="${v}" ${p.cc === v ? "selected" : ""}>${l}</option>`).join("")}
            </select>
            <input class="input" id="f-phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel-national" value="${esc(p.phone)}" placeholder="10-digit mobile number" aria-describedby="e-phone" required>
          </div>
          ${err("phone")}
        </div>
        <div class="field" data-field="email">
          <label class="field__label" for="f-email">Email</label>
          <input class="input" id="f-email" name="email" type="email" inputmode="email" autocomplete="email" value="${esc(p.email)}" placeholder="you@example.com" aria-describedby="e-email" required>
          ${err("email")}
        </div>
        <div class="field" data-field="age">
          <label class="field__label" for="f-age">Patient age</label>
          <input class="input" id="f-age" name="age" type="number" inputmode="numeric" min="1" max="120" value="${esc(p.age)}" placeholder="e.g. 32" aria-describedby="e-age" required>
          ${err("age")}
        </div>
        <div class="field" style="align-content:end">
          <div class="notice notice--blue" style="padding:12px 14px;font-size:13.5px">${icon("lock")}<span>Your details are private and never shared.</span></div>
        </div>
        <div class="field full" data-field="notes">
          <label class="field__label" for="f-notes">Describe your concern <span class="opt">(optional)</span></label>
          <textarea class="textarea" id="f-notes" name="notes" maxlength="500" placeholder="e.g. Sensitivity on the lower left side when drinking cold water." aria-describedby="e-notes notes-count">${esc(p.notes)}</textarea>
          <div class="row-gap" style="justify-content:space-between">${err("notes")}<span class="char-count" id="notes-count">${p.notes.length}/500</span></div>
        </div>
      </form>`;
  }

  function validateFields() {
    for (const k of Object.keys(validators)) {
      const wrap = $(`[data-field="${k}"]`);
      if (!wrap) continue;
      const msg = touched.has(k) ? validators[k](state.patient[k] ?? "") : "";
      wrap.classList.toggle("is-invalid", !!msg);
      const input = $(`#f-${k}`);
      input && input.setAttribute("aria-invalid", msg ? "true" : "false");
      $(`#e-${k} span`).textContent = msg;
    }
  }

  /* Step 5 — Review */
  function summaryRows(b = state, editable = true) {
    const s = findService(b.service);
    const d = findDoctor(b.doctor);
    const p = b.patient;
    const edit = (step) => (editable ? `<button type="button" class="edit" data-goto="${step}">Edit</button>` : "");
    return `
      <div class="review-list">
        <div class="review-row"><span class="review-row__k">Treatment</span><span class="review-row__v">${esc(s.name)}<small>${s.duration} min · ${fromPrice(s.price, false).toLowerCase()}</small></span>${edit(0)}</div>
        <div class="review-row"><span class="review-row__k">Dentist</span><span class="review-row__v">${d ? esc(d.name) : "Any available doctor"}<small>${d ? esc(d.role) : "Matched to your treatment"}</small></span>${edit(1)}</div>
        <div class="review-row"><span class="review-row__k">Date &amp; time</span><span class="review-row__v">${fmtDate(b.date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}<small>${fmtTime(b.time)} · please arrive 10 min early</small></span>${edit(2)}</div>
        <div class="review-row"><span class="review-row__k">Patient</span><span class="review-row__v">${esc(p.name)}<small>${esc(p.cc)} ${esc(p.phone)} · ${esc(p.email)} · ${p.type === "new" ? "New patient" : "Returning patient"}</small></span>${edit(3)}</div>
        <div class="review-row"><span class="review-row__k">Clinic</span><span class="review-row__v">${esc(CLINIC.fullName)}<small>${esc(CLINIC.address.full)}</small></span></div>
        <div class="review-total"><span>Estimated cost</span><b>${s.price == null ? "On consultation" : `from ${money(s.price)}`}</b></div>
      </div>`;
  }
  function viewReview() {
    return `${head("Review &amp; confirm", "Check everything looks right. You can edit any detail.")}
      ${state.replaces ? `<div class="notice notice--blue" style="margin-bottom:16px">${icon("refresh-ccw")}<span>You're rescheduling booking <b>${esc(state.replaces)}</b>. Your previous slot will be released.</span></div>` : ""}
      ${summaryRows()}
      <ul class="policy-list">
        <li>${icon("circle-check")}<span>Free cancellation or rescheduling up to 24 hours before.</span></li>
        <li>${icon("circle-check")}<span>Pay at the clinic. Final cost confirmed after your exam.</span></li>
        <li>${icon("circle-check")}<span>Confirmation sent instantly via SMS, WhatsApp &amp; email.</span></li>
      </ul>`;
  }

  /* --------------------------------------------------------------- Binding */
  function bindStep() {
    const p = panel();
    // Option radios (service / doctor). Pointer clicks auto-advance; keyboard users confirm with Continue.
    $$('input[name="service"], input[name="doctor"]', p).forEach((input) => {
      input.addEventListener("change", () => {
        if (input.name === "service") state.service = input.value;
        else if (state.doctor !== input.value) { state.doctor = input.value; state.date = null; state.time = null; viewMonth = null; }
        saveDraft();
        renderSummary(); renderMobileBar(); renderStepper();
        refreshActions();
      });
    });
    $$(".option", p).forEach((label) => label.addEventListener("click", (e) => {
      if (e.detail > 0 && e.target.tagName !== "INPUT") setTimeout(() => stepComplete(state.step) && goTo(state.step + 1), 220);
    }));

    if (state.step === 2) {
      bindCalendar();
      if (state.date) loadSlots();
    }
    if (state.step === 3) bindDetails();
  }

  function refreshActions() {
    const btn = $('[data-action="next"]', panel());
    if (btn) state.step < 3 && !stepComplete(state.step) ? btn.setAttribute("aria-disabled", "true") : btn.removeAttribute("aria-disabled");
  }

  function bindCalendar() {
    const cal = $("#cal");
    const days = () => $$(".cal__day", cal);
    // Roving tabindex: one focusable day.
    const focusable = days().find((b) => b.dataset.date === state.date && !b.disabled) || days().find((b) => !b.disabled);
    if (focusable) focusable.tabIndex = 0;

    cal.onkeydown = (e) => {
      const b = e.target.closest(".cal__day");
      if (!b) return;
      const deltas = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      if (!(e.key in deltas)) return;
      e.preventDefault();
      const all = days();
      let i = all.indexOf(b) + deltas[e.key];
      while (all[i] && all[i].disabled) i += Math.sign(deltas[e.key]);
      if (all[i]) { b.tabIndex = -1; all[i].tabIndex = 0; all[i].focus(); }
    };
  }

  function bindDetails() {
    const form = $("#details-form");
    form.addEventListener("submit", (e) => { e.preventDefault(); next(); });
    form.addEventListener("input", (e) => {
      const { name, value } = e.target;
      if (!(name in state.patient)) return;
      state.patient[name] = name === "phone" ? value.replace(/[^\d\s-]/g, "") : value;
      if (name === "phone" && e.target.value !== state.patient.phone) e.target.value = state.patient.phone;
      if (name === "notes") $("#notes-count").textContent = `${value.length}/500`;
      saveDraft();
      if (touched.has(name)) validateFields();
      renderSummary(); renderMobileBar();
    });
    form.addEventListener("change", (e) => {
      if (e.target.name === "type" || e.target.name === "cc") { state.patient[e.target.name] = e.target.value; saveDraft(); }
    });
    form.addEventListener("focusout", (e) => {
      const n = e.target.name;
      if (n in validators && (state.patient[n] !== "" || touched.has(n))) { touched.add(n); validateFields(); }
    });
    // Enter in inputs submits the step.
    form.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.tagName === "INPUT") { e.preventDefault(); next(); }
    });
    validateFields();
  }

  // Delegated clicks for all panels + mobile bar + stepper.
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-action], [data-goto], .stepper__item, .cal__day, .slot");
    if (!t || !t.closest("#book-panel, #mobile-bar, #stepper, #summary")) return;

    if (t.matches(".stepper__item") && !t.disabled) return goTo(+t.dataset.step);
    if (t.dataset.goto) return goTo(+t.dataset.goto);

    if (t.matches(".cal__day") && !t.disabled) {
      state.date = t.dataset.date;
      state.time = null;
      saveDraft();
      $$(".cal__day", panel()).forEach((b) => { b.classList.toggle("is-selected", b === t); b.toggleAttribute("aria-selected", b === t); b.tabIndex = b === t ? 0 : -1; });
      updateEarliestBtn();
      loadSlots();
      // On stacked (mobile) layouts, bring the time slots into view.
      if (window.matchMedia("(max-width: 1100px)").matches) {
        const y = $("#slots").getBoundingClientRect().top + window.scrollY - 88;
        window.scrollTo({ top: y, behavior: reducedMotion ? "auto" : "smooth" });
      }
      renderSummary(); renderMobileBar(); renderStepper(); refreshActions();
      return;
    }
    if (t.matches(".slot")) {
      state.time = t.dataset.time;
      saveDraft();
      $$(".slot", panel()).forEach((b) => b.setAttribute("aria-pressed", String(b === t)));
      updateEarliestBtn();
      renderSummary(); renderMobileBar(); renderStepper(); refreshActions();
      announce(`${fmtTime(state.time)} selected`);
      return;
    }

    switch (t.dataset.action) {
      case "next": if (t.getAttribute("aria-disabled") !== "true") next(); else announce(hintFor(state.step)); break;
      case "back": back(); break;
      case "prev-month": viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1); rerenderCalendar(); break;
      case "next-month": viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1); rerenderCalendar(); break;
      case "earliest": {
        const er = BookingAPI.earliest(state.doctor || "any");
        if (!er) break;
        state.date = er.date; state.time = er.time;
        const d = parseYmd(er.date); viewMonth = new Date(d.getFullYear(), d.getMonth(), 1);
        saveDraft();
        render();
        break;
      }
    }
  });

  function rerenderCalendar() {
    $("#cal").innerHTML = calendarHtml(state.doctor || "any");
    bindCalendar();
    refreshIcons();
  }
  function updateEarliestBtn() {
    const btn = $('[data-action="earliest"]');
    if (!btn) return;
    const er = BookingAPI.earliest(state.doctor || "any");
    const on = er && er.date === state.date && er.time === state.time;
    btn.className = `btn btn--sm ${on ? "btn--soft" : "btn--secondary"}`;
    btn.innerHTML = on ? `${icon("check")} Selected` : "Book earliest";
    refreshIcons();
  }
  const hintFor = (s) => ["Please choose a treatment to continue.", "Please choose a dentist to continue.", "Please pick a date and time to continue."][s] || "";

  /* ------------------------------------------------------------- Summary */
  function renderSummary() {
    const s = findService(state.service);
    const d = findDoctor(state.doctor);
    const row = (ic, label, val, step) => `
      <div class="summary__row">
        <span class="icon-tile">${icon(ic)}</span>
        <div style="flex:1;min-width:0"><small>${label}</small><span class="${val ? "" : "empty"}">${val || "Not selected"}</span></div>
        ${val && step < state.step ? `<button type="button" class="link" style="font-size:13px" data-goto="${step}" aria-label="Edit ${label}">Edit</button>` : ""}
      </div>`;
    $("#summary").innerHTML = `
      <h2>Your appointment ${state.replaces ? '<span class="badge badge--blue">Reschedule</span>' : ""}</h2>
      <div class="summary__list">
        ${row(s ? s.icon : "sparkles", "Treatment", s && esc(s.name), 0)}
        ${row("user-round", "Dentist", state.doctor === "any" ? "Any available doctor" : d && esc(d.name), 1)}
        ${row("calendar", "Date & time", state.date && state.time ? `${fmtDate(state.date)} · ${fmtTime(state.time)}` : state.date ? `${fmtDate(state.date)} · pick a time` : "", 2)}
        ${row("map-pin", "Clinic", esc(CLINIC.address.line2), 9)}
      </div>
      <div class="summary__total"><span>${s && s.price == null ? "Estimate" : "Estimated from"}</span><b>${s ? money(s.price) : "—"}</b></div>
      <div class="summary__assure">
        <span>${icon("shield-check")} Free cancellation up to 24h before</span>
        <span>${icon("wallet")} Pay at the clinic, no card needed</span>
        <span>${icon("phone")} Questions? <a href="${CLINIC.phoneHref}" style="color:var(--blue-600);font-weight:600">${esc(CLINIC.phone)}</a></span>
      </div>`;
    refreshIcons();
  }

  function renderMobileBar() {
    const bar = $("#mobile-bar");
    if (confirmed) { bar.innerHTML = ""; bar.hidden = true; return; }
    bar.hidden = false;
    const s = findService(state.service);
    const info = state.step >= 2 && state.date && state.time
      ? `<b>${fmtDate(state.date)} · ${fmtTime(state.time)}</b>${s ? esc(s.name) : ""}`
      : s ? `<b>${esc(s.name)}</b>${fromPrice(s.price, false)}` : `<b>Step ${state.step + 1} of 5</b>${STEPS[state.step]}`;
    const isLast = state.step === 4;
    const disabled = state.step < 3 && !stepComplete(state.step);
    bar.innerHTML = `
      <button type="button" class="btn btn--secondary back" data-action="back" aria-label="${state.step === 0 ? "Back to home" : "Back to previous step"}">${icon("arrow-left")}</button>
      <div class="mobile-bar__info">${info}</div>
      <button type="button" class="btn btn--primary" data-action="next" ${disabled ? 'aria-disabled="true"' : ""}>${isLast ? "Confirm" : "Continue"} ${icon(isLast ? "check" : "arrow-right")}</button>`;
    refreshIcons();
  }

  /* -------------------------------------------------------------- Confirm */
  async function confirm() {
    const btns = $$('[data-action="next"]');
    btns.forEach((b) => { b.setAttribute("aria-disabled", "true"); b.dataset.label = b.innerHTML; b.innerHTML = `<span class="spinner" aria-hidden="true"></span> Confirming…`; });
    announce("Confirming your appointment…");
    try {
      const svc = findService(state.service);
      const doctor = state.doctor === "any" ? DOCTORS.find((d) => d.services.includes(state.service))?.id || DOCTORS[0].id : state.doctor;
      confirmed = await BookingAPI.createBooking({
        service: state.service, doctor, requestedDoctor: state.doctor, date: state.date, time: state.time,
        duration: svc.duration, price: svc.price, patient: { ...state.patient }, replaces: state.replaces,
      });
      clearDraft();
      history.replaceState({ step: "done" }, "", "book.html?ref=" + confirmed.ref);
      renderConfirmation();
    } catch (err) {
      btns.forEach((b) => { b.removeAttribute("aria-disabled"); b.innerHTML = b.dataset.label; });
      toast("Something went wrong. Please try again or call us.");
    }
  }

  function calendarLinks(b) {
    const s = findService(b.service);
    const d = findDoctor(b.doctor);
    const start = parseYmd(b.date);
    const [h, m] = b.time.split(":").map(Number);
    start.setHours(h, m);
    const end = new Date(start.getTime() + s.duration * 60000);
    const stamp = (dt) => `${dt.getFullYear()}${String(dt.getMonth() + 1).padStart(2, "0")}${String(dt.getDate()).padStart(2, "0")}T${String(dt.getHours()).padStart(2, "0")}${String(dt.getMinutes()).padStart(2, "0")}00`;
    const title = `${s.name} · ${CLINIC.fullName}`;
    const details = `Booking ref: ${b.ref}\nDentist: ${d ? d.name : "Assigned on arrival"}\nPlease arrive 10 minutes early.\nManage booking: ${new URL(`portal.html?ref=${b.ref}`, location.href).href}`;
    const google = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${stamp(start)}/${stamp(end)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(CLINIC.address.full)}`;
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MA Dental Care//Booking//EN", "BEGIN:VEVENT",
      `UID:${b.ref}@madentalcare.in`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
      `SUMMARY:${title}`, `DESCRIPTION:${details.replace(/\n/g, "\\n")}`, `LOCATION:${CLINIC.address.full.replace(/,/g, "\\,")}`,
      "BEGIN:VALARM", "TRIGGER:-PT2H", "ACTION:DISPLAY", "DESCRIPTION:Dental appointment", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    return { google, ics };
  }

  function renderConfirmation() {
    const b = confirmed;
    const first = esc(b.patient.name.trim().split(" ")[0]);
    const { google, ics } = calendarLinks(b);
    $("#stepper").hidden = true;
    $("#stepper-mobile").hidden = true;
    $("#book-head").hidden = true;
    $(".summary-col").hidden = true;
    $(".book-layout").style.gridTemplateColumns = "1fr";
    renderMobileBar();
    panel().classList.add("confirm");
    panel().innerHTML = `
      <svg class="check-anim" viewBox="0 0 88 88" aria-hidden="true">
        <defs><linearGradient id="cg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#34d399"/><stop offset="1" stop-color="#3b82f6"/></linearGradient></defs>
        <circle class="bg" cx="44" cy="44" r="40"/>
        <circle cx="44" cy="44" r="40" transform="rotate(-90 44 44)"/>
        <path d="M28 45.5 39 56l21-23"/>
      </svg>
      <h2 class="step-title" id="step-title" tabindex="-1" style="font-size:clamp(1.75rem,3.4vw,2.25rem)">You're booked, ${first}!</h2>
      <p class="step-sub" style="margin-bottom:0">We can't wait to see you. Here are your appointment details.</p>
      <div class="ref-chip">Booking ref <b id="ref">${esc(b.ref)}</b><button type="button" data-copy="${esc(b.ref)}">Copy</button></div>
      ${summaryRows(b, false)}
      <div class="confirm__actions">
        <a class="btn btn--secondary" href="${google}" target="_blank" rel="noopener">${icon("calendar-plus")} Google Calendar</a>
        <button type="button" class="btn btn--secondary" id="ics">${icon("calendar-check")} Apple / Outlook</button>
        <a class="btn btn--primary" href="${CLINIC.directions}" target="_blank" rel="noopener" style="grid-column:1/-1">${icon("navigation")} Get directions</a>
      </div>
      <div class="notice">${icon("send")}<span>A confirmation has been sent to <b>${esc(b.patient.cc)} ${esc(b.patient.phone)}</b> via SMS &amp; WhatsApp, and to <b>${esc(b.patient.email)}</b>. We'll send a reminder the day before.</span></div>
      <div class="confirm__manage">
        <a class="link" href="book.html?reschedule=${encodeURIComponent(b.ref)}">${icon("calendar-clock")} Reschedule</a>
        <a class="link" href="portal.html?ref=${encodeURIComponent(b.ref)}&action=cancel" style="color:var(--muted)">${icon("circle-x")} Cancel booking</a>
        <a class="link" href="index.html" style="color:var(--muted)">${icon("arrow-left")} Back to home</a>
      </div>`;
    refreshIcons();
    $("#step-title").focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    announce(`Appointment confirmed. Your booking reference is ${b.ref}.`);

    $("#ics").addEventListener("click", () => {
      const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
      const a = Object.assign(document.createElement("a"), { href: url, download: `${b.ref}.ics` });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    $("[data-copy]").addEventListener("click", async (e) => {
      try { await navigator.clipboard.writeText(e.currentTarget.dataset.copy); toast("Reference copied"); }
      catch { toast("Copy not available. Please note it down."); }
    });
  }

  function toast(msg) {
    const t = $("#toast");
    t.innerHTML = `${icon("circle-check")} ${esc(msg)}`;
    refreshIcons();
    t.classList.add("is-on");
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove("is-on"), 2400);
  }

  /* ---------------------------------------------------------------- Boot */
  document.addEventListener("app:ready", () => {
    // Revisiting a confirmation URL shows the saved booking.
    const ref = params.get("ref");
    const existing = ref && Store.all().find((b) => b.ref === ref);
    if (existing) { confirmed = existing; renderConfirmation(); return; }

    applyParams();
    if (state.replaces) {
      $("#book-head h1").textContent = "Reschedule your appointment";
    }
    saveDraft();
    history.replaceState({ step: state.step }, "", location.pathname + location.search);
    render();
  });
})();
