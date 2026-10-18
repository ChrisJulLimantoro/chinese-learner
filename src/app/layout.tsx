import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import { getOptionalUser } from "@/lib/user";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Chinese Learner",
  description: "Master Mandarin with spaced repetition",
};

/* Inline no-FOUC script — sets .dark before first paint */
const themeScript = `
(function(){
  try {
    var s = localStorage.getItem('theme');
    if (s === 'dark' || (!s && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch(e){}
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getOptionalUser();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${notoSerifSC.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-paper text-ink">
        {user ? (
          <div className="flex min-h-screen">
            <Nav />
            <main className="flex-1 min-w-0 pb-20 md:pb-0 relative z-10">
              <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-10">
                {children}
              </div>
            </main>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
