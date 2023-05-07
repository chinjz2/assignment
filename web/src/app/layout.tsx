import "~/styles/globals.css";
import { cn } from "~/src/utils/cn";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Assignment",
  description: "Assignment",
};
interface RootLayoutProps {
  children: React.ReactNode;
}
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        "bg-white font-sans text-slate-900 antialiased",
        inter.className
      )}
    >
      <body className="min-h-[100vh] min-h-[100svh]">{children}</body>
    </html>
  );
}
