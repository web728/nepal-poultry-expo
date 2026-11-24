/**
 * Page copy. The 2027 lists and descriptions follow the official expo brochure
 * ("Nepal Poultry 2027"); a few supporting lists come from the original website.
 *
 * Industry figures are kept separate from event information and each carries its source.
 */
import type { ComponentType, SVGProps } from "react";
import {
  AnimalHealthIcon,
  EquipmentIcon,
  FarmTechIcon,
  FeedIcon,
  LivestockIcon,
  ProcessingIcon,
} from "@/components/icons";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

export const ABOUT_COPY = {
  heading: "Connecting industry. Creating opportunities.",
  lead: "Nepal Poultry & Livestock International Expo 2027 is a dedicated international B2B trade exhibition bringing together manufacturers, suppliers, technology providers, entrepreneurs and industry professionals across the poultry and livestock value chain.",
  body: "The expo showcases farming equipment, feed and nutrition, animal health, breeding, dairy and processing technologies. It offers domestic and international companies a focused platform to explore the Nepalese market, develop distribution networks and build lasting business relationships.",
};

export const WHY_NEPAL = {
  heading: "Why Nepal?",
  subheading: "An established industry. New business possibilities.",
  body: "Nepal has a broad ecosystem of commercial farms, hatcheries, feed manufacturers, dairy enterprises, veterinary services and processors. Demand for greater productivity, farm efficiency, reliable nutrition, animal health and modern processing creates opportunities for technology and service providers.",
};

export type IndustryFact = { value: string; label: string; source: "nso" | "brochure" };

/** The four figures printed in the 2027 brochure. */
export const INDUSTRY_FACTS: IndustryFact[] = [
  { value: "22,928", label: "Commercial poultry farms", source: "nso" },
  { value: "15.95M", label: "Goats", source: "brochure" },
  { value: "5.14M", label: "Cattle", source: "brochure" },
  { value: "NPR 60.96B", label: "Poultry meat sales a year", source: "nso" },
];

export const INDUSTRY_SOURCES = {
  nso: {
    text: "Commercial poultry farms and poultry meat sales: National Statistics Office, Nepal Commercial Poultry Survey 2081/82 (reference period January–December 2024), reported by The Kathmandu Post, 20 March 2026.",
    url: "https://kathmandupost.com/money/2026/03/20/poultry-sector-adds-over-rs60-96-billion-to-nepal-s-economy-annually",
  },
  brochure: { text: "Goat and cattle numbers: as published in the official 2027 expo brochure." },
};

export type Opportunity = { title: string; body: string; image: string };

/** "Explore opportunities across the industry" (brochure p.2). */
export const OPPORTUNITIES: Opportunity[] = [
  {
    title: "Farm modernisation",
    body: "Housing, automated feeding, ventilation, climate control and farm management.",
    image: "gallery/2017-chitwan/poultry-84.jpg",
  },
  {
    title: "Feed & nutrition",
    body: "Ingredients, additives, premixes, supplements and feed production systems.",
    image: "gallery/2017-chitwan/poultry-42.jpg",
  },
  {
    title: "Animal health & breeding",
    body: "Veterinary products, diagnostics, biosecurity, breeding and reproductive technologies.",
    image: "gallery/2017-chitwan/poultry-36.jpg",
  },
  {
    title: "Dairy & processing",
    body: "Milking systems, meat and egg processing, packaging, refrigeration and cold chain.",
    image: "brand/modern-livestock-and-poultry-farm.jpg",
  },
];

export type Segment = { id: string; title: string; body: string; Icon: Icon };

/** "Who should exhibit? — Showcase solutions across the complete poultry & livestock value chain" (brochure p.3). */
export const SEGMENTS: Segment[] = [
  {
    id: "poultry-farming-hatchery",
    title: "Poultry farming & hatchery",
    body: "Housing, cages, feeders, drinkers, incubators, hatchery automation, brooding, ventilation and climate control.",
    Icon: EquipmentIcon,
  },
  {
    id: "feed-nutrition-machinery",
    title: "Feed, nutrition & machinery",
    body: "Feed, ingredients, additives, premixes, supplements, feed mills, mixers, silos and storage.",
    Icon: FeedIcon,
  },
  {
    id: "animal-health-biosecurity",
    title: "Animal health & biosecurity",
    body: "Veterinary medicines, vaccines, diagnostics, laboratories, sanitation and disease prevention.",
    Icon: AnimalHealthIcon,
  },
  {
    id: "dairy-meat-egg-processing",
    title: "Dairy, meat & egg processing",
    body: "Milk chilling and testing, UHT, meat processing, egg grading, filling and packaging.",
    Icon: ProcessingIcon,
  },
  {
    id: "livestock-dairy-farm",
    title: "Livestock & dairy farm",
    body: "Livestock housing, handling and watering equipment; milking machines, milk storage and farm management.",
    Icon: LivestockIcon,
  },
  {
    id: "automation-allied-services",
    title: "Automation & allied services",
    body: "Farm software, refrigeration, cold storage, waste management, biomass energy and consultancy.",
    Icon: FarmTechIcon,
  },
];

export type Benefit = { title: string; body: string };

/** "Why exhibit?" (brochure p.4). */
export const EXHIBITOR_BENEFITS: Benefit[] = [
  { title: "Market access", body: "Connect with prospective Nepalese buyers and business partners." },
  { title: "Business networking", body: "Meet farmers, importers, distributors and industry professionals." },
  { title: "Product & technology showcase", body: "Introduce equipment, machinery and new solutions." },
  { title: "Distribution & expansion", body: "Identify potential dealers, agents and strategic partners." },
  { title: "Brand visibility", body: "Build awareness among relevant trade audiences." },
  { title: "Business development", body: "Understand buyer needs and develop potential business leads." },
];

export const VISITOR_BENEFITS: Benefit[] = [
  {
    title: "Compare suppliers side by side",
    body: "See feed, health products and equipment from many suppliers in one visit and compare quality, specifications and prices.",
  },
  {
    title: "See equipment working up close",
    body: "Inspect feeders, drinkers, cages, incubators, milking and processing machinery and talk to the people who build them.",
  },
  {
    title: "Practical know-how",
    body: "Pick up advice on biosecurity, nutrition, breeding, disease prevention and farm management you can apply straight away.",
  },
  {
    title: "Meet international suppliers",
    body: "Domestic and international companies come to Kathmandu looking for Nepalese buyers, dealers and partners.",
  },
  {
    title: "Market insight",
    body: "Understand where the industry is heading — new products, new entrants and changing costs.",
  },
  {
    title: "New products first",
    body: "Discover feed, animal health, hatchery and dairy brands that are new to the Nepalese market.",
  },
];

export type VisitorGroup = { title: string; body: string };

/** "Who will you connect with? — Target trade visitor profile" (brochure p.3). */
export const VISITOR_GROUPS: VisitorGroup[] = [
  { title: "Farmers & farm owners", body: "Poultry, dairy and livestock farmers; hatchery owners, farm managers and integrators." },
  { title: "Processors & buyers", body: "Dairy processors, meat and egg businesses, cold-chain and food-service buyers." },
  { title: "Trade & distribution", body: "Importers, dealers, distributors, wholesalers and procurement professionals." },
  { title: "Government & research", body: "Relevant government agencies, universities, researchers and quality control." },
  { title: "Industry entrepreneurs", body: "Poultry, livestock, dairy, feed and animal husbandry businesses." },
  { title: "Associations & cooperatives", body: "Industry associations, dairy cooperatives and cooperative federations." },
  { title: "Veterinary & technical", body: "Veterinarians, clinics, animal-health specialists and technical consultants." },
  { title: "Financial & business", body: "Investors, banks, insurance providers and agribusiness consultants." },
];

/** Category ticker (CSS marquee) — the brochure's exhibit categories in short form. */
export const TICKER = [
  "Poultry farming",
  "Hatchery",
  "Feed & nutrition",
  "Feed machinery",
  "Animal health",
  "Biosecurity",
  "Breeding",
  "Dairy",
  "Meat & egg processing",
  "Cold chain",
  "Farm automation",
  "Livestock equipment",
];

/** Growth drivers listed on the original "About Expo" page. */
export const GROWTH_DRIVERS: string[] = [
  "Production and productivity are trending upward",
  "Consumers increasingly favour white meat",
  "Poultry remains one of the most affordable animal proteins",
  "Tourism and rapid urbanisation are lifting demand",
  "Food habits in urban households are changing",
];

/** Gaps listed on the original "About Expo" page — what the expo helps address. */
export const MARKET_GAPS: string[] = [
  "A regular supply of quality chicks at competitive prices",
  "Reliable information on manufacturers, pricing, feed, medication and veterinary services",
  "Farmer knowledge of biosecurity, production and marketing",
  "Price and quality competitiveness against informal imports",
  "Quality standards adopted at every stage of production and distribution",
  "Slaughterhouses and processors delivering safe, hygienic poultry products",
];
