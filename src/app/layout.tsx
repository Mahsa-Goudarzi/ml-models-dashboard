// next metadata
import type { Metadata } from "next";

// fonts
import { Inter } from "next/font/google";

// styles
import "./globals.css";

// tensoflow.js
import "@tensorflow/tfjs-backend-webgl";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MLens - Visual ML Studio",
  description:
    "Upload your dataset, train ML models, visualize everything in browser",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
