import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { MOCK_USERS } from "../../data/mockData";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ... rest of the component code

  // In handleSubmit, after successful login:
  const userSession = {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    role_id: user.role_id,
    dealer_id: user.dealer_id || null,
    dealer_name: user.dealer_name || null,
  };

  login(userSession, "mock-jwt-token-" + user.id);

  // Redirect based on role
  switch (user.role_id) {
    case 4: // Admin
      navigate("/admin/dashboard");
      break;
    case 3: // EVM Staff
      navigate("/evm/dashboard");
      break;
    case 2: // Dealer Manager
      navigate("/dealer/manager/dashboard");
      break;
    case 1: // Dealer Staff
      navigate("/dealer/staff/dashboard");
      break;
    default:
      navigate("/");
  }
}
