/* ==========================================================================
   Reusable UI components (render functions returning HTML strings)
   ========================================================================== */
(function () {
  "use strict";
  const { CLINIC } = window.SITE;
  const { esc, money, icon, stars, bookUrl, BRAND } = window.App;

  const serviceCard = (s, i = 0) => `
    <article class="card card--hover service-card" data-reveal style="--d:${i % 4}">
      <span class="icon-tile">${icon(s.icon)}</span>
      <h3><a class="stretched" href="service.html?s=${s.id}">${esc(s.name)}</a></h3>
      <p>${esc(s.short)}</p>
      <div class="service-card__meta">
        <span>From <b>${money(s.price)}</b></span>
        <span class="link">Learn more ${icon("arrow-right")}</span>
      </div>
    </article>`;

  const doctorCard = (d, i = 0) => `
    <article class="card card--hover doctor-card" data-reveal style="--d:${i}">
      <div class="frame doctor-card__photo">
        <img src="${d.photo}" alt="Portrait of ${esc(d.name)}" loading="lazy" width="700" height="820">
        <span class="badge doctor-card__exp glass" style="box-shadow:none">${icon("award")} ${d.years} yrs experience</span>
      </div>
      <div class="doctor-card__body">
        <h3><a href="doctor.html?d=${d.id}">${esc(d.name)}</a></h3>
        <span class="doctor-card__role">${esc(d.role)}</span>
        <p class="doctor-card__quals">${d.quals.map(esc).join(" · ")}</p>
        <div class="doctor-card__actions">
          <a class="btn btn--primary btn--sm" href="${bookUrl({ doctor: d.id })}" aria-label="Book with ${esc(d.name)}">Book with ${esc(d.name.split(" ").slice(0, 2).join(" "))}</a>
        </div>
      </div>
    </article>`;

  const initials = (n) => n.split(" ").map((p) => p[0]).join("").slice(0, 2);
  const reviewCard = (t, i = 0) => `
    <figure class="card review" data-reveal style="--d:${i % 3}">
      <div class="review__top">${stars(t.rating)}<span aria-hidden="true" style="color:var(--blue-200)">${icon("quote")}</span></div>
      <blockquote class="review__quote" style="margin:0">“${esc(t.quote)}”</blockquote>
      <figcaption class="review__foot">
        ${t.avatar ? `<img class="avatar" src="${t.avatar}" alt="" loading="lazy" width="40" height="40">` : `<span class="avatar" aria-hidden="true">${initials(t.name)}</span>`}
        <div><div class="review__name">${esc(t.name)}</div><div class="review__treat">${esc(t.treatment)}</div></div>
      </figcaption>
    </figure>`;

  const priceCard = (p, i = 0) => `
    <article class="card price-card${p.popular ? " price-card--popular" : ""}" data-reveal style="--d:${i}">
      ${p.popular ? `<span class="price-card__tag">${icon("sparkles")} Most popular</span>` : ""}
      <h3>${esc(p.name)}</h3>
      <p class="price-card__blurb">${esc(p.blurb)}</p>
      <div class="price-card__price"><small>from</small><b>${money(p.price)}</b></div>
      <ul>${p.features.map((f) => `<li>${icon("circle-check")}<span>${esc(f)}</span></li>`).join("")}</ul>
      <a class="btn ${p.popular ? "btn--primary" : "btn--secondary"} btn--block" href="${bookUrl({ service: p.service })}">Book this ${icon("arrow-right")}</a>
    </article>`;

  const contactButtons = (opts = {}) => `
    ${opts.noBook ? "" : `<a class="btn btn--primary${opts.lg ? " btn--lg" : ""}" href="${bookUrl()}">Book Appointment ${icon("arrow-right")}</a>`}
    <a class="btn btn--secondary${opts.lg ? " btn--lg" : ""}" href="${CLINIC.phoneHref}">${icon("phone")} Call us</a>
    <a class="btn btn--secondary${opts.lg ? " btn--lg" : ""}" href="${CLINIC.whatsapp}" target="_blank" rel="noopener">${BRAND.whatsapp} WhatsApp</a>`;

  window.UI = { serviceCard, doctorCard, reviewCard, priceCard, contactButtons, initials };
})();
