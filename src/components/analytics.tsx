import Script from "next/script";
import { brand, siteUrl } from "@/lib/brand";

/**
 * Privacy-conscious, lightweight analytics layer.
 *
 * Components fire events through `track()` (see lib/analytics.ts), which
 * dispatches a `elane-analytics` CustomEvent. The relayer below forwards them.
 * To connect a real provider later, replace the relayer body with the SDK of
 * your choice — no storefront code needs to change.
 *
 * No cookies are set and no personal data is collected.
 */
export function Analytics() {
  return (
    <>
      <Script id="elane-analytics-relay" strategy="lazyOnload">
        {`
          (function () {
            if (typeof window === "undefined") return;
            var log = window.location.hostname === "localhost";
            window.__elaneAnalytics = function (name, data) {
              if (log) console.info("[analytics]", name, data || {});
            };
            window.addEventListener("elane-analytics", function (ev) {
              var detail = ev.detail || {};
              if (window.__elaneAnalytics) window.__elaneAnalytics(detail.event, detail.data);
            });
          })();
        `}
      </Script>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: brand.name,
            legalName: brand.legalName,
            url: siteUrl,
            description: brand.description,
            email: brand.email,
            telephone: brand.supportPhoneDisplay,
            address: {
              "@type": "PostalAddress",
              addressLocality: "Accra",
              addressCountry: "GH",
            },
            areaServed: "Ghana",
            sameAs: Object.values(brand.social).filter(Boolean),
            makesOffer: { "@type": "Offer", priceCurrency: "GHS" },
          }),
        }}
      />
    </>
  );
}