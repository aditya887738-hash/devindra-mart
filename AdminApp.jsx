import { useEffect, useState } from "react";
import Shell from "../../shared/Shell";
import { listenProducts, addProduct } from "../../firebase/api";

export default function AdminApp() {
  const [products, setProducts] = useState([]);
  useEffect(() => listenProducts(setProducts), []);

  const addDemoProduct = async () => {
    await addProduct({
      product: "New Demo Product",
      category: "Grocery",
      unit: "Packet",
      loosePrice: 99,
      cartonPrice: 900,
      stock: 50,
      storeId: "devindra-master",
      badge: "New"
    });
    alert("Product added if Firebase env connected. Demo mode me no crash.");
  };

  return (
    <Shell title="Devindra Admin" subtitle="Master Control" icon="🛡️" nav={["📊 Dashboard","🏪 Stores","🛵 Riders","⚙️ Settings"]}>
      <section className="hero"><div><h1>Admin Panel</h1><p>Admin-only app. Customer/Billing/Rider switch links hidden.</p></div><div className="heroEmoji">🛡️</div></section>
      <div className="notice">Full control: stores, products, riders, khata, settlement, notifications.</div>
      <section className="stats"><div className="stat"><p>Products</p><b>{products.length}</b></div><div className="stat"><p>Orders</p><b>Live</b></div><div className="stat"><p>Riders</p><b>KYC</b></div><div className="stat"><p>Support</p><b>7678</b></div></section>
      <section className="grid">
        <div className="card"><h3>📦 Product Control</h3><p>Add, update, stock, variant, Excel upload.</p><button onClick={addDemoProduct}>Add Demo Product</button></div>
        <div className="card"><h3>🛵 Rider Approval</h3><p>Aadhaar/PAN/address proof approval.</p><button>Approve</button></div>
        <div className="card"><h3>🏪 Merchant Approval</h3><p>Store approval before listing.</p><button>Review</button></div>
        <div className="card"><h3>🔔 Notifications</h3><p>Order, khata, offer, promo, low stock triggers.</p><button>Configure</button></div>
      </section>
    </Shell>
  );
}
