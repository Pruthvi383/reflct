import { useEffect, useState } from "react";
import { ownerApi } from "../../api";
import { DataTable } from "../../components/common/DataTable";

export default function OwnerDashboard() {
  const [params, setParams] = useState({ sortBy: "name", order: "asc" });
  const [payload, setPayload] = useState({ averageRating: 0, raters: [], store: null });
  useEffect(() => { ownerApi.dashboard(params).then(({ data }) => setPayload(data)); }, [params]);
  return (
    <main className="panel">
      <h1>Owner Dashboard</h1>
      <section className="stats">
        <article><span>Store</span><strong>{payload.store?.name || "No store assigned"}</strong></article>
        <article><span>Average Rating</span><strong>{Number(payload.averageRating || 0).toFixed(1)}</strong></article>
      </section>
      <DataTable
        rows={payload.raters}
        sortBy={params.sortBy}
        order={params.order}
        onSort={(sortBy, order) => setParams({ sortBy, order })}
        columns={[
          { key: "name", label: "Name", sortable: true },
          { key: "email", label: "Email", sortable: true },
          { key: "rating", label: "Rating", sortable: true }
        ]}
      />
    </main>
  );
}
