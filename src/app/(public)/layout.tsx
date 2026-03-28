import Link from "next/link";
import { Bell } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteName = process.env.SITE_NAME || "Status Page";

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-[15px] tracking-tight">
            {siteName}
          </Link>
          <Link
            href="/subscribe"
            className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="h-3.5 w-3.5" />
            Subscribe
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
      <footer className="border-t bg-background/50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5 text-center text-xs text-muted-foreground">
          Made by{" "}
          <a
            href="https://recurohq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:underline font-medium"
          >
            Recuro
          </a>
        </div>
      </footer>
    </div>
  );
}
