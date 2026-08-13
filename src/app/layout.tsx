import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Footer, Header } from "@/components/site";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const DESC     = "Affordable SAT® prep and Cambridge O Level / IGCSE tuition — live classes, AI support, mock tests, and parent reporting for global students.";
const BASE_URL = "https://digital-tutor-sat-prep.vercel.app";

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
    </body>
  </html>;
}
