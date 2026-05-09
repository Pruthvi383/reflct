import { useEffect, useState } from "react";
import { userApi } from "../../api";
import { messageFromError } from "../../api/client";
import { Stars } from "../../components/common/Stars";

export default function UserStoreList() {
  const [search, setSearch] = useState("");
  const [stores, setStores] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    const { data } = await userApi.stores({ search });
    setStores(data);
  }

  useEffect(() => { load(); }, [search]);

  async function rate(store, rating) {
    try {
      if (store.userRating) await userApi.updateRating(store.userRating.id, { rating });
      else await userApi.rate({ store_id: store.id, rating });
      setMessage("Rating saved");
      load();
    } catch (err) {
      setMessage(messageFromError(err));
    }
  }

  return (
    <main className="panel">
      <h1>Browse Stores</h1>
      <input className="search" placeholder="Search by name or address" value={search} onChange={(e) => setSearch(e.target.value)} />
      {message && <p className="notice">{message}</p>}
      <section className="storeGrid">
        {stores.map((store) => (
          <article className="storeCard" key={store.id}>
            <div>
              <h2>{store.name}</h2>
              <p>{store.address}</p>
            </div>
            <div className="ratingMeta">
              <span>Avg {Number(store.overallRating || 0).toFixed(1)}</span>
              <span>Your rating {store.userRating?.rating || "None"}</span>
            </div>
            <Stars value={store.userRating?.rating || 0} onChange={(value) => rate(store, value)} />
          </article>
        ))}
      </section>
    </main>
  );
}
