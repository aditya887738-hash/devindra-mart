import { useEffect, useState } from "react";
import Shell from "../../shared/Shell";
import { listenOrdersForStore, updateOrderStatus, MASTER_STORE_ID } from "../../firebase/api";

export default function BillingApp() {
  const [orders, setOrders] = useState([]);
  useEffect(() => listenOrdersForStore(MASTER_STORE_ID, setOrders), []);

  return (
    <Shell title="Devindra Billing" subtitle="Merchant/Billing" icon="🧾" nav={["📥 Orders","📦 Products","🧾 Invoice","💰 Ledger"]}>
      <section className="hero"><div><h1>Billing / Merchant App</h1><p>Merchant own-store app. Customer/Admin/Rider links hidden.</p></div><div className="heroEmoji">🧾</div></section>
      <div className="notice">Merchant sees own store only. Customer full address hidden on packing slip.</div>
      <section className="grid">
        {orders.length ? orders.map((o) => <div className="card" key={o.id}><h3>{o.orderId}</h3><p>Total: ₹{o.total}</p><p>Status: {o.status}</p><button onClick={() => updateOrderStatus(o.id, "ready")}>Mark Ready</button></div>) : <div className="card"><h3>No live order yet</h3><p>Customer app se order place karo.</p></div>}
        <div className="card"><h3>🧾 Invoice / Packing Slip</h3><p>No customer private details on merchant slip.</p><button>Print</button></div>
      </section>
    </Shell>
  );
}
