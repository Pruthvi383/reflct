import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormField } from "../../components/common/FormField";
import { validateUser } from "../../utils/validators";
import { messageFromError } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const [values, setValues] = useState({ name: "", email: "", address: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    const nextErrors = validateUser(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    try {
      await register(values);
      navigate("/stores");
    } catch (err) {
      setServerError(messageFromError(err));
    }
  }

  return (
    <main className="authCard">
      <h1>Register</h1>
      <form onSubmit={submit}>
        {["name", "email", "address"].map((field) => (
          <FormField key={field} label={field[0].toUpperCase() + field.slice(1)} value={values[field]} error={errors[field]} onChange={(e) => setValues({ ...values, [field]: e.target.value })} />
        ))}
        <FormField label="Password" type="password" value={values.password} error={errors.password} onChange={(e) => setValues({ ...values, password: e.target.value })} />
        {serverError && <p className="error">{serverError}</p>}
        <button className="primary">Create account</button>
      </form>
      <p>Already registered? <Link to="/login">Login</Link></p>
    </main>
  );
}
