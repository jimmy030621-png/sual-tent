/**
 * Central site configuration.
 *
 * Everything that must be configured before going live lives here
 * (or as an environment variable with the same name).
 */

export const siteConfig = {
  name: "Saul Tents",
  legalName: "Saul Tents Outdoor Co.",
  tagline: "Premium tents & outdoor shelters, factory-direct for global brands",
  description:
    "Saul Tents is a factory-direct wholesale supplier of camping tents, canopies, tarps and outdoor gear. OEM / ODM services, flexible MOQ and worldwide shipping for outdoor brands, retailers and distributors.",

  /** Public site URL — replace with the real domain before launch. */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.saul-tents.com",

  contact: {
    /**
     * Public email. Empty = not displayed anywhere until configured.
     * e.g. "sales@saultents.com"
     */
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
    /**
     * WhatsApp number in international format, digits only (no "+").
     * Empty = WhatsApp button and links are hidden everywhere.
     * e.g. "8613800000000"
     */
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  },

  analytics: {
    /** Google Analytics 4 measurement ID, e.g. "G-XXXXXXXXXX". Empty = disabled. */
    googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID ?? "",
    /** Google Ads tag ID, e.g. "AW-XXXXXXXXX". Empty = disabled. */
    googleAdsId: process.env.NEXT_PUBLIC_ADS_ID ?? "",
    /** Google Ads conversion label for the inquiry-form submit event. */
    adsConversionLabel: process.env.NEXT_PUBLIC_ADS_CONVERSION_LABEL ?? "",
  },

  /**
   * Demo mode: inquiries are stored to local JSON files and are NOT emailed.
   * Flip to false when a real email service is connected.
   */
  demoMode: true,
} as const;

export type SiteConfig = typeof siteConfig;
