/**
 * Single source of truth for event facts and brand details.
 *
 * Facts come from the official 2027 expo brochure ("Nepal Poultry 2027", November 2026),
 * the original website, and the expo's own 2017 banner photograph.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.nepalpoultryexpo.com").replace(/\/+$/, "");

export type Organisation = {
  name: string;
  shortName: string;
  logo?: { src: string; width: number; height: number };
  url?: string;
  description: string;
};

export type Contact = {
  name: string;
  organisation: string;
  phone: string;
  /** Digits only, with country code — for tel: and WhatsApp links. */
  phoneDigits: string;
  email: string;
};

export const siteConfig = {
  name: "Nepal Poultry & Livestock International Expo",
  shortName: "Nepal Poultry Expo",
  edition: 2027,
  tagline: "Your Gateway to Nepal's Poultry & Livestock Market",
  slogan: "Exhibit. Connect. Grow.",
  positioning:
    "A dedicated platform for poultry, feed, animal health, hatchery, farming equipment, processing and allied technologies.",
  description:
    "Nepal Poultry & Livestock International Expo 2027, 18–20 February 2027 at Bhrikuti Mandap, Kathmandu: the international B2B trade show for poultry, feed, animal health, hatchery, dairy, farm equipment and processing.",
  url: SITE_URL,
  locale: "en",

  logo: {
    src: "/logos/logo.png",
    white: "/logos/nepal-poultry-livestock-expo-logo-white.png",
    width: 602,
    height: 460,
  },

  event: {
    /** ISO dates — drive the Event structured data and the countdown. */
    startDate: "2027-02-18" as string | null,
    endDate: "2027-02-20" as string | null,
    /** Start of the opening day in Nepal time (UTC+05:45) — used for the countdown. */
    startsAt: "2027-02-18T00:00:00+05:45",
    datesLabel: "18–20 February 2027",
    datesShort: "18–20 Feb 2027",
    venue: {
      name: "Bhrikuti Mandap Exhibition Hall",
      shortName: "Bhrikuti Mandap",
      city: "Kathmandu",
      country: "Nepal",
      countryCode: "NP",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Bhrikuti+Mandap+Exhibition+Hall+Kathmandu",
    },
  },

  pastEditions: [
    {
      year: 2017,
      dates: "3–5 November 2017",
      venue: "Chitwan Expo Center, Bharatpur, Chitwan",
    },
  ],

organisers: [
  {
    name: "Futurex Trade Fair & Events Pvt. Ltd.",
    shortName: "Futurex",
    logo: {
      src: "/logos/futurex-trade-fair-and-events.png",
      width: 1536,
      height: 320,
    },
    description:
      "Based in New Delhi, Futurex organises international exhibitions, seminars and industry events. Its trade platforms connect manufacturers, suppliers and professional buyers, and support business networking and market development.",
  },
  {
    name: "Media Space Solutions Pvt. Ltd.",
    shortName: "Media Space",
    logo: {
      src: "/logos/media-space.png",
      width: 1536,
      height: 320,
    },
    description:
      "Based in Kathmandu, Media Space Solutions specialises in focused international exhibitions and event management. With local market knowledge and industry relationships, it connects Nepalese and international businesses and enables commercial collaboration.",
  },
] satisfies Organisation[],

promoters: [
  {
    name: "Government of Nepal, Ministry of Agriculture and Livestock Development",
    shortName: "MoALD",
    logo: {
      src: "/logos/government-of-nepal-emblem.png",
      width: 195,
      height: 173,
    },
    description: "National Agriculture Modernization Program.",
  },
] satisfies Organisation[],

supporters: [
  {
    name: "Nepal Poultry Federation",
    shortName: "NPF",
    logo: {
      src: "/logos/nepal-poultry-federation.webp",
      width: 418,
      height: 424,
    },
    description:
      "National federation representing Nepal's poultry sector.",
  },
  {
    name: "Nepal Feed Industry Association",
    shortName: "NFIA",
    logo: {
      src: "/logos/nepal-feed-industry-association.png",
      width: 159,
      height: 172,
    },
    description:
      "Association of Nepal's animal feed manufacturers (estd. 2046 BS).",
  },
] satisfies Organisation[],
 

  concurrentEvent: {
    name: "9th Nepal Agritech International Expo",
    shortName: "Nepal Agritech",
    logo: { src: "/logos/nepal-agritech-international-expo.png", width: 696, height: 188 },
    description: "Held alongside the poultry and livestock expo.",
  } satisfies Organisation,

  social: {
    facebook: "https://www.facebook.com/NepalPoultryExpo",
  },

  /** "Please contact for more info" — from the 2027 brochure. */
  contacts: [
    {
      name: "Mr. Namit Gupta",
      organisation: "Futurex Trade Fair & Events Pvt. Ltd.",
      phone: "+91 98108 55697",
      phoneDigits: "919810855697",
      email: "namit@futurextrade.com",
    },
    {
      name: "Mr. Srijal Bhattarai",
      organisation: "Media Space Solutions Pvt. Ltd.",
      phone: "+977 980-1171141",
      phoneDigits: "9779801171141",
      email: "info@mss.com.np",
    },
  ] satisfies Contact[],

  /** Last date the page copy was reviewed — used for sitemap lastModified. */
  contentUpdated: "2026-11-24",
} as const;

export type NavItem = {
  label: string;
  href: string;
  description?: string;
  children?: { label: string; href: string; description?: string }[];
};

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "About the Expo", href: "/about", description: "The 2027 edition and why Nepal" },
      { label: "Organisers & Partners", href: "/about/organizers", description: "Organisers, promoters and supporters" },
    ],
  },
  {
    label: "Exhibitors",
    href: "/exhibitors",
    children: [
      { label: "Why Exhibit", href: "/exhibitors", description: "Benefits and who should exhibit" },
      { label: "Book a Stand", href: "/register/exhibitor", description: "Exhibitor registration" },
      { label: "Expo Brochure", href: "/brochure", description: "Download the 2027 brochure" },
    ],
  },
  {
    label: "Visitors",
    href: "/visitors",
    children: [
      { label: "Why Visit", href: "/visitors", description: "Who you will meet at the expo" },
      { label: "Register to Visit", href: "/register/visitor", description: "Visitor registration" },
    ],
  },
  { label: "Media", href: "/media" },
  { label: "Contact", href: "/contact" },
];

export const footerNav = {
  explore: [
    { label: "About the Expo", href: "/about" },
    { label: "Organisers & Partners", href: "/about/organizers" },
    { label: "Exhibitors", href: "/exhibitors" },
    { label: "Visitors", href: "/visitors" },
    { label: "Media & Gallery", href: "/media" },
    { label: "Contact", href: "/contact" },
  ],
  participate: [
    { label: "Book a Stand", href: "/register/exhibitor" },
    { label: "Register to Visit", href: "/register/visitor" },
    { label: "Download the Brochure", href: "/brochure" },
    { label: "Send an Enquiry", href: "/contact" },
  ],
};
