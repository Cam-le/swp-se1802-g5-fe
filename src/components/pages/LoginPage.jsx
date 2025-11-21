import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { authApi } from "../../services/authApi";
import { getDefaultRoute } from "../../constants";
import { InputField, Button, Alert } from "../common";
import ForgotPasswordModal from "./ForgotPasswordModal";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Trim email and password for validation
    const email = formData.email.trim();
    const password = formData.password.trim();

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 5) {
      newErrors.password = "Password must be at least 5 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    if (loginError) {
      setLoginError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoginError("");

    try {
      // Step 1: Login to get basic user info and token
      const loginResponse = await authApi.login(
        formData.email,
        formData.password
      );

      if (loginResponse.isSuccess && loginResponse.data) {
        const loginData = loginResponse.data;

        console.log("✅ Login successful! Processing user data...", {
          userId: loginData.userId,
          email: loginData.email,
          roleName: loginData.roleName,
          roleId: loginData.roleId,
        });

        // Step 2: Fetch full user details to get dealerId
        console.log("📋 Fetching detailed user information...");
        const userDetailsResponse = await authApi.getUserDetails(
          loginData.userId
        );

        if (userDetailsResponse.isSuccess && userDetailsResponse.data) {
          const userDetails = userDetailsResponse.data;

          console.log("✅ User details fetched successfully:", {
            dealerId: userDetails.dealerId,
            fullName: userDetails.fullName,
          });

          // Map API response to user session structure
          const userSession = {
            id: loginData.userId,
            email: loginData.email,
            full_name:
              userDetails.fullName ||
              loginData.username ||
              loginData.email.split("@")[0],
            role: loginData.roleName,
            role_id: loginData.roleId,
            dealer_id: userDetails.dealerId || null,
            dealer_name: null, // You can fetch dealer name separately if needed
            phone: userDetails.phone || null,
          };

          console.log("👤 Complete user session created:", {
            ...userSession,
            dealer_id: userSession.dealer_id
              ? `${userSession.dealer_id.substring(0, 8)}...`
              : null,
          });

          // Store token, user data, and token expiration
          login(userSession, loginData.token, loginData.tokenExpires);

          console.log("💾 Token and user data stored in localStorage");

          // Navigate to appropriate dashboard
          const route = getDefaultRoute(loginData.roleId);
          console.log(
            `🚀 Navigating to: ${route} (Role ID: ${loginData.roleId})`
          );

          // Use replace to prevent back button issues
          navigate(route, { replace: true });
        } else {
          console.error(
            "❌ Failed to fetch user details:",
            userDetailsResponse
          );
          setLoginError(
            userDetailsResponse.messages?.[0] ||
              "Failed to load user information"
          );
        }
      } else {
        console.log("❌ Login response indicates failure:", loginResponse);
        const errorMessage =
          loginResponse.messages?.[0] || "Login failed. Please try again.";
        setLoginError(errorMessage);
      }
    } catch (error) {
      console.error("Login error:", error);

      // Handle different error types
      if (error.message === "Invalid email or password") {
        setLoginError("Invalid email or password");
      } else if (error.response?.data?.messages?.[0]) {
        setLoginError(error.response.data.messages[0]);
      } else if (error.message) {
        setLoginError(error.message);
      } else {
        setLoginError(
          "Unable to connect to the server. Please try again later."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
              <svg
                className="w-10 h-10 text-white"
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
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              EVM Dealer System
            </h1>
            <p className="text-slate-400">
              Electric Vehicle Management Platform
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
            <h2 className="text-2xl font-semibold text-white mb-6">Sign In</h2>

            {/* Alerts */}
            <Alert type="error" message={loginError} />

            {/* Demo Accounts Info
            <div className="mb-6 bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-4">
              <p className="text-blue-400 text-sm font-medium mb-2">
                Accounts (Password: 12345):
              </p>
              <div className="space-y-1 text-xs text-blue-300">
                <p>• Admin: admin@gmail.com</p>
                <p>• EVM Staff: EVMStaff@gmail.com</p>
                <p>• Dealer Manager: DealerManager@gmail.com</p>
                <p>• Dealer Staff: dealerStaff@gmail.com</p>
              </div>
            </div> */}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <InputField
                id="email"
                name="email"
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="Enter your email"
                icon={
                  <svg
                    className="h-5 w-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                }
              />

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 bg-slate-700 border ${
                      errors.password ? "border-red-500" : "border-slate-600"
                    } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-slate-300">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                disabled={isLoading}
              >
                Sign In
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-sm text-slate-400 text-center">
                Contact your system administrator for access
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 text-center text-sm text-slate-400">
            <p>&copy; 2025 EVM Dealer System. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </>
  );
}

export default LoginPage;
