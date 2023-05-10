import Link from "next/link";

interface EmployeeLayoutProps {
  children: React.ReactNode;
}

export default async function EmployeeLayout({
  children,
}: EmployeeLayoutProps) {
  return (
    <div className="min-h-[100vh] min-h-[100svh]">
      <header className="absolute top-8 left-8 px-5 py-3 z-40 bg-transparent text-black">
        <Link href="/">
          <span className="sm:inline-block lg:text-xl">back</span>
        </Link>
      </header>
      <main>{children}</main>
    </div>
  );
}
