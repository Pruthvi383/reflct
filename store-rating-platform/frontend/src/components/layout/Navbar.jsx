import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const links = {
  admin: [["/admin/dashboard", "Dashboard"], ["/admin/users", "Users"], ["/admin/stores", "Stores"]],
  user: [["/stores", "Stores"]],
  store_owner: [["/owner/dashboard", "Dashboard"]]
};

export function Navbar() {
  const { token, role, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <Link className="brand" to={token ? (role === "admin" ? "/admin/dashboard" : role === "store_owner" ? "/owner/dashboard" : "/stores") : "/login"}>StoreRate</Link>
      {token && (
        <nav>
          {(links[role] || []).map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
          <NavLink to="/change-password">Password</NavLink>
        </nav>
      )}
      <div className="session">
        {token ? (
          <>
            <span>{user?.email}</span>
            <button onClick={() => { logout(); navigate("/login"); }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </header>
  );
}
