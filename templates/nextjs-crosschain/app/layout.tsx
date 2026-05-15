import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

const metadataTitle = "Next.js Cross-chain Starter";
const metadataDescription =
  "A Next.js App Router starter that uses one shared wallet picker for EVM and Solana identities.";

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: metadataTitle,
    template: `%s | ${metadataTitle}`,
  },
  description: metadataDescription,
  applicationName: metadataTitle,
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
    apple: ["/icon.svg"],
  },
  openGraph: {
    title: metadataTitle,
    description: metadataDescription,
    url: "/",
    siteName: metadataTitle,
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "Abstract cross-chain starter icon",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: metadataTitle,
    description: metadataDescription,
    images: ["/icon.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
