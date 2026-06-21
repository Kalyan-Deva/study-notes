import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/app-shell";
import { getCombinedNavTree } from "@/lib/nav";
import { getEditSession } from "@/lib/edit-auth";
import { getAdminUser } from "@/lib/admin-auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lexicon",
    template: "%s · Lexicon",
  },
  description: "Lexicon — a personal, ask-and-it-becomes-notes knowledge base.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tree = await getCombinedNavTree();
  const { canEdit } = await getEditSession();
  const isAdmin = !!(await getAdminUser());

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AppShell tree={tree} canEdit={canEdit} isAdmin={isAdmin}>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
