import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { userApi } from "../../services/userApi";
import { dealerApi } from "../../services/dealerApi";
import { Card, LoadingSpinner, Badge, Alert } from "../common";
import { DashboardLayout } from "../layout";

function ProfilePage() {
  const { user: authUser } = useAuth();
  const [userDetails, setUserDetails] = useState(null);
  const [dealerDetails, setDealerDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser?.id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch user details
        const userResponse = await userApi.getById(authUser.id);

        if (userResponse.isSuccess && userResponse.data) {
          setUserDetails(userResponse.data);

          // If user has a dealer ID, fetch dealer details
          if (userResponse.data.dealerId) {
            const dealerResponse = await dealerApi.getById(
              userResponse.data.dealerId
            );
            if (dealerResponse.isSuccess && dealerResponse.data) {
              setDealerDetails(dealerResponse.data);
            }
          }
        } else {
          setError(userResponse.messages?.[0] || "Failed to load user data");
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError("Failed to load profile information");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser?.id]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <LoadingSpinner size="lg" text="Loading profile..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert type="error" message={error} />
      </DashboardLayout>
    );
  }

  if (!userDetails) {
    return (
      <DashboardLayout>
        <Alert type="error" message="User details not found" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-slate-400">View your account information</p>
        </div>

        {/* Profile Card */}
        <Card>
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {getInitials(userDetails.fullName)}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-white">
                  {userDetails.fullName}
                </h2>
                <Badge variant={userDetails.isActive ? "success" : "danger"}>
                  {userDetails.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-slate-400 mb-4">{userDetails.email}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Role
                  </label>
                  <p className="text-white">{userDetails.roleName}</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Phone
                  </label>
                  <p className="text-white">
                    {userDetails.phone || "Not provided"}
                  </p>
                </div>

                {/* Dealer (if applicable) */}
                {dealerDetails && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">
                        Dealer
                      </label>
                      <p className="text-white">{dealerDetails.name}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">
                        Dealer Address
                      </label>
                      <p className="text-white text-sm">
                        {dealerDetails.address}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">
                        Dealer Phone
                      </label>
                      <p className="text-white">{dealerDetails.phone}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">
                        Dealer Email
                      </label>
                      <p className="text-white">{dealerDetails.email}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">
                        Contract Number
                      </label>
                      <p className="text-white">
                        {dealerDetails.contractNumber}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">
                        Sales Target
                      </label>
                      <p className="text-white">
                        {dealerDetails.salesTarget} units
                      </p>
                    </div>
                  </>
                )}

                {/* Account Created */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">
                    Account Created
                  </label>
                  <p className="text-white text-sm">
                    {formatDate(userDetails.createdAt)}
                  </p>
                </div>

                {/* Last Updated */}
                {userDetails.updatedAt && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">
                      Last Updated
                    </label>
                    <p className="text-white text-sm">
                      {formatDate(userDetails.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Account Status Card */}
        <Card>
          <Card.Header>
            <Card.Title>Account Status</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Current Status</p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      userDetails.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                  />
                  <span className="text-white font-medium">
                    {userDetails.isActive
                      ? "Account Active"
                      : "Account Inactive"}
                  </span>
                </div>
              </div>
              {!userDetails.isActive && (
                <Alert
                  type="warning"
                  message="Your account is currently inactive. Please contact your administrator."
                />
              )}
            </div>
          </Card.Content>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default ProfilePage;
