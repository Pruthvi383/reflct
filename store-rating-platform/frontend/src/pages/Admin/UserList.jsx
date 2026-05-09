import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api";
import { DataTable } from "../../components/common/DataTable";

export default function UserList() {
  const [params, setParams] = useState({ search: "", page: 1, limit: 10, sortBy: "name", order: "asc" });
  const [payload, setPayload] = useState({ data: [], total: 0 });
  useEffect(() => { adminApi.users(params).then(({ data }) => setPayload(data)); }, [params]);
  return (
    <main className="panel">
      <div className="headingRow"><h1>Users</h1><Link className="primary linkButton" to="/admin/users/new">Add user</Link></div>
      <input className="search" placeholder="Search name, email, address, role" value={params.search} onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })} />
      <DataTable
        rows={payload.data}
        sortBy={params.sortBy}
        order={params.order}
        onSort={(sortBy, order) => setParams({ ...params, sortBy, order })}
        columns={[
          { key: "name", label: "Name", sortable: true, render: (row) => <Link to={`/admin/users/${row.id}`}>{row.name}</Link> },
          { key: "email", label: "Email", sortable: true },
          { key: "address", label: "Address" },
          { key: "role", label: "Role" }
        ]}
      />
      <p className="muted">Showing {payload.data.length} of {payload.total}</p>
    </main>
  );
}
