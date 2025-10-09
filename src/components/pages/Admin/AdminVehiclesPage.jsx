import PlaceholderPage from "../PlaceholderPage";

function AdminVehiclesPage() {
  return (
    <PlaceholderPage
      title="Vehicle Management"
      description="Manage vehicle models, specifications, and catalog"
      icon={
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
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      }
    />
  );
}

export default AdminVehiclesPage;
