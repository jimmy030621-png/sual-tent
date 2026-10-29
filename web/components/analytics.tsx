"use client";

import Script from "next/script";
import { siteConfig } from "@/config/site";

/**
 * Google Analytics 4 + Google Ads tags.
 * Loads nothing unless the IDs are configured in config/site.ts (or env).
 */
export function Analytics() {
  const { googleAnalyticsId, googleAdsId } = siteConfig.analytics;

  if (!googleAnalyticsId && !googleAdsId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId || googleAdsId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${googleAnalyticsId}', ${googleAdsId ? `{ groups: 'ads' }` : "{}"});
          ${googleAdsId ? `gtag('config', '${googleAdsId}');` : ""}
        `}
      </Script>
    </>
  );
}

/** Fire a conversion event (e.g. after an inquiry is submitted). Safe no-op when not configured. */
export function trackConversion(label: string) {
  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  };
  if (typeof w.gtag !== "function") return;
  const { googleAdsId, adsConversionLabel } = siteConfig.analytics;
  if (!googleAdsId || !adsConversionLabel) return;
  w.gtag("event", "conversion", {
    send_to: `${googleAdsId}/${adsConversionLabel}`,
    event_callback: () => {
      // keep placeholder: replace with a redirect or message if needed
      void label;
    },
  });
}
