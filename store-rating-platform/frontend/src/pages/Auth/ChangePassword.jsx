import { useState } from "react";
import { authApi } from "../../api";
import { messageFromError } from "../../api/client";
import { FormField } from "../../components/common/FormField";
import { validatePassword } from "../../utils/validators";

export default function ChangePassword() {
  const [values, setValues] = useState({ currentPassword: "", newPassword: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault();
    const nextErrors = validatePassword(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    try {
      const { data } = await authApi.changePassword(values);
      setMessage(data.message);
      setValues({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setMessage(messageFromError(err));
    }
  }

  return (
    <main className="panel narrow">
      <h1>Change Password</h1>
      <form onSubmit={submit}>
        <FormField label="Current password" type="password" value={values.currentPassword} error={errors.currentPassword} onChange={(e) => setValues({ ...values, currentPassword: e.target.value })} />
        <FormField label="New password" type="password" value={values.newPassword} error={errors.newPassword} onChange={(e) => setValues({ ...values, newPassword: e.target.value })} />
        <button className="primary">Update password</button>
      </form>
      {message && <p className="notice">{message}</p>}
    </main>
  );
}
