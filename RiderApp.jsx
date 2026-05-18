import { useState } from "react";
import Shell from "../../shared/Shell";
import { riderCanViewOrder, generatePickupCode } from "../../firebase/api";

export default function RiderApp() {
  const [code, setCode] = useState("");
  const demoOrder = { pickupCode: generatePickupCode("WAR"), orderId: "INV-DEMO", customerName: "Demo Customer", address: "Warishnagar", total: 685 };
  const unlocked = riderCanViewOrder(demoOrder, code);

  return (
    <Shell title="Devindra Rider" subtitle="Code Unlock Delivery" icon="🛵" nav={["🏠 Home","🔐 Unlock","📦 Orders","💰 Earnings"]}>
      <section className="hero"><div><h1>Rider App</h1><p>Rider-only app. Customer/Admin/Billing/Merchant links hidden.</p></div><div className="heroEmoji">🛵</div></section>
      <div className="notice red">Without pickup code/QR, no customer/order details visible.</div>
      <section className="grid">
        <div className="card"><h3>🔐 Pickup Code</h3><p>Demo code: {demoOrder.pickupCode}</p><input className="input" value={code} onChange={(e)=>setCode(e.target.value)} placeholder="Enter code" /></div>
        <div className="card"><h3>{unlocked ? "✅ Order Unlocked" : "🔒 Locked"}</h3>{unlocked ? <p>{demoOrder.customerName}<br/>{demoOrder.address}<br/>₹{demoOrder.total}</p> : <p>No name, address, items, amount, map visible.</p>}</div>
        <div className="card"><h3>💵 COD Settlement</h3><p>₹1 mismatch blocks submit. Denomination required.</p><button>Submit</button></div>
      </section>
    </Shell>
  );
}
