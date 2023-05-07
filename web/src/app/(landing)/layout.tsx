interface HomeLayoutProps {
  children: React.ReactNode;
}

export default async function LandingLayout({ children }: HomeLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <main>{children}</main>
    </div>
  );
}
