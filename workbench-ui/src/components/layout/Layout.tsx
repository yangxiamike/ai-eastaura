import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="min-h-screen bg-eastaura-cream">
      <Sidebar />
      <div className="lg:ml-60 flex flex-col min-h-screen">
        <TopBar />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
