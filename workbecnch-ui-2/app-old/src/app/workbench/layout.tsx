import { Sidebar } from "@/components/workbench/layout/Sidebar";
import { TopBar } from "@/components/workbench/layout/TopBar";
import { LanguageProvider } from "@/components/workbench/LanguageProvider";

export default function WorkbenchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-eastaura-cream">
      <LanguageProvider>
        <Sidebar />
        <div className="lg:ml-64 flex min-h-screen flex-col">
          <TopBar />
          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7 2xl:px-10">
            {children}
          </main>
        </div>
      </LanguageProvider>
    </div>
  );
}
