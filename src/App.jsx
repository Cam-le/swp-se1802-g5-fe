import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import { ROLES, ROUTES } from "./constants";
import { ErrorBoundary } from "./components/common";

// Public Pages
import LoginPage from "./components/pages/LoginPage";

// Dealer Staff Pages
import DealerStaffDashboard from "./components/pages/DealerStaff/DashboardPage";
import CustomersPage from "./components/pages/DealerStaff/CustomersPage";
import AppointmentsPage from "./components/pages/DealerStaff/AppointmentsPage";
import VehiclesPage from "./components/pages/DealerStaff/VehiclesPage";
import OrdersPage from "./components/pages/DealerStaff/OrdersPage";
import RequestVehiclesPage from "./components/pages/DealerStaff/RequestVehiclesPage";

// Dealer Manager Pages
import DealerManagerDashboard from "./components/pages/DealerManager/DashboardPage";
import DealerManagerStaffPage from "./components/pages/DealerManager/DealerManagerStaffPage";
import DealerManagerReportsPage from "./components/pages/DealerManager/DealerManagerReportsPage";
import DealerManagerPromotionsPage from "./components/pages/DealerManager/DealerManagerPromotionsPage";
import RequestVerificationPage from "./components/pages/DealerManager/RequestVerificationPage";
import DealerManagerVehiclesPage from "./components/pages/DealerManager/DealerManagerVehiclesPage";
import DealerManagerCustomersPage from "./components/pages/DealerManager/DealerManagerCustomersPage";
import DealerManagerOrdersPage from "./components/pages/DealerManager/DealerManagerOrdersPage";
import DealerManagerAppointmentsPage from "./components/pages/DealerManager/DealerManagerAppointmentsPage";

// EVM Staff Pages
import EVMStaffDashboard from "./components/pages/EVMStaff/DashboardPage";
import VehicleRequestsPage from "./components/pages/EVMStaff/VehicleRequestsPage";
import EVMStaffDealersPage from "./components/pages/EVMStaff/EVMStaffDealersPage";
import EVMStaffInventoryPage from "./components/pages/EVMStaff/EVMStaffInventoryPage";
import EVMStaffReportsPage from "./components/pages/EVMStaff/EVMStaffReportsPage";
import EVMStaffVehiclesPage from "./components/pages/EVMStaff/EVMStaffVehiclesPage";

// Admin Pages
import AdminDashboard from "./components/pages/Admin/DashboardPage";
import UserManagementPage from "./components/pages/Admin/UserManagementPage";
import SystemSettingsPage from "./components/pages/Admin/SystemSettingsPage";
import SystemReportsPage from "./components/pages/Admin/SystemReportsPage";
import AdminDealersPage from "./components/pages/Admin/AdminDealersPage";

// Shared Pages
import ProfilePage from "./components/pages/ProfilePage";

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role_id)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return children;
}

// Unauthorized Page
function Unauthorized() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 bg-opacity-20 rounded-full mb-6">
          <svg
            className="w-12 h-12 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white mb-4">Access Denied</h1>
        <p className="text-slate-400 mb-8">
          You don't have permission to access this page. Please contact your
          system administrator if you believe this is an error.
        </p>
        <button
          onClick={logout}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path={ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />

            {/* Dealer Staff Routes (only staff components) */}
            <Route
              path={ROUTES.DEALER_STAFF.DASHBOARD}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_STAFF.id]}>
                  <DealerStaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DEALER_STAFF.PROFILE}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_STAFF.id]}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DEALER_STAFF.CUSTOMERS}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_STAFF.id]}>
                  <CustomersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DEALER_STAFF.ORDERS}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_STAFF.id]}>
                  <OrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DEALER_STAFF.VEHICLES}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_STAFF.id]}>
                  <VehiclesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DEALER_STAFF.APPOINTMENTS}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_STAFF.id]}>
                  <AppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DEALER_STAFF.REQUEST_VEHICLES}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_STAFF.id]}>
                  <RequestVehiclesPage />
                </ProtectedRoute>
              }
            />

            {/* Dealer Manager Routes */}
            <Route
              path={ROUTES.DEALER_MANAGER.DASHBOARD}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_MANAGER.id]}>
                  <DealerManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DEALER_MANAGER.PROFILE}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_MANAGER.id]}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            {/* Dealer Manager Routes (only manager components) */}
            <Route
              path={ROUTES.DEALER_MANAGER.DASHBOARD}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_MANAGER.id]}>
                  <DealerManagerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DEALER_MANAGER.PROFILE}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_MANAGER.id]}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DEALER_MANAGER.CUSTOMERS}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_MANAGER.id]}>
                  <DealerManagerCustomersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DEALER_MANAGER.ORDERS}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_MANAGER.id]}>
                  <DealerManagerOrdersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DEALER_MANAGER.VEHICLES}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_MANAGER.id]}>
                  <DealerManagerVehiclesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DEALER_MANAGER.APPOINTMENTS}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_MANAGER.id]}>
                  <DealerManagerAppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DEALER_MANAGER.REPORTS}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_MANAGER.id]}>
                  <DealerManagerReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DEALER_MANAGER.STAFF}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_MANAGER.id]}>
                  <DealerManagerStaffPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DEALER_MANAGER.PROMOTIONS}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_MANAGER.id]}>
                  <DealerManagerPromotionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DEALER_MANAGER.REQUEST_VERIFICATION}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_MANAGER.id]}>
                  <RequestVerificationPage />
                </ProtectedRoute>
              }
            />
            {/* Dealer Manager specific pages */}
            <Route
              path={ROUTES.DEALER_MANAGER.REPORTS}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_MANAGER.id]}>
                  <DealerManagerReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DEALER_MANAGER.STAFF}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_MANAGER.id]}>
                  <DealerManagerStaffPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.DEALER_MANAGER.PROMOTIONS}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_MANAGER.id]}>
                  <DealerManagerPromotionsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path={ROUTES.DEALER_MANAGER.REQUEST_VERIFICATION}
              element={
                <ProtectedRoute allowedRoles={[ROLES.DEALER_MANAGER.id]}>
                  <RequestVerificationPage />
                </ProtectedRoute>
              }
            />

            {/* EVM Staff Routes */}
            <Route
              path={ROUTES.EVM_STAFF.DASHBOARD}
              element={
                <ProtectedRoute allowedRoles={[ROLES.EVM_STAFF.id]}>
                  <EVMStaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.EVM_STAFF.VEHICLE_REQUESTS}
              element={
                <ProtectedRoute allowedRoles={[ROLES.EVM_STAFF.id]}>
                  <VehicleRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.EVM_STAFF.DEALERS}
              element={
                <ProtectedRoute allowedRoles={[ROLES.EVM_STAFF.id]}>
                  <EVMStaffDealersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.EVM_STAFF.INVENTORY}
              element={
                <ProtectedRoute allowedRoles={[ROLES.EVM_STAFF.id]}>
                  <EVMStaffInventoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.EVM_STAFF.REPORTS}
              element={
                <ProtectedRoute allowedRoles={[ROLES.EVM_STAFF.id]}>
                  <EVMStaffReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.EVM_STAFF.VEHICLES}
              element={
                <ProtectedRoute allowedRoles={[ROLES.EVM_STAFF.id]}>
                  <EVMStaffVehiclesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.EVM_STAFF.PROFILE}
              element={
                <ProtectedRoute allowedRoles={[ROLES.EVM_STAFF.id]}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path={ROUTES.ADMIN.DASHBOARD}
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN.id]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN.USERS}
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN.id]}>
                  <UserManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN.SETTINGS}
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN.id]}>
                  <SystemSettingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN.REPORTS}
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN.id]}>
                  <SystemReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN.DEALERS}
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN.id]}>
                  <AdminDealersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path={ROUTES.ADMIN.PROFILE}
              element={
                <ProtectedRoute allowedRoles={[ROLES.ADMIN.id]}>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
            <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
