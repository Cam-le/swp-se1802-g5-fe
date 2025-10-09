import PlaceholderPage from "./PlaceholderPage";

function ProfilePage() {
  return (
    <PlaceholderPage
      title="My Profile"
      description="View and edit your profile information"
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
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      }
    />
  );
}

export default ProfilePage;
