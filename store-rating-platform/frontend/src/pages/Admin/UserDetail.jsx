import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { adminApi } from "../../api";

export default function UserDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  useEffect(() => { adminApi.user(id).then(({ data }) => setUser(data)); }, [id]);
  if (!user) return <main className="panel">Loading...</main>;
  return (
    <main className="panel narrow">
      <h1>User Detail</h1>
      <dl className="details">
        <dt>Name</dt><dd>{user.name}</dd>
        <dt>Email</dt><dd>{user.email}</dd>
        <dt>Address</dt><dd>{user.address}</dd>
        <dt>Role</dt><dd>{user.role}</dd>
        {user.store && <><dt>Store avg</dt><dd>{user.store.averageRating}</dd></>}
      </dl>
    </main>
  );
}
