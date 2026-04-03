import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Accord — El sistema operativo de tu tiempo",
  description:
    "Gestiona citas, servicios y clientes desde una sola plataforma. Tu negocio, organizado y automatizado.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${lexend.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
