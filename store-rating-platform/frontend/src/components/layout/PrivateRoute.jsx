import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function PrivateRoute({ roles, children }) {
  const { token, role } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (roles?.length && !roles.includes(role)) return <Navigate to="/403" replace />;
  return children;
}
