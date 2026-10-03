/* ==========================================================================
   Site content & configuration
   Single source of truth for clinic details, services, doctors, pricing,
   reviews and FAQs. Swap these values to rebrand the site.
   ========================================================================== */
(function () {
  "use strict";

  // Unsplash helper: auto=format serves AVIF/WebP where supported.
  const img = (id, w = 800, h) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ""}&q=70`;

  const CLINIC = {
    name: "Aurea",
    fullName: "Aurea Dental Studio",
    tagline: "Premium dental care, designed around you.",
    phone: "+91 98765 43210",
    phoneHref: "tel:+919876543210",
    whatsapp: "https://wa.me/919876543210?text=Hi%2C%20I%27d%20like%20to%20book%20an%20appointment.",
    email: "hello@aureadental.com",
    address: {
      line1: "Level 2, 48 Park Avenue",
      line2: "Indiranagar, Bengaluru 560038",
      full: "Level 2, 48 Park Avenue, Indiranagar, Bengaluru 560038",
    },
    mapsQuery: "Indiranagar, Bengaluru",
    hours: [
      { days: "Mon – Fri", time: "9:00 AM – 8:00 PM" },
      { days: "Saturday", time: "9:00 AM – 5:00 PM" },
      { days: "Sunday", time: "Emergencies only" },
    ],
    rating: 4.9,
    reviewCount: "1,200+",
    years: 15,
    patients: "18,000+",
    currency: "₹",
    bookingRefPrefix: "AUR",
  };
  CLINIC.directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CLINIC.address.full)}`;
  CLINIC.mapEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(CLINIC.mapsQuery)}&z=15&output=embed`;

  const IMAGES = {
    hero: img("1629909613654-28e377c37b09", 1100, 1300),
    treatment: img("1588776814546-daab30f310ce", 1000, 1150),
    scan3d: img("1600170311833-c2cf5280ce49", 1000, 800),
    xray: img("1588776814546-1ffcf47267a5", 800, 700),
    implant: img("1593022356769-11f762e25ed9", 800, 700),
    aligner: img("1609840114035-3c981b782dfe", 900, 700),
    smileClose: img("1606811971618-4486d14f3f99", 1200, 800),
    chair: img("1598256989800-fe5f95da9787", 900, 700),
    reception: img("1519494026892-80bbd2d6fd0d", 900, 700),
    clinicWide: img("1445527815219-ecbfec67492e", 900, 700),
    scanScreen: img("1666214280557-f1b5022eb634", 900, 700),
    toothbrush: img("1607613009820-a29f7bb81c04", 900, 700),
    mirror: img("1606265752439-1f18756aa5fc", 900, 700),
  };

  /* ---------------------------------------------------------------- Services */
  const SERVICES = [
    {
      id: "checkup",
      name: "General Checkups",
      icon: "stethoscope",
      short: "Thorough exams, gentle cleaning and early detection.",
      duration: 45,
      price: 999,
      image: IMAGES.mirror,
      lead: "A calm, thorough check-in for your teeth and gums, with a gentle clean and a clear plan.",
      involves:
        "We start with a conversation, not a drill. Your dentist examines your teeth, gums and bite, takes low-dose digital X-rays if needed, and gently cleans away plaque and tartar. You leave with a simple summary of your oral health and what, if anything, needs attention.",
      benefits: [
        ["shield-check", "Catch problems early", "Small issues are simpler, faster and cheaper to fix."],
        ["toothbrush-sparkles", "Fresher, cleaner smile", "Professional cleaning removes what brushing misses."],
        ["scan-line", "Low-dose digital X-rays", "Up to 90% less radiation than film."],
        ["clipboard-list", "A clear care plan", "No jargon. Just what you need and why."],
      ],
      steps: [
        ["Welcome & history", "We review your health history and any concerns."],
        ["Exam & imaging", "A full check of teeth, gums and bite, with X-rays if needed."],
        ["Gentle cleaning", "Scaling and polishing with ultrasonic tools."],
        ["Your plan", "We explain findings and next steps, in plain language."],
      ],
      faqs: [
        ["How often should I come in?", "Every six months works for most people. If you have gum concerns, we may suggest every three to four months."],
        ["Does cleaning hurt?", "Most patients find it comfortable. We use gentle ultrasonic tools and can numb sensitive areas on request."],
      ],
    },
    {
      id: "whitening",
      name: "Teeth Whitening",
      icon: "sparkles",
      short: "Brighter, even shades in a single visit.",
      duration: 75,
      price: 14999,
      image: IMAGES.smileClose,
      lead: "Up to eight shades brighter in about an hour, with care for sensitive teeth.",
      involves:
        "We protect your gums, apply a professional whitening gel and activate it with a cool LED light in short cycles. Your shade is measured before and after so you can see the difference. A take-home touch-up kit keeps results lasting.",
      benefits: [
        ["sparkles", "Visible results, fast", "Most patients go several shades lighter in one visit."],
        ["shield-check", "Enamel-safe formula", "Clinically tested gels with desensitising care."],
        ["sun", "Even, natural tone", "Shade-matched so it looks like you, only brighter."],
        ["timer", "Long-lasting", "Touch-up kit included to maintain your shade."],
      ],
      steps: [
        ["Shade check", "We record your starting shade and check for sensitivity."],
        ["Protection", "A barrier shields your gums and lips."],
        ["Whitening cycles", "Gel is applied and activated in three short rounds."],
        ["Aftercare", "You get a touch-up kit and simple care tips."],
      ],
      faqs: [
        ["Will my teeth feel sensitive?", "Some mild sensitivity can occur for 24–48 hours. We use desensitising gel to keep you comfortable."],
        ["How long do results last?", "Typically 12–24 months, longer with the touch-up kit and good habits."],
      ],
    },
    {
      id: "implants",
      name: "Dental Implants",
      icon: "drill",
      short: "Permanent, natural-looking tooth replacement.",
      duration: 90,
      price: 35000,
      image: IMAGES.implant,
      lead: "A permanent replacement that looks, feels and works like a natural tooth.",
      involves:
        "An implant is a small titanium post placed in the jaw, topped with a custom crown. We plan every implant with 3D imaging, so placement is precise and recovery is quicker. Most patients are surprised by how comfortable it is.",
      benefits: [
        ["badge-check", "Built to last", "With good care, implants can last a lifetime."],
        ["scan-line", "3D-guided placement", "Precise planning for a faster, gentler procedure."],
        ["face-slightly-smiling", "Natural look and feel", "Crowns are colour-matched to your smile."],
        ["shield", "Protects your jawbone", "Implants help prevent bone loss after a missing tooth."],
      ],
      steps: [
        ["3D consultation", "A CBCT scan maps your jaw for exact planning."],
        ["Implant placement", "A short, numbed procedure, often under an hour."],
        ["Healing", "The implant bonds with bone over 8–12 weeks."],
        ["Final crown", "Your custom crown is fitted and adjusted."],
      ],
      faqs: [
        ["Is the procedure painful?", "It's done under local anaesthetic. Most people describe mild soreness for a day or two, managed with regular painkillers."],
        ["Am I a candidate?", "Most healthy adults are. Your 3D consultation tells us exactly what's possible."],
      ],
    },
    {
      id: "aligners",
      name: "Invisalign / Clear Aligners",
      icon: "layers",
      short: "Straighter teeth with nearly invisible aligners.",
      duration: 60,
      price: 120000,
      image: IMAGES.aligner,
      lead: "Straighten your smile discreetly, with removable aligners planned digitally.",
      involves:
        "We scan your teeth in 3D (no messy moulds) and show you a preview of your future smile. You then wear a series of clear aligners, switching every one to two weeks, with quick check-ins along the way.",
      benefits: [
        ["eye-off", "Nearly invisible", "Most people won't notice you're wearing them."],
        ["scan-face", "See your result first", "A digital preview before you commit."],
        ["coffee", "Eat what you like", "Remove aligners for meals and brushing."],
        ["calendar-check", "Fewer visits", "Quick check-ins every 6–8 weeks."],
      ],
      steps: [
        ["3D scan", "A quick intraoral scan replaces impressions."],
        ["Smile preview", "See your projected result before starting."],
        ["Aligner series", "Wear each set 20–22 hours a day."],
        ["Retain", "Retainers keep your new smile in place."],
      ],
      faqs: [
        ["How long does treatment take?", "Mild cases can take 4–6 months. Most complete in 12–18 months."],
        ["Do aligners hurt?", "You may feel gentle pressure for a day or two with each new set. That means they're working."],
      ],
    },
    {
      id: "root-canal",
      name: "Root Canal Treatment",
      icon: "heart-pulse",
      short: "Pain relief that saves your natural tooth.",
      duration: 75,
      price: 6500,
      image: IMAGES.xray,
      lead: "Modern root canal care is calm, precise and usually done in a single visit.",
      involves:
        "When the inside of a tooth is infected, we gently clean it, disinfect it and seal it. Using rotary tools and magnification, the treatment feels much like a filling. It relieves pain and saves the tooth.",
      benefits: [
        ["heart-pulse", "Fast pain relief", "Removes the source of infection and pain."],
        ["shield-check", "Saves your tooth", "Keeps your natural tooth in place."],
        ["microscope", "Precision tools", "Magnification and rotary instruments for accuracy."],
        ["timer", "Often single-visit", "Most treatments are completed in one appointment."],
      ],
      steps: [
        ["Diagnosis", "X-rays confirm the cause and extent."],
        ["Numbing", "Local anaesthetic so you feel comfortable."],
        ["Clean & seal", "The canal is cleaned, shaped and sealed."],
        ["Restore", "A filling or crown protects the tooth."],
      ],
      faqs: [
        ["Is a root canal painful?", "With modern anaesthesia, it feels similar to having a filling. It's the infection that hurts, and treatment relieves it."],
        ["Will I need a crown?", "Back teeth usually benefit from a crown for strength. We'll advise based on your tooth."],
      ],
    },
    {
      id: "smile-makeover",
      name: "Smile Makeover",
      icon: "wand-sparkles",
      short: "A complete, personalised redesign of your smile.",
      duration: 60,
      price: 1500,
      priceLabel: "Consultation",
      image: IMAGES.smileClose,
      lead: "A tailored plan that combines treatments to create the smile you've always wanted.",
      involves:
        "We listen first. Then we photograph and scan your smile, and design your new look digitally. Your plan may combine whitening, veneers, aligners or bonding, all staged to fit your timeline and budget.",
      benefits: [
        ["scan-face", "Digital smile design", "Preview your new smile before treatment."],
        ["wand-sparkles", "Fully personalised", "Built around your face, goals and lifestyle."],
        ["wallet", "Flexible staging", "Spread treatment across visits and budgets."],
        ["users", "One coordinated team", "Specialists working together on your plan."],
      ],
      steps: [
        ["Consultation", "We talk through what you'd love to change."],
        ["Photos & scan", "Detailed records for digital design."],
        ["Smile preview", "See and refine your new smile on screen."],
        ["Treatment", "Your plan is carried out in comfortable stages."],
      ],
      faqs: [
        ["What does a makeover include?", "It's unique to you. Common elements are whitening, veneers, aligners and gum contouring."],
        ["Is the consultation fee adjusted?", "Yes. The consultation fee is credited toward your treatment if you go ahead."],
      ],
    },
    {
      id: "pediatric",
      name: "Pediatric Dentistry",
      icon: "baby",
      short: "Gentle, fun visits that build healthy habits.",
      duration: 30,
      price: 799,
      image: IMAGES.toothbrush,
      lead: "Kind, patient care that helps children feel at ease with the dentist.",
      involves:
        "Our child-friendly team uses simple words, gentle techniques and plenty of encouragement. We check growth and development, clean, and apply protective treatments like fluoride and sealants.",
      benefits: [
        ["face-slightly-smiling", "Calm, friendly visits", "We go at your child's pace."],
        ["shield", "Preventive care", "Fluoride and sealants to protect young teeth."],
        ["graduation-cap", "Healthy habits", "Brushing tips kids actually remember."],
        ["heart-handshake", "Parents welcome", "Stay with your child throughout the visit."],
      ],
      steps: [
        ["Meet & greet", "A relaxed introduction to the chair and tools."],
        ["Gentle check", "A look at teeth, gums and development."],
        ["Clean & protect", "Cleaning, fluoride and sealants if needed."],
        ["Reward", "Tips for home and a small reward for bravery."],
      ],
      faqs: [
        ["When should my child first visit?", "By their first birthday, or when the first tooth appears."],
        ["Can I stay in the room?", "Of course. Many children feel calmer with a parent nearby."],
      ],
    },
    {
      id: "veneers",
      name: "Cosmetic Veneers",
      icon: "gem",
      short: "Thin porcelain shells for a flawless finish.",
      duration: 90,
      price: 12000,
      priceLabel: "per tooth",
      image: IMAGES.chair,
      lead: "Ultra-thin porcelain veneers that correct shape, shade and spacing beautifully.",
      involves:
        "Veneers are thin, custom-made shells bonded to the front of your teeth. We design them digitally, let you test-drive the shape with a mock-up, and then fit your final veneers for a natural, radiant result.",
      benefits: [
        ["gem", "Natural translucency", "Porcelain reflects light like real enamel."],
        ["shield-check", "Stain-resistant", "Stays bright for years with simple care."],
        ["scan-face", "Try before you commit", "A mock-up lets you preview the look."],
        ["timer", "Fast transformation", "Typically complete in two to three visits."],
      ],
      steps: [
        ["Design", "Photos and scans for a digital smile design."],
        ["Mock-up", "Try your new shape before anything is final."],
        ["Preparation", "Minimal, conservative preparation of the teeth."],
        ["Bonding", "Final veneers fitted and polished."],
      ],
      faqs: [
        ["Do veneers damage teeth?", "We use minimal-prep techniques that preserve as much natural tooth as possible."],
        ["How long do veneers last?", "Porcelain veneers typically last 10–15 years or more with good care."],
      ],
    },
  ];

  // Bookable option that isn't a marketed service.
  const CONSULT = {
    id: "consultation",
    name: "Not sure? General consultation",
    icon: "circle-question-mark",
    short: "Tell us your concern and we'll guide you.",
    duration: 30,
    price: 500,
  };

  /* ----------------------------------------------------------------- Doctors */
  const DOCTORS = [
    {
      id: "meera-iyer",
      name: "Dr. Meera Iyer",
      role: "Cosmetic & Aesthetic Dentist",
      years: 14,
      quals: ["BDS", "MDS (Prosthodontics)", "Fellowship, Aesthetic Dentistry"],
      specialties: ["Veneers", "Smile makeovers", "Teeth whitening"],
      services: ["whitening", "smile-makeover", "veneers", "checkup"],
      languages: ["English", "Hindi", "Tamil"],
      photo: img("1559839734-2b71ea197ec2", 700, 820),
      bio: "Dr. Meera founded Aurea with one idea: dental care should feel as good as it looks. She is known for natural, understated smile design and an unhurried chairside manner. Outside the clinic she lectures on digital smile design.",
    },
    {
      id: "arjun-menon",
      name: "Dr. Arjun Menon",
      role: "Implantologist & Oral Surgeon",
      years: 12,
      quals: ["BDS", "MDS (Oral & Maxillofacial Surgery)", "ICOI Diplomate"],
      specialties: ["Dental implants", "Full-arch restoration", "Wisdom teeth"],
      services: ["implants", "checkup"],
      languages: ["English", "Malayalam", "Hindi"],
      photo: img("1612349317150-e413f6a5b16d", 700, 820),
      bio: "Dr. Arjun has placed over 3,000 implants using guided 3D surgery. Patients appreciate how clearly he explains each step, and how quickly they're back to normal.",
    },
    {
      id: "sara-thomas",
      name: "Dr. Sara Thomas",
      role: "Orthodontist & Pediatric Dentist",
      years: 10,
      quals: ["BDS", "MDS (Orthodontics)", "Certified Clear Aligner Provider"],
      specialties: ["Clear aligners", "Braces", "Children's dentistry"],
      services: ["aligners", "pediatric", "checkup"],
      languages: ["English", "Malayalam", "Kannada"],
      photo: img("1594824476967-48c8b964273f", 700, 820),
      bio: "Dr. Sara brings warmth and patience to every visit, whether she's planning aligners for an adult or meeting a nervous five-year-old for the first time.",
    },
    {
      id: "rahul-varma",
      name: "Dr. Rahul Varma",
      role: "Endodontist",
      years: 9,
      quals: ["BDS", "MDS (Conservative Dentistry & Endodontics)"],
      specialties: ["Root canal treatment", "Microscopic dentistry", "Emergency care"],
      services: ["root-canal", "checkup"],
      languages: ["English", "Hindi", "Telugu"],
      photo: img("1622253692010-333f2da6031d", 700, 820),
      bio: "Dr. Rahul specialises in saving natural teeth. Using microscope-guided techniques, he makes root canal treatment calm, precise and usually single-visit.",
    },
  ];

  /* ---------------------------------------------------------------- Pricing */
  const PRICING = [
    {
      id: "essential",
      name: "Essential Checkup",
      service: "checkup",
      price: 999,
      blurb: "Your complete six-monthly visit.",
      features: ["Comprehensive dental exam", "Scaling & polishing", "Digital X-rays if needed", "Personalised care plan"],
    },
    {
      id: "whitening",
      name: "Whitening Package",
      service: "whitening",
      price: 14999,
      popular: true,
      blurb: "In-clinic whitening plus home care.",
      features: ["Pre-whitening checkup & clean", "In-clinic LED whitening", "Take-home touch-up kit", "Free shade review at 3 months"],
    },
    {
      id: "makeover",
      name: "Smile Makeover Consultation",
      service: "smile-makeover",
      price: 1500,
      blurb: "Design your new smile, digitally.",
      features: ["60-minute specialist consultation", "3D scan & smile photography", "Digital smile preview", "Fee credited to treatment"],
    },
  ];

  /* ------------------------------------------------------------ Testimonials */
  const AVATAR = {
    a: img("1544005313-94ddf0286df2", 120, 120),
    b: img("1580489944761-15a19d654956", 120, 120),
    c: img("1607990281513-2c110a25bd8c", 120, 120),
    d: img("1537368910025-700350fe46c7", 120, 120),
  };
  const TESTIMONIALS = [
    { name: "Priya S.", avatar: AVATAR.a, rating: 5, treatment: "Teeth Whitening", doctor: "meera-iyer", quote: "I've always been nervous at the dentist. This felt more like a spa. My teeth are noticeably brighter and there was zero sensitivity." },
    { name: "Karthik R.", avatar: AVATAR.c, rating: 5, treatment: "Dental Implants", doctor: "arjun-menon", quote: "Dr. Arjun showed me the 3D plan before we started, so I knew exactly what would happen. Honestly easier than I expected." },
    { name: "Ananya M.", avatar: AVATAR.b, rating: 5, treatment: "Clear Aligners", doctor: "sara-thomas", quote: "Booked online in under a minute. Eight months later, my smile is straight and nobody even noticed the aligners." },
    { name: "Vikram P.", avatar: AVATAR.d, rating: 5, treatment: "Root Canal", doctor: "rahul-varma", quote: "Came in with terrible pain on a Saturday. Seen the same day, single visit, no pain at all. Can't recommend them enough." },
    { name: "Neha K.", avatar: null, rating: 5, treatment: "Pediatric Dentistry", doctor: "sara-thomas", quote: "My six-year-old actually asked when we're going back. That says everything." },
    { name: "Rohan D.", avatar: null, rating: 5, treatment: "Cosmetic Veneers", doctor: "meera-iyer", quote: "The mock-up let me try the shape first. The final veneers look completely natural. Worth every rupee." },
    { name: "Fatima A.", avatar: null, rating: 5, treatment: "General Checkup", doctor: "rahul-varma", quote: "Clean, calm and on time. They explained everything without any upselling. Finally found my dentist." },
  ];

  /* ------------------------------------------------------------------- FAQs */
  const FAQS = [
    ["Will my treatment be painful?", "We focus on comfort at every step: topical numbing before injections, gentle techniques, laser options and sedation for anxious patients. Most people tell us it was far easier than they expected."],
    ["How much will my treatment cost?", "We share clear, itemised estimates before any treatment begins. Starting prices are listed on our site, and there are never surprise charges."],
    ["Do you accept dental insurance?", "Yes. We work with most major insurers and can help with cashless claims or paperwork for reimbursement. Bring your policy details to your first visit."],
    ["What happens at my first visit?", "A relaxed 45-minute appointment: a conversation about your goals, a full exam, digital X-rays if needed and a clear plan. No pressure to start treatment on the day."],
    ["Do you handle dental emergencies?", "Yes. Call or WhatsApp us and we'll see you the same day wherever possible, including Sundays for urgent pain, swelling or injury."],
    ["What payment options are available?", "We accept cards, UPI, net banking and cash. 0% EMI plans are available on treatments above ₹10,000 through our finance partners."],
    ["Can I cancel or reschedule online?", "Yes. Use the link in your confirmation message or the patient portal. Cancellation is free up to 24 hours before your visit."],
  ];

  /* -------------------------------------------------------- Before / after */
  const CASES = [
    { label: "Teeth Whitening", detail: "1 visit · 7 shades brighter", image: img("1606811971618-4486d14f3f99", 1200, 760), pos: "50% 55%" },
    { label: "Clear Aligners", detail: "11 months · 24 aligners", image: img("1609840114035-3c981b782dfe", 1200, 760), pos: "50% 60%" },
    { label: "Smile Makeover", detail: "3 visits · veneers + whitening", image: img("1606811971618-4486d14f3f99", 1200, 760), pos: "35% 45%" },
    { label: "Cosmetic Bonding", detail: "1 visit · chip repair", image: img("1609840114035-3c981b782dfe", 1200, 760), pos: "60% 40%" },
  ];

  const LOGOS = [
    ["shield-check", "ISO 9001:2015"],
    ["badge-check", "Dental Council Certified"],
    ["layers", "Clear Aligner Provider"],
    ["heart-handshake", "HealthShield Insurance"],
    ["umbrella", "MediCover Cashless"],
    ["award", "Best Dental Studio 2025"],
  ];

  window.SITE = { CLINIC, IMAGES, SERVICES, CONSULT, DOCTORS, PRICING, TESTIMONIALS, FAQS, CASES, LOGOS, img };
})();
