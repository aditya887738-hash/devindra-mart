import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import "./style.css";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "devindra-mart-main-21205.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "devindra-mart-main-21205",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "devindra-mart-main-21205.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "513697622138",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-SLX40MKP4D"
};

let db = null;
const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.appId);
try {
  if (firebaseReady) db = getFirestore(initializeApp(firebaseConfig));
} catch (e) {
  console.warn("Firebase not connected, demo-safe mode active", e);
}

const SUPPORT = "7678256489";
const MASTER_STORE = { id: "devindra-master", name: "Devindra Mart Wholesale", mode: "wholesale", slug: "devindra-mart-wholesale" };

const sampleProducts = [
  { id: "p1", product: "Fortune Sunlite Oil", category: "Tel/Oil", unit: "Packet", loosePrice: 150, badge: "Best Value" },
  { id: "p2", product: "Aashirvaad Atta 5kg", category: "Atta", unit: "Bag", loosePrice: 240, badge: "Scheme Active" },
  { id: "p3", product: "Tata Salt 1kg", category: "Grocery", unit: "Packet", loosePrice: 20, badge: "Low Stock" },
  { id: "p4", product: "India Gate Rice 1kg", category: "Rice", unit: "Packet", loosePrice: 120, badge: "Offer" }
];

function Shell({ title, subtitle, icon, nav, children }) {
  return (
    <>
      <header className="top">
        <div className="brand"><div className="logo">DM</div><div><h2>{title}</h2><p>{subtitle}</p></div></div>
        <div className="topIcon">{icon}</div>
      </header>
      <main className="wrap">{children}</main>
      <nav className="bottom">{nav.map(x => <span key={x}>{x}</span>)}</nav>
    </>
  );
}

function CustomerApp() {
  const [products, setProducts] = useState(sampleProducts);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (!db) return;
    return onSnapshot(collection(db, "products"), snap => {
      const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (arr.length) setProducts(arr);
    }, () => {});
  }, []);

  const add = (p) => setCart(c => {
    const exists = c.find(x => x.id === p.id);
    if (exists) return c.map(x => x.id === p.id ? { ...x, qty: (x.qty || 1) + 1 } : x);
    return [...c, { ...p, qty: 1 }];
  });

  async function placeOrder() {
    if (!cart.length) return alert("Cart empty");
    const total = cart.reduce((s, i) => s + Number(i.loosePrice || 0) * Number(i.qty || 1), 0);
    const order = {
      orderId: "INV-" + new Date().getFullYear() + "-" + Date.now().toString().slice(-6),
      storeId: MASTER_STORE.id,
      storeName: MASTER_STORE.name,
      customerId: "demo-customer",
      customerName: "Demo Customer",
      address: "Warishnagar",
      items: cart,
      subtotal: total,
      delivery: total >= 1000 ? 0 : 50,
      total: total + (total >= 1000 ? 0 : 50),
      status: "placed",
      pickupCode: "WAR-" + new Date().toISOString().slice(2,10).replaceAll("-","") + "-" + Math.floor(1000 + Math.random() * 9000),
      createdAt: db ? serverTimestamp() : Date.now()
    };
    if (db) await addDoc(collection(db, "orders"), order);
    localStorage.setItem("lastOrder", JSON.stringify(order));
    setCart([]);
    alert("Order placed. Billing app me live order dikhega agar Firebase env connected hai.");
  }

  return <Shell title="Devindra Mart" subtitle="Customer App" icon="🔔" nav={["🏠 Home","▦ Categories","🛒 Cart","📒 Khata","👤 Profile"]}>
    <section className="hero"><div><h1>Devindra Mart Wholesale</h1><p>Customer app only. Admin/Billing/Rider links yahan nahi dikhte.</p></div><div className="heroEmoji">🛒</div></section>
    <div className="notice">Support / WhatsApp Support: {SUPPORT}. WhatsApp order sirf Devindra Mart Wholesale me ON.</div>
    <div className="search">🔍 Search products, brands, categories... 🎙️</div>
    <div className="chips">{["🛢️ Tel/Oil","🍚 Chawal","🌾 Atta","🥣 Dal","🧂 Masale"].map(x => <div className="chip" key={x}>{x}</div>)}</div>
    <div className="head"><h2>Stores</h2><span className="tag">1 store direct / multiple search</span></div>
    <section className="grid">
      <div className="card"><span className="tag">wholesale</span><h3>🏆 Devindra Mart Wholesale</h3><p>Bulk kirana, carton, loose/patta rate, khata available.</p><p>WhatsApp Order ON</p><button>Open Store</button></div>
      <div className="card"><span className="tag">retail</span><h3>🍔 Retail Store</h3><p>Retail single quantity, no khata.</p><p>WhatsApp Order OFF</p><button>Open Store</button></div>
      <div className="card"><span className="tag">support</span><h3>📞 Platform Support</h3><p>No merchant private number visible.</p><p className="price">{SUPPORT}</p></div>
    </section>
    <div className="head"><h2>Products</h2><button onClick={placeOrder}>Place Order ({cart.length})</button></div>
    <section className="grid">
      {products.map(p => <div className="card product" key={p.id}><div className="pimg">📦</div><div><span className="tag">{p.badge}</span><h3>{p.product}</h3><p>{p.category} • {p.unit}</p><p className="price">₹{p.loosePrice}</p><button onClick={() => add(p)}>Add</button></div></div>)}
    </section>
  </Shell>;
}

function AdminApp() {
  async function addProduct() {
    const p = { product: "New Product " + Date.now().toString().slice(-3), category: "Grocery", unit: "Packet", loosePrice: 99, stock: 50, storeId: MASTER_STORE.id, badge: "New", createdAt: db ? serverTimestamp() : Date.now() };
    if (db) await addDoc(collection(db, "products"), p);
    alert("Product added if Firebase env connected.");
  }
  return <Shell title="Devindra Admin" subtitle="Master Control" icon="🛡️" nav={["📊 Dashboard","🏪 Stores","🛵 Riders","⚙️ Settings"]}>
    <section className="hero"><div><h1>Admin Panel</h1><p>Admin-only app. Customer/Billing/Rider switch links hidden.</p></div><div className="heroEmoji">🛡️</div></section>
    <div className="notice">Full control: stores, products, riders, khata, settlement, notifications.</div>
    <section className="grid">
      <div className="card"><h3>📦 Product Control</h3><p>Add, update, stock, variant, Excel upload.</p><button onClick={addProduct}>Add Product</button></div>
      <div className="card"><h3>🛵 Rider Approval</h3><p>Aadhaar/PAN/address proof approval.</p><button>Approve</button></div>
      <div className="card"><h3>🏪 Merchant Approval</h3><p>Store approval before listing.</p><button>Review</button></div>
      <div className="card"><h3>🔔 Notifications</h3><p>Order, khata, offer, promo, low stock triggers.</p><button>Configure</button></div>
    </section>
  </Shell>;
}

function BillingApp() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    if (!db) {
      const last = localStorage.getItem("lastOrder");
      setOrders(last ? [JSON.parse(last)] : []);
      return;
    }
    const q = query(collection(db, "orders"), where("storeId", "==", MASTER_STORE.id), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => {});
  }, []);
  return <Shell title="Devindra Billing" subtitle="Merchant/Billing" icon="🧾" nav={["📥 Orders","📦 Products","🧾 Invoice","💰 Ledger"]}>
    <section className="hero"><div><h1>Billing / Merchant App</h1><p>Merchant own-store app. Customer/Admin/Rider links hidden.</p></div><div className="heroEmoji">🧾</div></section>
    <div className="notice">Merchant sees own store only. Customer full address hidden on packing slip.</div>
    <section className="grid">
      {orders.length ? orders.map(o => <div className="card" key={o.id || o.orderId}><h3>{o.orderId}</h3><p>Total: ₹{o.total}</p><p>Status: {o.status}</p><p>Pickup: {o.pickupCode}</p><button>Mark Ready</button></div>) : <div className="card"><h3>No live order yet</h3><p>Customer app se order place karo.</p></div>}
      <div className="card"><h3>🧾 Invoice / Packing Slip</h3><p>No customer private details on merchant slip.</p><button>Print</button></div>
    </section>
  </Shell>;
}

function RiderApp() {
  const [code, setCode] = useState("");
  const last = localStorage.getItem("lastOrder");
  const order = last ? JSON.parse(last) : { pickupCode: "WAR-250518-4832", orderId: "INV-DEMO", customerName: "Demo Customer", address: "Warishnagar", total: 685 };
  const unlocked = code && code === order.pickupCode;
  return <Shell title="Devindra Rider" subtitle="Code Unlock Delivery" icon="🛵" nav={["🏠 Home","🔐 Unlock","📦 Orders","💰 Earnings"]}>
    <section className="hero"><div><h1>Rider App</h1><p>Rider-only app. Customer/Admin/Billing/Merchant links hidden.</p></div><div className="heroEmoji">🛵</div></section>
    <div className="notice red">Without pickup code/QR, no customer/order details visible.</div>
    <section className="grid">
      <div className="card"><h3>🔐 Pickup Code</h3><p>Demo code: {order.pickupCode}</p><input className="input" value={code} onChange={e => setCode(e.target.value)} placeholder="Enter code" /></div>
      <div className="card"><h3>{unlocked ? "✅ Order Unlocked" : "🔒 Locked"}</h3>{unlocked ? <p>{order.customerName}<br/>{order.address}<br/>₹{order.total}</p> : <p>No name, address, items, amount, map visible.</p>}</div>
      <div className="card"><h3>💵 COD Settlement</h3><p>₹1 mismatch blocks submit. Denomination required.</p><button>Submit</button></div>
    </section>
  </Shell>;
}

function App() {
  const path = window.location.pathname;
  if (path.startsWith("/admin")) return <AdminApp />;
  if (path.startsWith("/billing")) return <BillingApp />;
  if (path.startsWith("/rider")) return <RiderApp />;
  return <CustomerApp />;
}

createRoot(document.getElementById("root")).render(<App />);
