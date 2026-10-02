# Aurea Dental Studio: website + online booking

A static, dependency-free site: plain HTML, CSS and vanilla JS. Open `index.html` directly or serve the folder with any static host (Netlify, Vercel, S3, nginx).

## Pages
| File | Purpose |
|---|---|
| `index.html` | Homepage: hero, trust strip, services, why us, technology bento, doctors, before/after, pricing, reviews, FAQ, CTA |
| `book.html` | 5-step booking flow + confirmation (`?service=`, `?doctor=`, `?date=&time=`, `?reschedule=REF`) |
| `service.html?s=<id>` | Treatment detail (data-driven from `SERVICES`) |
| `doctor.html?d=<id>` | Doctor profile with live slot preview |
| `about.html`, `contact.html`, `legal.html` | About, contact form + map + directions, privacy/terms |
| `portal.html` | Patient portal: upcoming/past, reschedule, cancel |

## Where things live
- `assets/js/data.js`: **all content and config** (clinic name, phone, WhatsApp, address, hours, services, prices, doctors, reviews, FAQs). Rebrand here.
- `assets/js/site.js`: header/footer/mobile menu, scroll reveal, accordion, before/after slider, and **`BookingAPI`** (mock availability + booking).
- `assets/js/booking.js`: booking flow (state persisted in `sessionStorage`; browser Back moves between steps).
- `assets/js/components.js`, `home.js`, `pages.js`: card renderers and page logic.
- `assets/css/styles.css`: design tokens (`:root`) and all components.

## Connecting a real backend
Replace the three methods on `BookingAPI` in `site.js` with real calls (keep the signatures and return Promises):
- `getSlots(date, doctorId)` returns `{ Morning: ["09:00", …], Afternoon: […], Evening: […] }` or `null`
- `isDateAvailable(date, doctorId)` / `earliest(doctorId)` for calendar highlighting (precompute from a month-availability endpoint)
- `createBooking(payload)` returns `{ ref, … }`

The portal currently reads bookings from `localStorage` (`Store`). Point it to your patient API for cross-device access. The contact form has a `TODO` where the POST should go.

## Placeholders to replace before launch
- Clinic name "Aurea", phone, address, map query, email, prices, doctor names/bios, accreditation labels
- Unsplash photos: swap for real clinic, team and before/after photography (the before/after "before" image is a CSS-filtered version of the after image, for demo only)
- Domain in canonical / Open Graph / JSON-LD (`aureadental.com`)
- Social links in the footer (`#`)
