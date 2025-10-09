import { DashboardLayout } from "../layout";
import { Card } from "../common";

function PlaceholderPage({ title, description, icon }) {
  const defaultIcon = (
    <svg
      className="w-12 h-12 text-blue-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="text-slate-400 mt-1">
            {description || "This section is under development"}
          </p>
        </div>

        <Card>
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 bg-opacity-20 rounded-full mb-6">
              {icon || defaultIcon}
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">
              Coming Soon
            </h3>
            <p className="text-slate-400 max-w-md mx-auto">
              This feature is currently under development. Check back soon for
              updates.
            </p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default PlaceholderPage;
