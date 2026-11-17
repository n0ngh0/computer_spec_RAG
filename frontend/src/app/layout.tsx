import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpecRAG AI - Computer Spec Assistant",
  description: "Minimalist Gemini-style RAG chat platform for computer hardware",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full">
      <body className="h-full bg-[#fdfdfd] text-neutral-800 antialiased selection:bg-neutral-200 selection:text-neutral-900">
        {children}
      </body>
    </html>
  );
}
