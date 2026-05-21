import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as XLSX from 'xlsx';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, serverTimestamp, setDoc, doc, updateDoc, getDocs } from 'firebase/firestore';
import { Search, Mic, Bell, ShoppingCart, Home, Grid2X2, List, User, FileUp, Package, Bike, ShieldCheck, ReceiptText, Wallet, MapPin, QrCode, Lock, CheckCircle2, Minus, Plus, X, Languages, Upload, Truck, IndianRupee, Store, BarChart3, Users, Route, Printer, Phone, RefreshCw, Download } from 'lucide-react';
import './style.css';

const ENV = import.meta.env;
const WA = ENV.VITE_WHATSAPP_ORDER_NUMBER || '917678256489';
const SUPPORT = ENV.VITE_SUPPORT_NUMBER || '7678256489';

const firebaseConfig = {
  apiKey: ENV.VITE_FIREBASE_API_KEY,
  authDomain: ENV.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: ENV.VITE_FIREBASE_PROJECT_ID,
  storageBucket: ENV.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: ENV.VITE_FIREBASE_APP_ID,
  measurementId: ENV.VITE_FIREBASE_MEASUREMENT_ID,
};

let db = null;
let auth = null;
let firebaseLive = false;
try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    signInAnonymously(auth).catch(() => {});
    firebaseLive = true;
  }
} catch (e) {
  firebaseLive = false;
}

const IMG = '/assets/';
const sampleProducts = [
  { id:'p1', storeId:'devindra-wholesale', storeName:'Devindra Mart Wholesale', mode:'wholesale', category:'Tel/Oil', subcategory:'Refined Oil', product:'Fortune Sunlite Refined Oil', brand:'Fortune', flavor:'Sunflower', unit:'Bottle', imageUrl:'/assets/products/fortune-oil.png', scheme:'Carton save ₹80', mrpBadge:'MRP ₹160', stock:120, variants:[{name:'1L Bottle', retailPrice:150, wholesalePrice:145, cartonPrice:1700},{name:'5L Jar', retailPrice:730, wholesalePrice:705, cartonPrice:4100},{name:'Carton 12 pcs', retailPrice:1800, wholesalePrice:1700, cartonPrice:1700}] },
  { id:'p2', storeId:'devindra-wholesale', storeName:'Devindra Mart Wholesale', mode:'wholesale', category:'Aata/Atta', subcategory:'Wheat Flour', product:'Aashirvaad Atta', brand:'Aashirvaad', flavor:'Regular', unit:'Bag', imageUrl:'/assets/products/aashirvaad-atta.png', scheme:'Bulk deal', mrpBadge:'MRP ₹260', stock:80, variants:[{name:'5kg Bag', retailPrice:240, wholesalePrice:232, cartonPrice:2200},{name:'10kg Bag', retailPrice:460, wholesalePrice:445, cartonPrice:4300}] },
  { id:'p3', storeId:'devindra-retail', storeName:'Devindra Mart Retail', mode:'retail', category:'Chawal/Rice', subcategory:'Basmati', product:'India Gate Basmati Rice', brand:'India Gate', flavor:'Classic', unit:'Packet', imageUrl:'/assets/products/india-gate-rice.png', scheme:'Fresh stock', mrpBadge:'MRP ₹135', stock:60, variants:[{name:'1kg Packet', retailPrice:120, wholesalePrice:116, cartonPrice:1150},{name:'5kg Bag', retailPrice:560, wholesalePrice:540, cartonPrice:5400}] },
  { id:'p4', storeId:'devindra-retail', storeName:'Devindra Mart Retail', mode:'retail', category:'Namkeen/Biscuit', subcategory:'Biscuits', product:'Parle-G Biscuit', brand:'Parle', flavor:'Regular', unit:'Packet', imageUrl:'/assets/products/parle-g.png', scheme:'Fast moving', mrpBadge:'MRP ₹10', stock:500, variants:[{name:'₹10 Pack', retailPrice:10, wholesalePrice:9, cartonPrice:900},{name:'₹5 Pack', retailPrice:5, wholesalePrice:4.6, cartonPrice:450}] },
  { id:'p5', storeId:'devindra-wholesale', storeName:'Devindra Mart Wholesale', mode:'wholesale', category:'Grocery', subcategory:'Salt', product:'Tata Salt', brand:'Tata', flavor:'Iodized', unit:'Packet', imageUrl:'/assets/products/tata-salt.png', scheme:'Carton special', mrpBadge:'MRP ₹25', stock:300, variants:[{name:'1kg Packet', retailPrice:20, wholesalePrice:19, cartonPrice:360},{name:'Carton 20 pcs', retailPrice:400, wholesalePrice:360, cartonPrice:360}] },
  { id:'p6', storeId:'devindra-retail', storeName:'Devindra Mart Retail', mode:'retail', category:'Cleaning', subcategory:'Detergent', product:'Surf Excel Matic', brand:'Surf Excel', flavor:'Top Load', unit:'Packet', imageUrl:'/assets/products/surf-excel.png', scheme:'Saving ₹25', mrpBadge:'MRP ₹310', stock:45, variants:[{name:'2kg Pack', retailPrice:285, wholesalePrice:275, cartonPrice:3200},{name:'1kg Pack', retailPrice:150, wholesalePrice:145, cartonPrice:1700}] },
  { id:'p7', storeId:'devindra-wholesale', storeName:'Devindra Mart Wholesale', mode:'wholesale', category:'Tea', subcategory:'Tea', product:'Tata Tea Premium', brand:'Tata', flavor:'Premium', unit:'Packet', imageUrl:'/assets/products/tata-tea.png', scheme:'Wholesale rate', mrpBadge:'MRP ₹240', stock:52, variants:[{name:'1kg Packet', retailPrice:220, wholesalePrice:212, cartonPrice:2450},{name:'250g Packet', retailPrice:65, wholesalePrice:62, cartonPrice:1400}] },
  { id:'p8', storeId:'devindra-retail', storeName:'Devindra Mart Retail', mode:'retail', category:'Cold Drink', subcategory:'Soft Drink', product:'Cold Drink Bottle', brand:'Local', flavor:'Cola', unit:'Bottle', imageUrl:'/assets/products/cold-drink.png', scheme:'Chilled available', mrpBadge:'MRP ₹45', stock:75, variants:[{name:'750ml Bottle', retailPrice:40, wholesalePrice:38, cartonPrice:450},{name:'2L Bottle', retailPrice:95, wholesalePrice:90, cartonPrice:1050}] },
];

const i18n = {
  English:{search:'Search products, brands, categories...', allProducts:'All Products', summary:'View Summary', orderWA:'Order on WhatsApp', orderNow:'Order Now', add:'Add', cart:'Cart', khata:'Khata', profile:'Profile', shops:'Shops', categories:'Categories', uploadParcha:'Upload Parcha', voice:'Voice Order'},
  Hindi:{search:'प्रोडक्ट, ब्रांड, कैटेगरी खोजें...', allProducts:'सभी प्रोडक्ट', summary:'कार्ट देखें', orderWA:'WhatsApp पर ऑर्डर', orderNow:'ऑर्डर करें', add:'जोड़ें', cart:'कार्ट', khata:'खाता', profile:'प्रोफाइल', shops:'दुकानें', categories:'कैटेगरी', uploadParcha:'पर्चा अपलोड', voice:'वॉइस ऑर्डर'},
  Hinglish:{search:'Product, brand, category search karo...', allProducts:'Saare Products', summary:'Summary Dekho', orderWA:'WhatsApp pe Order', orderNow:'Order Now', add:'Add', cart:'Cart', khata:'Khata', profile:'Profile', shops:'Shops', categories:'Categories', uploadParcha:'Parcha Upload', voice:'Voice Order'}
};

const categories = ['All','Tel/Oil','Chawal/Rice','Aata/Atta','Dal/Pulses','Masale','Namkeen/Biscuit','Cold Drink','Cleaning','Tea','Grocery'];

function useProducts(){
  const [products,setProducts]=useState(sampleProducts);
  useEffect(()=>{
    if(!db) return;
    const unsub=onSnapshot(collection(db,'products'), snap=>{
      const data=snap.docs.map(d=>({id:d.id,...d.data()}));
      if(data.length) setProducts(normalizeProducts(data));
    },()=>{});
    return ()=>unsub();
  },[]);
  return [products,setProducts];
}

function normalizeProducts(data){
  return data.map((p,idx)=>({
    ...p,
    id:p.id || `p${idx}`,
    imageUrl:p.imageUrl || '/assets/products/fortune-oil.png',
    variants:p.variants || [{name:p.variant || p.unit || 'Unit', retailPrice:Number(p.retailPrice||0), wholesalePrice:Number(p.wholesalePrice||p.retailPrice||0), cartonPrice:Number(p.cartonPrice||p.wholesalePrice||p.retailPrice||0)}]
  }));
}
function money(n){ return `₹${Math.round(Number(n||0)).toLocaleString('en-IN')}`; }
function uid(){return Math.random().toString(36).slice(2,10).toUpperCase();}

function App(){
  const path = location.pathname.toLowerCase();
  if(path.startsWith('/admin')) return <AdminApp/>;
  if(path.startsWith('/billing')) return <BillingApp/>;
  if(path.startsWith('/rider')) return <RiderApp/>;
  return <CustomerApp/>;
}

function CustomerApp(){
  const [products]=useProducts();
  const [lang,setLang]=useState(localStorage.lang || 'English');
  const t=i18n[lang];
  const [query,setQuery]=useState('');
  const [cat,setCat]=useState('All');
  const [mode,setMode]=useState('wholesale');
  const [view,setView]=useState('grid');
  const [cart,setCart]=useState(()=>JSON.parse(localStorage.cart || '{}'));
  const [summary,setSummary]=useState(false);
  const [tab,setTab]=useState('home');
  useEffect(()=>{ localStorage.cart=JSON.stringify(cart); localStorage.lang=lang; },[cart,lang]);
  const filtered = products.filter(p=> (cat==='All'||p.category===cat) && (p.product+p.brand+p.category+p.flavor).toLowerCase().includes(query.toLowerCase()));
  const lines=Object.values(cart);
  const subtotal=lines.reduce((s,l)=>s+(l.price*l.qty),0);
  const delivery=subtotal===0?0:subtotal>=5000?0:subtotal>=3000?10:subtotal>=1000?20:50;
  const total=subtotal+delivery;
  const count=lines.reduce((s,l)=>s+l.qty,0);
  const addToCart=(p,variantIndex=0)=>{
    const v=p.variants[variantIndex];
    const price = mode==='wholesale' ? (v.wholesalePrice||v.retailPrice) : v.retailPrice;
    const key=`${p.id}_${variantIndex}_${mode}`;
    setCart(c=>({...c,[key]:{key, id:p.id, product:p.product, brand:p.brand, mode, variant:v.name, price, imageUrl:p.imageUrl, qty:(c[key]?.qty||0)+1, storeName:p.storeName || (mode==='wholesale'?'Devindra Mart Wholesale':'Devindra Mart Retail')}}));
  };
  const updateQty=(key,delta)=>setCart(c=>{ const n={...c}; if(!n[key]) return n; n[key].qty+=delta; if(n[key].qty<=0) delete n[key]; return n; });
  const remove=(key)=>setCart(c=>{const n={...c}; delete n[key]; return n;});
  const placeOrder=async(channel='app')=>{
    if(!lines.length) return alert('Cart empty');
    const order={orderId:'DM'+uid(), channel, lines, subtotal, delivery, total, status:'placed', createdAt:new Date().toISOString(), payment:'COD'};
    localStorage.lastOrder=JSON.stringify(order);
    if(db) await addDoc(collection(db,'orders'),{...order, createdAt:serverTimestamp()}).catch(()=>{});
    if(channel==='whatsapp'){
      const msg=`Devindra Mart Order%0AOrder: ${order.orderId}%0A${lines.map(l=>`${l.product} (${l.variant}) x${l.qty} = ₹${l.price*l.qty}`).join('%0A')}%0ASubtotal: ₹${subtotal}%0ADelivery: ₹${delivery}%0ATotal: ₹${total}`;
      window.open(`https://wa.me/91${WA}?text=${msg}`,'_blank');
    }
    setCart({}); setSummary(false); alert('Order placed: '+order.orderId);
  };
  return <div className="app customer">
    <Header app="Customer App" lang={lang} setLang={setLang}/>
    <main className="screen">
      {tab==='home'&& <>
        <Hero/>
        <div className="lang-row"><button onClick={()=>setLang('English')}>English</button><button onClick={()=>setLang('Hindi')}>Hindi</button><button onClick={()=>setLang('Hinglish')}>Hinglish</button></div>
        <div className="search"><Search size={22}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search}/><Mic size={22}/></div>
        <div className="mode-row"><button className={mode==='wholesale'?'active':''} onClick={()=>setMode('wholesale')}>Wholesale</button><button className={mode==='retail'?'active':''} onClick={()=>setMode('retail')}>Retail</button></div>
        <div className="chips">{categories.map(c=><button key={c} onClick={()=>setCat(c)} className={cat===c?'active':''}>{iconFor(c)} {c}</button>)}</div>
        <ActionStrip t={t}/>
        <section className="products-head"><h2>{t.allProducts}</h2><div><button className={view==='grid'?'active small':''} onClick={()=>setView('grid')}><Grid2X2 size={16}/> Grid</button><button className={view==='list'?'active small':''} onClick={()=>setView('list')}><List size={16}/> List</button></div></section>
        <div className={view==='grid'?'product-grid':'product-list'}>{filtered.map(p=><ProductCard key={p.id} p={p} mode={mode} cart={cart} addToCart={addToCart} updateQty={updateQty} t={t}/>)}</div>
      </>}
      {tab==='cart'&&<CartPanel lines={lines} subtotal={subtotal} delivery={delivery} total={total} updateQty={updateQty} remove={remove} placeOrder={placeOrder} mode={mode} t={t}/>} 
      {tab==='shops'&&<ShopPage setMode={setMode}/>} 
      {tab==='khata'&&<KhataPage/>}
      {tab==='profile'&&<ProfilePage/>}
    </main>
    {count>0 && <button className="cart-summary" onClick={()=>setSummary(true)}><ShoppingCart/> {t.summary} <b>{count} Items • {money(total)}</b></button>}
    {summary&& <SummarySheet lines={lines} subtotal={subtotal} delivery={delivery} total={total} updateQty={updateQty} remove={remove} placeOrder={placeOrder} close={()=>setSummary(false)} mode={mode} t={t}/>} 
    <BottomNav tab={tab} setTab={setTab} t={t}/>
  </div>
}

function Header({app,lang,setLang}){return <header className="top"><img src="/assets/logo.png"/><div><h1>Devindra Mart</h1><p>{app}</p></div><span className="live">LIVE FIREBASE</span><button className="icon"><Bell/></button></header>}
function Hero(){return <div className="hero"><img src="/assets/banner-main.png"/><div className="dots"><i/><i/><i/><i/></div></div>}
function iconFor(c){ return ({'Tel/Oil':'🛢️','Chawal/Rice':'🍚','Aata/Atta':'🌾','Dal/Pulses':'🥣','Masale':'🌶️','Namkeen/Biscuit':'🍪','Cold Drink':'🥤','Cleaning':'🧼','Tea':'☕','Grocery':'🧂'}[c]||'🛒'); }
function ActionStrip({t}){return <div className="action-strip"><button><Mic/> {t.voice}</button><button><FileUp/> {t.uploadParcha}</button><button><Bell/> Notifications</button><button><Phone/> Support</button></div>}
function ProductCard({p,mode,cart,addToCart,updateQty,t}){ const [vi,setVi]=useState(0); const v=p.variants[vi]; const price=mode==='wholesale'?(v.wholesalePrice||v.retailPrice):v.retailPrice; const key=`${p.id}_${vi}_${mode}`; const qty=cart[key]?.qty||0; return <article className="product-card">
  <div className="badges"><span>{p.mrpBadge}</span><span className="scheme">{p.scheme}</span></div>
  <img className="pimg" src={p.imageUrl}/>
  <div className="pbody"><h3>{p.product}</h3><p>{p.brand} • {p.flavor}</p>
  <select value={vi} onChange={e=>setVi(Number(e.target.value))}>{p.variants.map((x,i)=><option key={i} value={i}>{x.name}</option>)}</select>
  <div className="price"><b>{money(price)}</b><small>{mode==='wholesale'?'Wholesale rate':'Retail price'}</small></div>
  {qty? <div className="qty"><button onClick={()=>updateQty(key,-1)}><Minus size={16}/></button><b>{qty}</b><button onClick={()=>addToCart(p,vi)}><Plus size={16}/></button></div> : <button className="add" onClick={()=>addToCart(p,vi)}>{t.add}</button>}
  </div></article> }
function SummarySheet({lines,subtotal,delivery,total,updateQty,remove,placeOrder,close,mode,t}){return <div className="sheet-bg"><section className="sheet"><div className="sheet-head"><h2>{t.summary}</h2><button onClick={close}><X/></button></div>{lines.map(l=><div className="cart-line" key={l.key}><img src={l.imageUrl}/><div><b>{l.product}</b><p>{l.variant} • {money(l.price)}</p></div><div className="qty mini"><button onClick={()=>updateQty(l.key,-1)}><Minus size={14}/></button><b>{l.qty}</b><button onClick={()=>updateQty(l.key,1)}><Plus size={14}/></button></div><button className="ghost" onClick={()=>remove(l.key)}><X size={16}/></button></div>)}<Totals subtotal={subtotal} delivery={delivery} total={total}/><button className="primary" onClick={()=>placeOrder(mode==='wholesale'?'whatsapp':'app')}>{mode==='wholesale'?t.orderWA:t.orderNow}</button></section></div>}
function CartPanel(props){return <section className="page-card"><h2>Your Cart</h2><SummarySheet {...props} close={()=>{}} /></section>}
function Totals({subtotal,delivery,total}){return <div className="totals"><p><span>Subtotal</span><b>{money(subtotal)}</b></p><p><span>Delivery</span><b>{delivery?money(delivery):'FREE'}</b></p><p className="grand"><span>Total</span><b>{money(total)}</b></p></div>}
function BottomNav({tab,setTab,t}){ const items=[['home',Home,'Home'],['shops',Store,t.shops],['cart',ShoppingCart,t.cart],['khata',Wallet,t.khata],['profile',User,t.profile]]; return <nav className="bottom">{items.map(([id,Icon,label])=><button className={tab===id?'active':''} onClick={()=>setTab(id)} key={id}><Icon size={20}/><span>{label}</span></button>)}</nav> }
function ShopPage({setMode}){return <section className="page-card"><h2>Stores</h2><div className="store-card"><b>Devindra Mart Wholesale</b><p>Bulk kirana, carton, loose/patta rate, khata available.</p><button onClick={()=>setMode('wholesale')}>Open Wholesale</button></div><div className="store-card"><b>Devindra Mart Retail</b><p>Retail items, quick delivery and Order Now checkout.</p><button onClick={()=>setMode('retail')}>Open Retail</button></div></section>}
function KhataPage(){return <section className="page-card"><h2>Mera Khata</h2><div className="stat big"><IndianRupee/> Total Due <b>₹0</b></div><p>Wholesale customers can view dues, payments and invoice statements here.</p></section>}
function ProfilePage(){return <section className="page-card"><h2>Profile</h2><p>Phone login, address, GPS delivery area and support details.</p><a className="primary link" href={`tel:${SUPPORT}`}>Call Support {SUPPORT}</a></section>}

function AdminApp(){ const [products,setProducts]=useProducts(); const [orders,setOrders]=useState([]); useEffect(()=>{ if(!db) return; return onSnapshot(collection(db,'orders'),s=>setOrders(s.docs.map(d=>({id:d.id,...d.data()}))),()=>{}); },[]); const importExcel=async(e)=>{ const file=e.target.files[0]; if(!file) return; const data=await file.arrayBuffer(); const wb=XLSX.read(data); const rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]); const mapped=normalizeProducts(rows.map((r,i)=>({id:r.id||`excel${i}`, ...r, variants:[{name:r.variant||r.unit||'Unit', retailPrice:Number(r.retailPrice||0), wholesalePrice:Number(r.wholesalePrice||r.retailPrice||0), cartonPrice:Number(r.cartonPrice||0)}]}))); setProducts(mapped); localStorage.products=JSON.stringify(mapped); if(db){ for(const p of mapped) await setDoc(doc(db,'products',p.id),p).catch(()=>{}); } alert(mapped.length+' products imported'); };
return <Dash title="Admin App" color="blue"><div className="stats"><Stat icon={<Package/>} label="Products" value={products.length}/><Stat icon={<ReceiptText/>} label="Orders" value={orders.length}/><Stat icon={<Users/>} label="Riders" value="3"/><Stat icon={<BarChart3/>} label="Sales" value="₹0"/></div><div className="page-card"><h2>Excel Products Upload</h2><p>Upload XLSX with product, category, variants, prices, stock, imageUrl.</p><label className="upload"><Upload/> Import Excel<input type="file" accept=".xlsx,.xls" onChange={importExcel}/></label><a className="link" href="/assets/devindra-products.xlsx" download><Download/> Download Sample Excel</a></div><div className="page-card"><h2>Product Control</h2>{products.slice(0,6).map(p=><div className="admin-row" key={p.id}><img src={p.imageUrl}/><span>{p.product}</span><b>{money(p.variants?.[0]?.retailPrice)}</b><button>Live</button></div>)}</div></Dash>}
function BillingApp(){ const [orders,setOrders]=useState([]); useEffect(()=>{ if(!db) return; return onSnapshot(collection(db,'orders'),s=>setOrders(s.docs.map(d=>({id:d.id,...d.data()}))),()=>{}); },[]); return <Dash title="Billing / Merchant App" color="orange"><div className="stats"><Stat icon={<ReceiptText/>} label="New Orders" value={orders.length}/><Stat icon={<Printer/>} label="Print Queue" value="Ready"/><Stat icon={<Bike/>} label="Dispatch" value="Assign"/></div><div className="page-card"><h2>Orders Screen</h2>{orders.length?orders.map(o=><div className="order-row" key={o.id}><b>{o.orderId}</b><span>{money(o.total)}</span><button>Start Billing</button></div>):<p>No live orders yet. Customer order will appear here.</p>}</div><div className="page-card"><h2>Cash Settlement</h2><p>COD denomination matching and rider settlement panel.</p><button className="primary">Submit Settlement</button></div></Dash>}
function RiderApp(){ const [unlocked,setUnlocked]=useState(false); return <Dash title="Rider App" color="purple"><div className="page-card"><h2>{unlocked?'Unlocked Orders':'Locked Order Access'}</h2>{!unlocked?<><Lock size={54}/><p>Rider cannot see customer/order details without pickup code or QR.</p><input placeholder="Enter Pickup Code"/><button className="primary" onClick={()=>setUnlocked(true)}><QrCode/> Unlock Orders</button></>:<><CheckCircle2 color="green"/><p>3 orders unlocked for pickup batch.</p><button className="primary"><Route/> Start Pickup</button></>}</div><div className="stats"><Stat icon={<Wallet/>} label="COD" value="₹0"/><Stat icon={<Truck/>} label="Delivered" value="0"/><Stat icon={<Users/>} label="Leads" value="0"/></div></Dash>}
function Dash({title,color,children}){return <div className={`dash ${color}`}><header className="dash-top"><img src="/assets/logo.png"/><div><h1>Devindra Mart</h1><p>{title}</p></div><span className="secret">Secret Route</span></header><main className="dash-main">{children}</main></div>}
function Stat({icon,label,value}){return <div className="stat">{icon}<span>{label}</span><b>{value}</b></div>}

createRoot(document.getElementById('root')).render(<App/>);
