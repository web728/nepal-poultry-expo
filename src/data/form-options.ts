export const BOOTH_SIZES = [
  "Not decided / Discuss with team",
  "9 sqm",
  "12 sqm",
  "18 sqm",
  "24 sqm",
  "36 sqm",
  "48 sqm",
  "54 sqm",
  "72 sqm",
  "90 sqm+",
] as const;

export const AREAS_OF_INTEREST = [
  "Exhibiting",
  "Visiting",
  "Association / Partner",
  "Media",
  "General Enquiry",
] as const;

/** Visitor "Business / Category" options, derived from the expo's published visitor profile. */
export const BUSINESS_CATEGORIES = [
  "Poultry farming",
  "Dairy / livestock farming",
  "Hatchery / breeding",
  "Feed manufacturing / feed supply",
  "Animal health / veterinary",
  "Farm equipment / machinery",
  "Dairy, meat or egg processing",
  "Import / distribution / trade",
  "Food service / cold-chain buyer",
  "Government / research / university",
  "Association / cooperative",
  "Banking / finance / insurance / investment",
  "Consultant",
  "Other",
] as const;

export const FORM_TYPES = ["exhibitor", "visitor", "contact", "brochure"] as const;
export type FormType = (typeof FORM_TYPES)[number];

export const FORM_LABELS: Record<FormType, string> = {
  exhibitor: "Exhibitor Registration",
  visitor: "Visitor Registration",
  contact: "Contact Enquiry",
  brochure: "Brochure Request",
};

export const FORM_CODES: Record<FormType, string> = {
  exhibitor: "EXH",
  visitor: "VIS",
  contact: "ENQ",
  brochure: "BRO",
};
