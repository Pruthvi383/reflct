import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../api";
import { messageFromError } from "../../api/client";
import { FormField } from "../../components/common/FormField";
import { validateUser } from "../../utils/validators";

export default function AddUser() {
  const [values, setValues] = useState({ name: "", email: "", password: "", address: "", role: "user" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  async function submit(event) {
    event.preventDefault();
    const nextErrors = validateUser(values, true);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    try {
      await adminApi.createUser(values);
      navigate("/admin/users");
    } catch (err) {
      setServerError(messageFromError(err));
    }
  }
  return (
    <main className="panel narrow">
      <h1>Add User</h1>
      <form onSubmit={submit}>
        {["name", "email", "address"].map((field) => <FormField key={field} label={field} value={values[field]} error={errors[field]} onChange={(e) => setValues({ ...values, [field]: e.target.value })} />)}
        <FormField label="Password" type="password" value={values.password} error={errors.password} onChange={(e) => setValues({ ...values, password: e.target.value })} />
        <label className="field"><span>Role</span><select value={values.role} onChange={(e) => setValues({ ...values, role: e.target.value })}><option value="user">user</option><option value="admin">admin</option><option value="store_owner">store_owner</option></select></label>
        {serverError && <p className="error">{serverError}</p>}
        <button className="primary">Create user</button>
      </form>
    </main>
  );
}
