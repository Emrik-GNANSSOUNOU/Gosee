import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/seo";

const defaultTitle = "Gosee — Découvrir le Bénin";
const defaultDescription =
  "Découvrez les lieux, activités, hôtels et événements incontournables du Bénin, avec localisation et itinéraire.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: defaultTitle,
    template: "%s | Gosee",
  },
  description: defaultDescription,
  openGraph: {
    siteName: "Gosee",
    locale: "fr_FR",
    type: "website",
    title: defaultTitle,
    description: defaultDescription,
  },
  twitter: {
    card: "summary",
    title: defaultTitle,
    description: defaultDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className="bg-neutral-50 text-neutral-900 antialiased">{children}</body>
    </html>
  );
}
