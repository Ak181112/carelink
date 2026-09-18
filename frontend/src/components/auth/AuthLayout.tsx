interface AuthLayoutProps {
  leftPanel: React.ReactNode;
  children: React.ReactNode;
}

export default function AuthLayout({
  leftPanel,
  children,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-2">
        {leftPanel}

        <div className="flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}