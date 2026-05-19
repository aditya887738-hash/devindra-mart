
import React, {useEffect, useMemo, useState} from "react";
import {createRoot} from "react-dom/client";
import * as XLSX from "xlsx";
import {initializeApp} from "firebase/app";
import {getAuth, signInAnonymously} from "firebase/auth";
import {
  getFirestore, collection, addDoc, onSnapshot, query, where, orderBy,
  serverTimestamp, setDoc, doc, updateDoc, getDocs, writeBatch
} from "firebase/firestore";
import "./style.css";

const SUPPORT = import.meta.env.VITE_SUPPORT_NUMBER || "7678256489";
const WHATSAPP = import.meta.env.VITE_WHATSAPP_ORDER_NUMBER || "917678256489";
const MASTER = "devindra-master";
const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "devindra-mart-main-21205.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "devindra-mart-main-21205",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "devindra-mart-main-21205.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "513697622138",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-SLX40MKP4D"
};
let app=null, auth=null, db=null;
const live = Boolean(cfg.apiKey && cfg.appId);
try { if(live){ app=initializeApp(cfg); auth=getAuth(app); db=getFirestore(app); } } catch(e){ console.warn(e); }

const defaultStores = [
  {id: MASTER, name:"Devindra Mart Wholesale", mode:"wholesale", area:"All Areas", whatsappOrder:true, khata:true},
  {id:"retail-fastfood", name:"Fast Food Corner", mode:"retail", area:"Market Area", whatsappOrder:false, khata:false}
];

const defaultProducts = [
  {id:"p1", product:"Fortune Sunlite Refined Oil 1L", category:"Tel/Oil", unit:"Piece", loosePrice:150, cartonPrice:1620, stock:30, badge:"Best Value", image:"🛢️", storeId:MASTER},
  {id:"p2", product:"India Gate Basmati Rice 1kg", category:"Chawal/Rice", unit:"Packet", loosePrice:120, cartonPrice:1100, stock:24, badge:"Offer", image:"🍚", storeId:MASTER},
  {id:"p3", product:"Aashirvaad Atta 5kg", category:"Aata/Atta", unit:"Bag", loosePrice:240, cartonPrice:1200, stock:18, badge:"Scheme Active", image:"🌾", storeId:MASTER},
  {id:"p4", product:"Tata Salt 1kg", category:"Kirana", unit:"Packet", loosePrice:20, cartonPrice:360, stock:6, badge:"Low Stock", image:"🧂", storeId:MASTER},
  {id:"p5", product:"Surf Excel Matic 2kg", category:"Household", unit:"Packet", loosePrice:285, cartonPrice:3200, stock:9, badge:"Offer", image:"🧼", storeId:MASTER},
  {id:"p6", product:"Tata Tea Premium 1kg", category:"Grocery", unit:"Packet", loosePrice:220, cartonPrice:2500, stock:15, badge:"Best Value", image:"☕", storeId:MASTER}
];

async function login(role){
  localStorage.setItem("dm_role", role);
  if(!auth) return "local-" + role;
  const r = await signInAnonymously(auth);
  await setDoc(doc(db,"users",r.user.uid), {uid:r.user.uid, role, active:true, updatedAt:serverTimestamp()}, {merge:true});
  localStorage.setItem("dm_uid", r.user.uid);
  return r.user.uid;
}

function pickupCode(area="WAR"){
  const d = new Date();
  const date = String(d.getFullYear()).slice(2)+String(d.getMonth()+1).padStart(2,"0")+String(d.getDate()).padStart(2,"0");
  return `${area}-${date}-${Math.floor(1000+Math.random()*9000)}`;
}

function listenProducts(cb){
  if(!db){ cb(JSON.parse(localStorage.getItem("dm_products")||"null") || defaultProducts); return ()=>{}; }
  return onSnapshot(collection(db,"products"), snap=>{
    const arr=snap.docs.map(d=>({id:d.id,...d.data()}));
    cb(arr.length ? arr : defaultProducts);
  }, ()=>cb(defaultProducts));
}

function listenOrders(cb, storeId=null){
  if(!db){ cb(JSON.parse(localStorage.getItem("dm_orders")||"[]")); return ()=>{}; }
  let q = storeId ? query(collection(db,"orders"), where("storeId","==",storeId), orderBy("createdAt","desc")) : query(collection(db,"orders"), orderBy("createdAt","desc"));
  return onSnapshot(q, snap=>cb(snap.docs.map(d=>({id:d.id,...d.data()}))), ()=>cb([]));
}

async function seedAll(){
  if(!db){
    localStorage.setItem("dm_products", JSON.stringify(defaultProducts));
    localStorage.setItem("dm_stores", JSON.stringify(defaultStores));
    alert("Local seed done. Firebase env add karoge to Firestore me seed hoga.");
    return;
  }
  for(const s of defaultStores) await setDoc(doc(db,"stores",s.id), {...s, active:true, updatedAt:serverTimestamp()}, {merge:true});
  const existing = await getDocs(collection(db,"products"));
  if(existing.empty){
    for(const p of defaultProducts) await addDoc(collection(db,"products"), {...p, active:true, createdAt:serverTimestamp()});
  }
  alert("Firestore stores + products seeded.");
}

async function importExcel(file){
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, {defval:""});
  const mapped = rows.map((r,i)=>({
    product: r.product || r.Product || r.name || r.Name || `Excel Product ${i+1}`,
    category: r.category || r.Category || "Grocery",
    unit: r.unit || r.Unit || "Packet",
    loosePrice: Number(r.loosePrice || r["loose price"] || r.price || r.Price || 0),
    cartonPrice: Number(r.cartonPrice || r["carton price"] || 0),
    stock: Number(r.stock || r.Stock || 0),
    badge: r.badge || r.Badge || "",
    imageUrl: r.imageUrl || r["image URL"] || r.image || "",
    storeId: r.storeId || MASTER,
    active:true
  })).filter(x=>x.product && x.loosePrice>=0);
  if(!db){
    localStorage.setItem("dm_products", JSON.stringify(mapped.map((x,i)=>({...x,id:"excel-"+i}))));
    alert(`Excel imported locally: ${mapped.length} products`);
    return;
  }
  const batch = writeBatch(db);
  mapped.forEach(p=>{
    const ref = doc(collection(db,"products"));
    batch.set(ref, {...p, createdAt:serverTimestamp()});
  });
  await batch.commit();
  alert(`Excel imported to Firestore: ${mapped.length} products`);
}

async function uploadCloudinary(file, folder="devindra-mart"){
  const cloud = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dmwznjgvr";
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "devindra_upload";
  const fd = new FormData();
  fd.append("file",file); fd.append("upload_preset",preset); fd.append("folder",folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/auto/upload`, {method:"POST", body:fd});
  const data = await res.json();
  if(!data.secure_url) throw Error("Cloudinary upload failed");
  return data.secure_url;
}

async function createOrder(items, store=defaultStores[0]){
  const subtotal = items.reduce((s,i)=>s+Number(i.loosePrice||0)*Number(i.qty||1),0);
  const delivery = subtotal >= 1000 ? 0 : 50;
  const order = {
    orderId:"INV-"+new Date().getFullYear()+"-"+Date.now().toString().slice(-6),
    customerId: localStorage.getItem("dm_uid") || "local-customer",
    customerName:"Customer",
    address:"Warishnagar",
    phone:SUPPORT,
    storeId:store.id,
    storeName:store.name,
    items,
    subtotal, delivery, total: subtotal+delivery,
    status:"placed",
    pickupCode: pickupCode("WAR"),
    whatsappSent: store.id===MASTER,
    createdAt: db?serverTimestamp():Date.now()
  };
  if(db) await addDoc(collection(db,"orders"),order);
  else {
    const old = JSON.parse(localStorage.getItem("dm_orders")||"[]");
    old.unshift({...order,id:"local-"+Date.now()});
    localStorage.setItem("dm_orders",JSON.stringify(old));
  }
  if(store.id===MASTER){
    const msg = encodeURIComponent(`Devindra Mart Order\nOrder: ${order.orderId}\nTotal: ₹${order.total}\nItems:\n${items.map(x=>`- ${x.product} x${x.qty||1} ₹${x.loosePrice}`).join("\n")}\nAddress: ${order.address}`);
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, "_blank");
  }
  return order;
}

async function updateOrder(id, data){
  if(!db || String(id).startsWith("local")){
    const arr = JSON.parse(localStorage.getItem("dm_orders")||"[]").map(o=>o.id===id?{...o,...data}:o);
    localStorage.setItem("dm_orders",JSON.stringify(arr));
    return;
  }
  await updateDoc(doc(db,"orders",id), {...data, updatedAt:serverTimestamp()});
}

function Shell({title, subtitle, icon, nav, children, color="blue"}){
  return <>
    <header className={`top ${color}`}>
      <div className="brand"><div className="logo">DM</div><div><h2>{title}</h2><p>{subtitle}</p></div></div>
      <b className="mode">{live ? "LIVE FIREBASE" : "LOCAL MODE"}</b>
      <div className="topIcon">{icon}</div>
    </header>
    <main className="wrap">{children}</main>
    <nav className={`bottom ${color}`}>{nav.map(n=><span key={n}>{n}</span>)}</nav>
  </>
}

function Customer(){
  const [products,setProducts]=useState([]), [cart,setCart]=useState([]), [view,setView]=useState("grid");
  useEffect(()=>{login("customer"); return listenProducts(setProducts)},[]);
  const add=p=>setCart(c=>{const f=c.find(x=>x.id===p.id); return f?c.map(x=>x.id===p.id?{...x,qty:(x.qty||1)+1}:x):[...c,{...p,qty:1}]});
  const place=async()=>{if(!cart.length)return alert("Cart empty"); await createOrder(cart,defaultStores[0]); setCart([]); alert("Order app me save ho gaya + WhatsApp open hua.");}
  return <Shell title="Devindra Mart" subtitle="Customer App" icon="🔔" color="green" nav={["🏠 Home","🏪 Shops","🛒 Cart","📒 Khata","👤 Profile"]}>
    <section className="hero customerHero"><img src="/assets/banner-main.png" alt="Devindra Mart banner"/></section>
    <div className="search">🔍 Search products, brands, categories... 🎙️</div>
    <div className="chips">{["🛢️ Tel/Oil","🍚 Chawal/Rice","🌾 Aata/Atta","🥣 Dal/Pulses","🧂 Masale","🥤 Cold Drink","⋯ More"].map(x=><div className="chip" key={x}>{x}</div>)}</div>
    <div className="featureGrid">
      <button>🎙️ Voice Order</button><button onClick={place}>🟢 Order + WhatsApp ({cart.length})</button><button>📄 Upload Parcha</button><button>🔔 Notifications</button>
    </div>
    <div className="head"><h2>All Products</h2><div><button onClick={()=>setView("grid")}>▦ Grid</button><button className="light" onClick={()=>setView("list")}>☰ List</button></div></div>
    <section className={view==="grid"?"grid":"list"}>{products.map(p=><div className="card product" key={p.id}><div className="pimg">{p.imageUrl?<img src={p.imageUrl}/>:p.image||"📦"}</div><div><span className="tag">{p.badge||"Item"}</span><h3>{p.product}</h3><p>{p.category} • {p.unit}</p><p><b>Loose:</b> ₹{p.loosePrice} {p.cartonPrice? <span> | <b>Carton:</b> ₹{p.cartonPrice}</span>:null}</p><button onClick={()=>add(p)}>Add +</button></div></div>)}</section>
  </Shell>
}

function Admin(){
  const [orders,setOrders]=useState([]), [products,setProducts]=useState([]);
  useEffect(()=>{login("admin"); const a=listenOrders(setOrders), b=listenProducts(setProducts); return()=>{a();b()}},[]);
  const upload=async(e)=>{const f=e.target.files?.[0]; if(f) await importExcel(f);}
  const cloud=async(e)=>{const f=e.target.files?.[0]; if(!f)return; alert(await uploadCloudinary(f,"devindra-uploads"));}
  return <Shell title="Devindra Admin" subtitle="Dashboard" icon="🛡️" color="blue" nav={["📊 Dashboard","📦 Products","🏪 Shops","🛵 Riders","⚙️ Settings"]}>
    <section className="stats"><div className="stat"><b>{orders.length}</b><p>Orders</p></div><div className="stat"><b>{products.length}</b><p>Products</p></div><div className="stat"><b>₹1,45,320</b><p>Total Sales</p></div><div className="stat"><b>53</b><p>Low Stock</p></div></section>
    <section className="grid">
      <div className="card"><h3>Excel Bulk Upload</h3><p>Upload products, price, stock, image URL.</p><input type="file" accept=".xlsx,.xls,.csv" onChange={upload}/><a className="btn" href="/assets/devindra-products.xlsx" download>Download sample Excel</a></div>
      <div className="card"><h3>Cloudinary Upload</h3><p>Product image/banner/parcha/rider proof upload.</p><input type="file" onChange={cloud}/></div>
      <div className="card"><h3>Seed Database</h3><p>Stores + default products.</p><button onClick={seedAll}>Seed Now</button></div>
      <div className="card"><h3>Ads / Promo</h3><img className="wideImg" src="/assets/banner-main.png"/><video controls muted loop src="/assets/app-flow.mp4">Video</video></div>
      <div className="card"><h3>Live Orders</h3>{orders.slice(0,5).map(o=><p key={o.id}>{o.orderId} — ₹{o.total} — {o.status}</p>)}</div>
      <div className="card"><h3>Flow Reference</h3><img className="wideImg" src="/assets/multi-app-flow.png"/></div>
    </section>
  </Shell>
}

function Billing(){
  const [orders,setOrders]=useState([]);
  useEffect(()=>{login("billing"); return listenOrders(setOrders,MASTER)},[]);
  return <Shell title="Devindra Billing" subtitle="Orders Screen" icon="🧾" color="orange" nav={["📥 Orders","🖨️ Print Queue","🛵 Riders","💰 Cash","⚙️ Settings"]}>
    <section className="stats"><div className="stat"><b>{orders.filter(o=>o.status==="placed").length}</b><p>New Orders</p></div><div className="stat"><b>{orders.filter(o=>o.status==="ready").length}</b><p>Ready</p></div><div className="stat"><b>{orders.length}</b><p>Total</p></div></section>
    <section className="grid">{orders.length?orders.map(o=><div className="card" key={o.id}><h3>{o.orderId}</h3><p>{o.storeName}</p><p>₹{o.total} | {o.status}</p><p>Pickup: {o.pickupCode}</p><button onClick={()=>updateOrder(o.id,{status:"ready"})}>Mark Ready</button><button onClick={()=>window.print()}>Print</button></div>):<div className="card"><h3>No Orders</h3><p>Customer app se order place karo.</p></div>}</section>
  </Shell>
}

function Rider(){
  const [orders,setOrders]=useState([]), [code,setCode]=useState("");
  useEffect(()=>{login("rider"); return listenOrders(setOrders)},[]);
  const unlocked=orders.filter(o=>o.pickupCode===code);
  return <Shell title="Devindra Rider" subtitle="Home Screen" icon="🛵" color="purple" nav={["🏠 Home","📦 Orders","💰 Cash","👤 Profile"]}>
    <section className="stats"><div className="stat"><b>{orders.length}</b><p>Ready Count</p></div><div className="stat"><b>{unlocked.length}</b><p>Unlocked</p></div><div className="stat"><b>₹0</b><p>COD</p></div></section>
    <section className="grid">
      <div className="card"><h3>Scan QR / Pickup Code</h3><input className="input" value={code} onChange={e=>setCode(e.target.value)} placeholder="WAR-YYMMDD-1234"/><p>Without code no details visible.</p></div>
      {unlocked.map(o=><div className="card" key={o.id}><h3>Unlocked: {o.orderId}</h3><p>{o.customerName}</p><p>{o.address}</p><p>₹{o.total}</p><button onClick={()=>updateOrder(o.id,{status:"delivered"})}>Delivered</button></div>)}
      {!unlocked.length?<div className="card locked"><h3>🔒 Locked</h3><p>No customer name, address, item, amount, phone, map visible.</p></div>:null}
    </section>
  </Shell>
}

function App(){
  const path=location.pathname;
  if(path.startsWith("/admin")) return <Admin/>;
  if(path.startsWith("/billing")) return <Billing/>;
  if(path.startsWith("/rider")) return <Rider/>;
  return <Customer/>;
}

createRoot(document.getElementById("root")).render(<App/>);
