import { useEffect, useState } from "react";
import { adminApi } from "../../api";

export default function Dashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  useEffect(() => { adminApi.dashboard().then(({ data }) => setStats(data)); }, []);
  return (
    <main className="panel">
      <h1>Admin Dashboard</h1>
      <section className="stats">
        <article><span>Total Users</span><strong>{stats.totalUsers}</strong></article>
        <article><span>Total Stores</span><strong>{stats.totalStores}</strong></article>
        <article><span>Total Ratings</span><strong>{stats.totalRatings}</strong></article>
      </section>
    </main>
  );
}
