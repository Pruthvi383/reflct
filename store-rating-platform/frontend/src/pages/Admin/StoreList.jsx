import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api";
import { DataTable } from "../../components/common/DataTable";

export default function StoreList() {
  const [params, setParams] = useState({ search: "", page: 1, limit: 10, sortBy: "name", order: "asc" });
  const [payload, setPayload] = useState({ data: [], total: 0 });
  useEffect(() => { adminApi.stores(params).then(({ data }) => setPayload(data)); }, [params]);
  return (
    <main className="panel">
      <div className="headingRow"><h1>Stores</h1><Link className="primary linkButton" to="/admin/stores/new">Add store</Link></div>
      <input className="search" placeholder="Search name, email, address" value={params.search} onChange={(e) => setParams({ ...params, search: e.target.value, page: 1 })} />
      <DataTable
        rows={payload.data}
        sortBy={params.sortBy}
        order={params.order}
        onSort={(sortBy, order) => setParams({ ...params, sortBy, order })}
        columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "email", label: "Email", sortable: true },
          { key: "address", label: "Address" },
          { key: "overallRating", label: "Overall Rating", sortable: true, render: (row) => Number(row.overallRating || 0).toFixed(1) }
        ]}
      />
      <p className="muted">Showing {payload.data.length} of {payload.total}</p>
    </main>
  );
}
