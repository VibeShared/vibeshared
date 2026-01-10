import { ReactNode, Suspense } from "react";
import SettingsSidebar from "@/components/settings/SettingsSidebar";

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="container py-4">
      <div className="row">
        {/* Sidebar */}
        <aside className="col-12 col-md-4 col-lg-3 mb-4 mb-md-0">
          <SettingsSidebar />
        </aside>

        {/* Content */}
        <main className="col-12 col-md-8 col-lg-9">
          <Suspense fallback={<SettingsSkeleton />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

/* ---------------- Skeleton ---------------- */
function SettingsSkeleton() {
  return (
    <div>
      <div className="placeholder-glow mb-3">
        <span className="placeholder col-6"></span>
      </div>
      <div className="placeholder-glow">
        <span className="placeholder col-12"></span>
        <span className="placeholder col-12"></span>
        <span className="placeholder col-8"></span>
      </div>
    </div>
  );
}
