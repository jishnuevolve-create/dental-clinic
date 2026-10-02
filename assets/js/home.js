/* Homepage: renders data-driven sections. */
(function () {
  "use strict";
  const { SERVICES, DOCTORS, PRICING, TESTIMONIALS, FAQS, CASES, LOGOS } = window.SITE;
  const { $, $$, icon, esc, BookingAPI, relDay, fmtTime, renderAccordion, initCompare } = window.App;

  document.addEventListener("app:ready", () => {
    // Marquee: the second copy is decorative so screen readers hear the list once.
    const logo = (hidden) => ([ic, label]) => `<span class="logos__item"${hidden ? ' aria-hidden="true"' : ""}>${icon(ic)}${esc(label)}</span>`;
    $("#logos").innerHTML = LOGOS.map(logo(false)).join("") + LOGOS.map(logo(true)).join("");
    $("#services-grid").innerHTML = SERVICES.map(UI.serviceCard).join("");
    $("#doctors-grid").innerHTML = DOCTORS.map(UI.doctorCard).join("");
    $("#pricing-grid").innerHTML = PRICING.map(UI.priceCard).join("");
    $("#reviews-grid").innerHTML = TESTIMONIALS.map(UI.reviewCard).join("");
    $("#cta-actions").innerHTML = UI.contactButtons({ lg: true });
    $("#faq-help").innerHTML = UI.contactButtons({ noBook: true });
    renderAccordion($("#faq-list"), FAQS);

    // Live "next available" chip in the hero.
    const next = BookingAPI.earliest("any");
    if (next) $("#next-slot").textContent = `Next available: ${relDay(next.date)}, ${fmtTime(next.time)}`;

    // Before/after cases (tabs + prev/next).
    const cmp = $("#compare");
    const list = $("#cases");
    let current = 0;
    list.innerHTML = CASES.map((c, i) => `
      <button class="case-btn" type="button" role="tab" aria-selected="${i === 0}" aria-controls="compare" data-i="${i}">
        <span class="case-btn__num">${String(i + 1).padStart(2, "0")}</span>
        <span><strong>${esc(c.label)}</strong><small>${esc(c.detail)}</small></span>
      </button>`).join("");
    const show = (i) => {
      current = (i + CASES.length) % CASES.length;
      const c = CASES[current];
      ["#cmp-after", "#cmp-before"].forEach((sel) => {
        const im = $(sel);
        im.src = c.image;
        im.style.objectPosition = c.pos;
      });
      $("#cmp-after").alt = `${c.label}: after treatment`;
      $$(".case-btn", list).forEach((b, j) => b.setAttribute("aria-selected", String(j === current)));
      const r = $("input", cmp);
      r.value = 50;
      r.dispatchEvent(new Event("input"));
    };
    list.addEventListener("click", (e) => { const b = e.target.closest(".case-btn"); if (b) show(+b.dataset.i); });
    list.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); show(current + 1); $$(".case-btn", list)[current].focus(); }
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); show(current - 1); $$(".case-btn", list)[current].focus(); }
    });
    $("#case-prev").addEventListener("click", () => show(current - 1));
    $("#case-next").addEventListener("click", () => show(current + 1));
    initCompare(cmp);
    show(0);
  });
})();
