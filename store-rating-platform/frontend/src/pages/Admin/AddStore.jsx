import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "../../api";
import { messageFromError } from "../../api/client";
import { FormField } from "../../components/common/FormField";
import { validateStore } from "../../utils/validators";

export default function AddStore() {
  const [values, setValues] = useState({ name: "", email: "", address: "", owner_id: "" });
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  useEffect(() => { adminApi.users({ role: "store_owner", limit: 100 }).then(({ data }) => setOwners(data.data)); }, []);
  async function submit(event) {
    event.preventDefault();
    const nextErrors = validateStore(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    try {
      await adminApi.createStore(values);
      navigate("/admin/stores");
    } catch (err) {
      setServerError(messageFromError(err));
    }
  }
  return (
    <main className="panel narrow">
      <h1>Add Store</h1>
      <form onSubmit={submit}>
        {["name", "email", "address"].map((field) => <FormField key={field} label={field} value={values[field]} error={errors[field]} onChange={(e) => setValues({ ...values, [field]: e.target.value })} />)}
        <label className="field">
          <span>Owner</span>
          <select value={values.owner_id} onChange={(e) => setValues({ ...values, owner_id: e.target.value })}>
            <option value="">Select owner</option>
            {owners.map((owner) => <option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>)}
          </select>
          {errors.owner_id && <small>{errors.owner_id}</small>}
        </label>
        {serverError && <p className="error">{serverError}</p>}
        <button className="primary">Create store</button>
      </form>
    </main>
  );
}
