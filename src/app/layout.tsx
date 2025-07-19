import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Define the base URL for your site.
const baseUrl = "https://placeholder.sakebul.com";

// Comprehensive metadata for excellent SEO.
export const metadata: Metadata = {
  // Use a metadata base for resolving relative paths, like for Open Graph images.
  metadataBase: new URL(baseUrl),
  
  // Title can be a template to apply a suffix to all child pages.
  title: {
    default: "Placeholder App | Generate Custom Image Placeholders",
    template: "%s | Placeholder App",
  },
  
  // A more descriptive and engaging description.
  description: "The ultimate tool for developers and designers. Quickly generate custom, lightweight image placeholders for any project. Free, fast, and easy to use.",
  
  // Important viewport settings for responsiveness.
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },

  // Keywords for search engine context.
  keywords: ["placeholder generator", "image placeholder", "developer tools", "web design", "frontend development", "mockup", "wireframe"],
  
  // Author and creator information.
  creator: "Sakebul Islam",
  publisher: "Sakebul Islam",
  
  // Canonical URL to specify the preferred version of the page.
  alternates: {
    canonical: baseUrl,
  },

  // Open Graph (OG) tags for rich social media sharing (Facebook, LinkedIn, etc.).
  openGraph: {
    title: "Placeholder App | Generate Custom Image Placeholders",
    description: "Quickly generate custom, lightweight image placeholders for any project. The ultimate tool for developers and designers.",
    url: baseUrl,
    siteName: "Placeholder App",
    // Provide a specific URL for your Open Graph image (e.g., 1200x630px).
    images: [
      {
        url: "/og-image.png", // Path relative to the `public` folder.
        width: 1200,
        height: 630,
        alt: "Placeholder App Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // Twitter-specific card tags for sharing on Twitter.
  twitter: {
    card: "summary_large_image",
    title: "Placeholder App | Generate Custom Image Placeholders",
    description: "The ultimate tool for developers and designers to generate custom image placeholders.",
    // Use the same image as Open Graph.
    images: ["/og-image.png"], 
    // Add your Twitter handle.
    creator: "@sakebul_islam",
  },

  // Icons for favicon, Apple touch icon, etc.
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  
  // Helps search engines understand how to crawl your site.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Link to a web app manifest file.
  manifest: "/site.webmanifest",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
