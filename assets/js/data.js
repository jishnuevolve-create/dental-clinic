/* ==========================================================================
   Site content & configuration
   Single source of truth for clinic details, services, doctors, pricing,
   reviews and FAQs. Swap these values to rebrand the site.
   Content source: www.madentalcare.in (MA Dental Care, Mukkam & Mavoor).
   ========================================================================== */
(function () {
  "use strict";

  // Unsplash helper: auto=format serves AVIF/WebP where supported.
  const img = (id, w = 800, h) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ""}&q=70`;

  const CLINIC = {
    name: "MA Dental",
    fullName: "MA Dental Care",
    tagline: "Transforming smiles, ensuring oral health.",
    phone: "+91 85890 40202",
    phoneHref: "tel:+918589040202",
    // TODO: confirm with client — their site lists no WhatsApp number; using the Mukkam phone line.
    whatsapp: "https://wa.me/918589040202?text=Hi%2C%20I%27d%20like%20to%20book%20an%20appointment%20at%20MA%20Dental%20Care.",
    email: "info@madentalcare.in",
    careersEmail: "madentalcare@gmail.com",
    address: {
      line1: "Near Mukkam Bridge, Areacode Road",
      line2: "Mukkam, Calicut, Kerala",
      full: "Near Mukkam Bridge, Areacode Road, Mukkam, Calicut, Kerala",
    },
    // Second branch.
    branches: [
      {
        name: "Mukkam",
        address: "Near Mukkam Bridge, Areacode Road, Mukkam",
        phone: "+91 85890 40202",
        phoneHref: "tel:+918589040202",
        directions: "https://www.google.com/maps/dir/?api=1&destination=MA%20Dental%20Care%2C%20Areacode%20Road%2C%20Mukkam",
      },
      {
        name: "Mavoor",
        address: "Near Mavoor Bus Stand, Mavoor, Calicut",
        phone: "+91 9747 730 403",
        phoneHref: "tel:+919747730403",
        directions: "https://www.google.com/maps/dir/?api=1&destination=Near%20Mavoor%20Bus%20Stand%2C%20Mavoor%2C%20Calicut",
      },
    ],
    // TODO: confirm with client — opening hours are not listed on their current site.
    hours: [
      { days: "Mon – Sat", time: "Call to confirm" },
      { days: "Sunday", time: "Call to confirm" },
    ],
    satisfiedClients: "3,400+",
    dentists: 10,
    currency: "₹",
    bookingRefPrefix: "MAD",
  };
  CLINIC.directions = CLINIC.branches[0].directions;
  // Exact Google Maps listing for "MA Dental Care", Mukkam (from the client's site).
  CLINIC.mapEmbed = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3912.207229406591!2d75.99385061129178!3d11.319558548893006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba6422aa3c4c4d7%3A0x977b52fe27d7e5fa!2sMA%20Dental%20Care!5e0!3m2!1sen!2sin!4v1701631233564!5m2!1sen!2sin";

  // Client has no clinic/treatment photography yet; Unsplash images are kept as stand-ins.
  // TODO: confirm with client — replace with real clinic photos.
  const IMAGES = {
    hero: "assets/img/dr-ahammed-jamal-portrait.jpg",
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

  /* ---------------------------------------------------------------- Services
     Departments as listed on madentalcare.in. Treatment descriptions are general
     patient education. Prices are not published by the client, so `price` is null
     ("Price on consultation").
     TODO: confirm with client — visit durations (used by the booking calendar) and prices. */
  const SERVICES = [
    {
      id: "general",
      name: "General Dentistry",
      icon: "stethoscope",
      short: "Checkups, teeth cleaning and fillings for everyday oral health.",
      duration: 30,
      price: null,
      image: IMAGES.mirror,
      lead: "Routine checkups, professional teeth cleaning and fillings that keep your smile healthy.",
      involves:
        "Your dentist examines your teeth, gums and bite, cleans away plaque and tartar, and treats small problems like cavities before they grow. You leave with a clear picture of your oral health and what, if anything, needs attention.",
      benefits: [
        ["shield-check", "Catch problems early", "Small issues are simpler to treat when found early."],
        ["toothbrush-sparkles", "Professional cleaning", "Removes the plaque and tartar that brushing misses."],
        ["clipboard-list", "A clear care plan", "Findings and next steps explained in plain language."],
        ["heart-handshake", "Care for the whole family", "Routine dental care for patients of all ages."],
      ],
      steps: [
        ["Consultation", "We listen to your concerns and review your history."],
        ["Examination", "A full check of your teeth, gums and bite."],
        ["Cleaning", "Scaling and polishing to remove plaque and tartar."],
        ["Your plan", "We explain findings and any treatment you need."],
      ],
      faqs: [
        ["How often should I have a checkup?", "Most people benefit from a checkup and cleaning every six months. Your dentist may suggest a different interval based on your oral health."],
        ["Does teeth cleaning hurt?", "Most patients find it comfortable. Let your dentist know if any area feels sensitive."],
      ],
    },
    {
      id: "cosmetic",
      name: "Cosmetic Dentistry",
      icon: "sparkles",
      short: "Teeth whitening and smile enhancements for a confident smile.",
      duration: 45,
      price: null,
      image: IMAGES.smileClose,
      lead: "Treatments that improve the colour, shape and overall look of your smile.",
      involves:
        "Cosmetic dentistry focuses on how your smile looks. Depending on your goals, your dentist may recommend teeth whitening, tooth-coloured restorations or other enhancements, planned around your natural features.",
      benefits: [
        ["sparkles", "A brighter smile", "Teeth whitening lifts stains and discolouration."],
        ["face-slightly-smiling", "Natural-looking results", "Treatment planned around your face and features."],
        ["wand-sparkles", "Personalised approach", "Options chosen to suit your goals."],
        ["heart", "Smile with confidence", "Feel good about your smile again."],
      ],
      steps: [
        ["Consultation", "We discuss what you'd like to change."],
        ["Assessment", "Your dentist checks teeth and gums are healthy first."],
        ["Treatment", "Your chosen cosmetic treatment is carried out."],
        ["Aftercare", "Simple tips to keep your results looking their best."],
      ],
      faqs: [
        ["Is teeth whitening safe?", "When done under a dentist's supervision, whitening is a safe way to brighten teeth. Your dentist will check your teeth and gums first."],
        ["Which cosmetic treatment is right for me?", "It depends on your teeth and your goals. Your dentist will explain the options at your consultation."],
      ],
    },
    {
      id: "orthodontics",
      name: "Orthodontics",
      icon: "layers",
      short: "Straighten teeth and correct your bite with braces or aligners.",
      duration: 45,
      price: null,
      image: IMAGES.aligner,
      lead: "Straighter teeth and a healthier bite, for children, teens and adults.",
      involves:
        "Orthodontic treatment gently moves teeth into better positions over time. Your dentist assesses your teeth and bite and recommends the right appliance for you, with regular reviews to track progress.",
      benefits: [
        ["smile", "Straighter smile", "Aligned teeth look great and are easier to clean."],
        ["shield", "Healthier bite", "Correcting the bite can reduce uneven wear."],
        ["calendar-check", "Planned progress", "Regular reviews keep treatment on track."],
        ["users", "For all ages", "Treatment options for children and adults."],
      ],
      steps: [
        ["Assessment", "We examine your teeth, jaw and bite."],
        ["Treatment plan", "Your options are explained, with expected timelines."],
        ["Active treatment", "Braces or aligners gradually move your teeth."],
        ["Retention", "Retainers help keep your new smile in place."],
      ],
      faqs: [
        ["How long does orthodontic treatment take?", "It varies from person to person. Your dentist will give you an estimate after your assessment."],
        ["Am I too old for braces?", "No. Adults can benefit from orthodontic treatment too."],
      ],
    },
    {
      id: "oral-surgery",
      name: "Oral Surgery",
      icon: "syringe",
      short: "Extractions, wisdom teeth and surgical procedures, with care.",
      duration: 60,
      price: null,
      image: IMAGES.xray,
      lead: "Surgical dental care, including tooth extractions and wisdom tooth removal.",
      involves:
        "Oral surgery covers procedures such as removing damaged or impacted teeth, including wisdom teeth. Your dentist explains each step beforehand and uses local anaesthesia to keep you comfortable.",
      benefits: [
        ["heart-pulse", "Relief from pain", "Treats the source of pain and infection."],
        ["clipboard-list", "Explained in advance", "You know what to expect before treatment."],
        ["shield-check", "Comfort first", "Local anaesthesia for a comfortable procedure."],
        ["calendar-check", "Aftercare support", "Clear instructions for a smooth recovery."],
      ],
      steps: [
        ["Diagnosis", "Examination and X-rays to plan treatment."],
        ["Preparation", "Local anaesthesia to keep you comfortable."],
        ["Procedure", "The tooth or tissue is treated with care."],
        ["Recovery", "Aftercare advice and a follow-up if needed."],
      ],
      faqs: [
        ["Do wisdom teeth always need removal?", "Not always. Your dentist will advise removal if a wisdom tooth is causing pain, infection or other problems."],
        ["How long is recovery?", "It depends on the procedure. Your dentist will give you aftercare instructions and tell you what to expect."],
      ],
    },
    {
      id: "pediatric",
      name: "Pediatric Dentistry",
      icon: "baby",
      short: "Gentle dental care that helps children build healthy habits.",
      duration: 30,
      price: null,
      image: IMAGES.toothbrush,
      lead: "Kind, patient dental care that helps children feel at ease.",
      involves:
        "Children's dental visits focus on gentle checkups, cleaning and preventive care, with simple explanations so kids know what's happening. We also share tips to help parents look after their child's teeth at home.",
      benefits: [
        ["face-slightly-smiling", "Calm, friendly visits", "We go at your child's pace."],
        ["shield", "Preventive care", "Protecting young teeth from decay."],
        ["graduation-cap", "Healthy habits", "Brushing tips for children and parents."],
        ["heart-handshake", "Parents welcome", "Stay with your child during the visit."],
      ],
      steps: [
        ["Meet & greet", "A relaxed introduction to the chair and tools."],
        ["Gentle check", "A look at teeth, gums and development."],
        ["Clean & protect", "Cleaning and preventive care if needed."],
        ["Home care", "Simple tips for brushing and diet."],
      ],
      faqs: [
        ["When should my child first visit?", "Around their first birthday, or when the first tooth appears."],
        ["Can I stay in the room?", "Yes. Many children feel calmer with a parent nearby."],
      ],
    },
    {
      id: "periodontics",
      name: "Periodontics",
      icon: "shield-plus",
      short: "Treatment for gum disease, bleeding gums and gum health.",
      duration: 45,
      price: null,
      image: IMAGES.chair,
      lead: "Healthy gums are the foundation of a healthy smile.",
      involves:
        "Periodontal care treats gum problems such as bleeding, swelling and gum disease. Treatment usually begins with a thorough cleaning below the gum line, followed by a plan to keep your gums healthy.",
      benefits: [
        ["shield-check", "Protects your teeth", "Healthy gums help keep teeth secure."],
        ["droplet", "Stops bleeding gums", "Treats the cause of gum inflammation."],
        ["wind", "Fresher breath", "Removes bacteria that cause bad breath."],
        ["calendar-check", "Ongoing care", "Regular reviews to maintain gum health."],
      ],
      steps: [
        ["Gum assessment", "We check your gums for signs of disease."],
        ["Deep cleaning", "Plaque and tartar removed from below the gum line."],
        ["Treatment", "Further care if needed, explained clearly."],
        ["Maintenance", "Regular cleanings to keep gums healthy."],
      ],
      faqs: [
        ["Are bleeding gums serious?", "Bleeding gums are often an early sign of gum disease. It's best to have them checked early, when treatment is simplest."],
        ["Can gum disease be treated?", "Yes. Early gum disease can usually be managed with professional cleaning and good home care."],
      ],
    },
    {
      id: "prosthodontics",
      name: "Prosthodontics",
      icon: "crown",
      short: "Crowns, bridges, dentures and implants to restore your smile.",
      duration: 60,
      price: null,
      image: IMAGES.implant,
      lead: "Restore missing or damaged teeth with crowns, bridges, dentures and implants.",
      involves:
        "Prosthodontics replaces or repairs teeth so you can eat, speak and smile comfortably. Your dentist will recommend the right option for you, whether that's a dental crown, a bridge, dentures or a dental implant.",
      benefits: [
        ["badge-check", "Restores function", "Chew and speak with confidence again."],
        ["face-slightly-smiling", "Natural appearance", "Restorations matched to your smile."],
        ["layers", "Range of options", "Crowns, bridges, dentures and implants."],
        ["shield", "Protects your teeth", "Crowns strengthen weakened teeth."],
      ],
      steps: [
        ["Consultation", "We assess your teeth and discuss options."],
        ["Planning", "The right restoration is chosen with you."],
        ["Preparation", "Teeth are prepared and impressions taken."],
        ["Fitting", "Your restoration is fitted and adjusted."],
      ],
      faqs: [
        ["What is the difference between a crown and a bridge?", "A crown covers and strengthens a single tooth. A bridge replaces one or more missing teeth by anchoring to the teeth beside the gap."],
        ["Am I suitable for dental implants?", "Your dentist will assess your oral health to advise whether an implant is right for you."],
      ],
    },
    {
      id: "root-canal",
      name: "Root Canal Treatment",
      icon: "heart-pulse",
      short: "Relieve tooth pain and save your natural tooth.",
      duration: 60,
      price: null,
      image: IMAGES.scanScreen,
      lead: "Relieve pain from an infected tooth and keep your natural tooth.",
      involves:
        "When the inside of a tooth becomes infected, root canal treatment cleans, disinfects and seals it. It relieves pain and saves the tooth. Your dentist will advise whether a crown is needed afterwards.",
      benefits: [
        ["heart-pulse", "Pain relief", "Removes the source of infection and pain."],
        ["shield-check", "Saves your tooth", "Keeps your natural tooth in place."],
        ["clipboard-list", "Clear explanation", "Every step explained before treatment."],
        ["crown", "Restored strength", "A filling or crown protects the treated tooth."],
      ],
      steps: [
        ["Diagnosis", "Examination and X-rays confirm the cause."],
        ["Numbing", "Local anaesthetic keeps you comfortable."],
        ["Clean & seal", "The canal is cleaned, shaped and sealed."],
        ["Restore", "A filling or crown protects the tooth."],
      ],
      faqs: [
        ["Is a root canal painful?", "With local anaesthesia, most patients find it similar to having a filling. It's the infection that causes pain, and treatment relieves it."],
        ["Will I need a crown?", "Often, especially for back teeth. Your dentist will advise based on your tooth."],
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
    price: null,
  };

  /* ----------------------------------------------------------------- Doctors
     Names and roles from madentalcare.in.
     TODO: confirm with client — qualifications, years of experience, languages,
     specialisations and bios are not on their site, so they are left empty here. */
  const ALL = SERVICES.map((s) => s.id);
  const doctor = (id, name, role, photo, short) => ({
    id,
    name,
    short, // used on "Book with …" buttons when the first two words don't read well

    role,
    years: null,
    quals: [],
    specialties: [],
    services: ALL,
    languages: [],
    photo: `assets/img/doctors/${photo}`,
    bio: `${name} is a ${role} at MA Dental Care, part of the team that blends expertise with compassion to give every patient personalised care.`,
  });
  const DOCTORS = [
    doctor("ma-ahammed-jamal", "Dr. MA. Ahammed Jamal", "Chief Dental Surgeon", "dr-ma-ahammed-jamal.jpg", "Dr. Ahammed Jamal"),
    doctor("shabna-jamal", "Dr. Shabna Jamal", "Chief Dental Surgeon", "dr-shabna-jamal.jpg"),
    doctor("nabeel-marakkar", "Dr. Nabeel Marakkar", "Dental Surgeon", "dr-nabeel-marakkar.jpg"),
    doctor("shadiya-mk", "Dr. Shadiya MK", "Dental Surgeon", "dr-shadiya-mk.jpg"),
    doctor("rizwan-naha", "Dr. Rizwan Naha", "Dental Surgeon", "dr-rizwan-naha.jpg"),
    doctor("dilna", "Dr. Dilna", "Dental Surgeon", "dr-dilna.jpg"),
    doctor("chanchalesh", "Dr. Chanchalesh", "Dental Surgeon", "dr-chanchalesh.jpg"),
    doctor("shazeeha-sidhiq", "Dr. Shazeeha Sidhiq", "Dental Surgeon", "dr-shazeeha-sidhiq.jpg"),
    doctor("alka-dinesh", "Dr. Alka Dinesh", "Dental Surgeon", "dr-alka-dinesh.jpg"),
    doctor("jithin-joseph", "Dr. Jithin Joseph", "Dental Surgeon", "dr-jithin-joseph.jpg"),
  ];

  /* ---------------------------------------------------------------- Pricing
     TODO: confirm with client — no packages or prices are published. These are
     placeholder package outlines with "price on consultation". */
  const PRICING = [
    {
      id: "checkup",
      name: "Checkup & Cleaning",
      service: "general",
      price: null,
      blurb: "Your routine visit for healthy teeth and gums.",
      features: ["Complete dental examination", "Professional teeth cleaning", "Advice on home care", "Clear treatment plan if needed"],
    },
    {
      id: "smile",
      name: "Smile Consultation",
      service: "cosmetic",
      price: null,
      popular: true,
      blurb: "Explore cosmetic options for your smile.",
      features: ["One-to-one consultation", "Whitening and cosmetic options", "Personalised recommendations", "Estimate before treatment"],
    },
    {
      id: "restore",
      name: "Tooth Replacement Consultation",
      service: "prosthodontics",
      price: null,
      blurb: "Options for missing or damaged teeth.",
      features: ["Assessment of your teeth", "Crowns, bridges, dentures or implants", "Options explained clearly", "Estimate before treatment"],
    },
  ];

  /* ------------------------------------------------------------ Testimonials
     From madentalcare.in. Star ratings are not shown on the client's site. */
  const TESTIMONIALS = [
    { name: "Latheef KT", avatar: null, rating: null, treatment: "Mukkam, Calicut", doctor: null, quote: "MA Dental Care is the best and first destination for dental treatment. You get every level of treatment from skilled, experienced dentists, right in Mukkam city near the Koyilandy–Edavanna state highway. Choose first, get first-quality treatment." },
    { name: "Bins Abraham", avatar: null, rating: null, treatment: "Thiruvambadi, Calicut", doctor: null, quote: "I am so grateful for the care I received at MA Dental Care. The entire team, from reception to dentists, are caring professionals who prioritise patient comfort. The clinic's modern facilities and advanced technology made my dental procedures smooth and efficient." },
    { name: "Fathima Dilna", avatar: null, rating: null, treatment: "NIT, Calicut", doctor: null, quote: "MA Dental Care exceeded my expectations. The personalised approach to my dental needs made me feel valued as a patient. The results of my cosmetic procedure were transformative, and the dentists made sure I was informed and comfortable throughout." },
  ];

  /* ------------------------------------------------------------------- FAQs
     TODO: confirm with client — general answers; check payment, insurance and emergency policies. */
  const FAQS = [
    ["Which treatments do you offer?", "We offer general dentistry, cosmetic dentistry, orthodontics, oral surgery, pediatric dentistry, periodontics and prosthodontics, including root canal treatment, crowns, dentures, implants and teeth whitening."],
    ["Where are your clinics?", "We have two clinics in Calicut: near Mukkam Bridge on Areacode Road, Mukkam, and near Mavoor Bus Stand, Mavoor."],
    ["How much will my treatment cost?", "Costs depend on your needs. Your dentist will explain your options and the expected cost before any treatment begins."],
    ["What happens at my first visit?", "Your dentist talks through your concerns, examines your teeth and gums, and explains a clear plan. There's no pressure to start treatment on the day."],
    ["Do you handle dental emergencies?", "Yes. If you're in pain or need urgent care, call us on +91 85890 40202 (Mukkam) or +91 9747 730 403 (Mavoor)."],
    ["How do I book an appointment?", "Book online in under a minute, or call either clinic. You can also reschedule or cancel online."],
  ];

  /* -------------------------------------------------------- Before / after
     TODO: confirm with client — illustrative stock images; replace with real patient cases (with consent). */
  const CASES = [
    { label: "Teeth Whitening", detail: "Cosmetic Dentistry", image: img("1606811971618-4486d14f3f99", 1200, 760), pos: "50% 55%" },
    { label: "Orthodontics", detail: "Straighter teeth", image: img("1609840114035-3c981b782dfe", 1200, 760), pos: "50% 60%" },
    { label: "Smile Enhancement", detail: "Cosmetic Dentistry", image: img("1606811971618-4486d14f3f99", 1200, 760), pos: "35% 45%" },
    { label: "Prosthodontics", detail: "Restored teeth", image: img("1609840114035-3c981b782dfe", 1200, 760), pos: "60% 40%" },
  ];

  // Departments marquee (trust strip).
  const LOGOS = [
    ["stethoscope", "General Dentistry"],
    ["sparkles", "Cosmetic Dentistry"],
    ["layers", "Orthodontics"],
    ["syringe", "Oral Surgery"],
    ["baby", "Pediatric Dentistry"],
    ["shield-plus", "Periodontics"],
    ["crown", "Prosthodontics"],
  ];

  window.SITE = { CLINIC, IMAGES, SERVICES, CONSULT, DOCTORS, PRICING, TESTIMONIALS, FAQS, CASES, LOGOS, img };
})();
