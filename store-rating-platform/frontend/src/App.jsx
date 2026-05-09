import { Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { PrivateRoute } from "./components/layout/PrivateRoute";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ChangePassword from "./pages/Auth/ChangePassword";
import AdminDashboard from "./pages/Admin/Dashboard";
import UserList from "./pages/Admin/UserList";
import UserDetail from "./pages/Admin/UserDetail";
import AddUser from "./pages/Admin/AddUser";
import AdminStoreList from "./pages/Admin/StoreList";
import AddStore from "./pages/Admin/AddStore";
import UserStoreList from "./pages/User/StoreList";
import OwnerDashboard from "./pages/Owner/Dashboard";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/403" element={<main className="panel narrow"><h1>403</h1><p>You do not have access to this page.</p></main>} />
        <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
        <Route path="/admin/dashboard" element={<PrivateRoute roles={["admin"]}><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/users" element={<PrivateRoute roles={["admin"]}><UserList /></PrivateRoute>} />
        <Route path="/admin/users/new" element={<PrivateRoute roles={["admin"]}><AddUser /></PrivateRoute>} />
        <Route path="/admin/users/:id" element={<PrivateRoute roles={["admin"]}><UserDetail /></PrivateRoute>} />
        <Route path="/admin/stores" element={<PrivateRoute roles={["admin"]}><AdminStoreList /></PrivateRoute>} />
        <Route path="/admin/stores/new" element={<PrivateRoute roles={["admin"]}><AddStore /></PrivateRoute>} />
        <Route path="/stores" element={<PrivateRoute roles={["user"]}><UserStoreList /></PrivateRoute>} />
        <Route path="/owner/dashboard" element={<PrivateRoute roles={["store_owner"]}><OwnerDashboard /></PrivateRoute>} />
      </Routes>
    </>
  );
}
