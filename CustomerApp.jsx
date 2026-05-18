import { useEffect, useState } from "react";
import Shell from "../../shared/Shell";
import { listenProducts, sampleStores, createOrder, canUseWhatsAppOrder, SUPPORT_NUMBER } from "../../firebase/api";

export default function CustomerApp() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  useEffect(() => listenProducts(setProducts), []);

  const add = (p) => setCart((c) => {
    const found = c.find((x) => x.id === p.id);
    if (found) return c.map((x) => x.id === p.id ? { ...x, qty: (x.qty || 1) + 1 } : x);
    return [...c, { ...p, qty: 1 }];
  });

  const placeOrder = async () => {
    if (!cart.length) return alert("Cart empty");
    await createOrder({ customerId: "demo-customer", store: sampleStores[0], items: cart, address: "Warishnagar" });
    setCart([]);
    alert("Order placed. Admin/Billing me realtime order aayega agar Firebase env connected hai.");
  };

  return (
    <Shell title="Devindra Mart" subtitle="Customer App" icon="🔔" nav={["🏠 Home","▦ Categories","🛒 Cart","📒 Khata","👤 Profile"]}>
      <section className="hero"><div><h1>Devindra Mart Wholesale</h1><p>Customer app only. Admin/Billing/Rider links yahan nahi dikhte.</p></div><div className="heroEmoji">🛒</div></section>
      <div className="notice">Support / WhatsApp Support: {SUPPORT_NUMBER}. WhatsApp order only Devindra Mart Wholesale.</div>
      <div className="search">🔍 Search products, brands, categories... 🎙️</div>
      <div className="chips">{["🛢️ Tel/Oil","🍚 Chawal","🌾 Atta","🥣 Dal","🧂 Masale"].map(x => <div className="chip" key={x}>{x}</div>)}</div>
      <div className="head"><h2>Stores</h2><span className="tag">1 store direct / multiple search</span></div>
      <section className="grid">
        {sampleStores.map((s) => <div className="card" key={s.id}><span className="tag">{s.mode}</span><h3>{s.name}</h3><p>{s.mode === "wholesale" ? "Bulk, carton, loose/patta, khata available." : "Retail single orders."}</p><p>{canUseWhatsAppOrder(s) ? "WhatsApp Order ON" : "WhatsApp Order OFF"}</p><button>Open Store</button></div>)}
      </section>
      <div className="head"><h2>Products</h2><button onClick={placeOrder}>Place Order ({cart.length})</button></div>
      <section className="grid">
        {products.map((p) => <div className="card product" key={p.id}><div className="pimg">📦</div><div><span className="tag">{p.badge}</span><h3>{p.product}</h3><p>{p.category} • {p.unit}</p><p className="price">₹{p.loosePrice}</p><button onClick={() => add(p)}>Add</button></div></div>)}
      </section>
    </Shell>
  );
}
