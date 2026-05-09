import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { messageFromError } from "../../api/client";
import { FormField } from "../../components/common/FormField";

export default function Login() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const next = await login(values);
      navigate(next.user.role === "admin" ? "/admin/dashboard" : next.user.role === "store_owner" ? "/owner/dashboard" : "/stores");
    } catch (err) {
      setError(messageFromError(err));
    }
  }

  return (
    <main className="authCard">
      <h1>Login</h1>
      <form onSubmit={submit}>
        <FormField label="Email" type="email" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
        <FormField label="Password" type="password" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} />
        {error && <p className="error">{error}</p>}
        <button className="primary">Login</button>
      </form>
      <p>New normal user? <Link to="/register">Create an account</Link></p>
    </main>
  );
}
