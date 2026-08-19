import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Footer, Header } from "@/components/site";
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton";
import { ChunkErrorRecovery } from "@/components/ChunkErrorRecovery";

const GA_ID    = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const DESC     = "Affordable SAT® prep and Cambridge O Level / IGCSE tuition — live classes, AI support, mock tests, and parent reporting for global students.";
// Production domain — was previously left pointing at the Vercel preview
// domain, which broke canonical URLs and social share previews.
const BASE_URL = "https://academy.thedigitaltutor.net";

export const metadata: Metadata = {
  title: { default: "The Digital Tutor — SAT® Prep & Cambridge O Level", template: "%s | The Digital Tutor" },
  description: DESC,
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: "website",
    siteName: "The Digital Tutor",
    title: "The Digital Tutor — SAT® Prep & Cambridge O Level",
    description: DESC,
    url: BASE_URL,
  },
  twitter: { card: "summary_large_image", title: "The Digital Tutor — SAT® Prep & Cambridge O Level", description: DESC },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
    <body>
      <Header /><main>{children}</main><Footer />
      <WhatsAppFloatingButton />
      <ChunkErrorRecovery />
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">{`
            window.dataLayer=window.dataLayer||[];
            function gtag(){dataLayer.push(arguments);}
            gtag('js',new Date());
            gtag('config','${GA_ID}');
          `}</Script>
        </>
      )}
      {PIXEL_ID && (
        <Script id="meta-pixel-init" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `}</Script>
      )}
    </body>
  </html>;
}
