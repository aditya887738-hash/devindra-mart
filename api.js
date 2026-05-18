import {
  collection, addDoc, updateDoc, doc, onSnapshot, query, where, orderBy,
  serverTimestamp, setDoc
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { auth, db, firebaseConfigured } from "./firebase";

export const SUPPORT_NUMBER = "7678256489";
export const MASTER_STORE_ID = "devindra-master";

export const sampleStores = [
  { id: MASTER_STORE_ID, name: "Devindra Mart Wholesale", mode: "wholesale", slug: "devindra-mart-wholesale", area: "All Areas" },
  { id: "retail-fastfood", name: "Fast Food Corner", mode: "retail", slug: "fast-food-corner", area: "Market Area" },
];

export const sampleProducts = [
  { id: "p1", storeId: MASTER_STORE_ID, product: "Fortune Sunlite Oil", product_hinglish: "Fortune Tel", category: "Tel/Oil", unit: "Packet", loosePrice: 150, cartonPrice: 1620, stock: 20, badge: "Best Value" },
  { id: "p2", storeId: MASTER_STORE_ID, product: "Aashirvaad Atta 5kg", product_hinglish: "Aashirvaad Atta", category: "Atta", unit: "Bag", loosePrice: 240, cartonPrice: 1200, stock: 15, badge: "Scheme Active" },
  { id: "p3", storeId: MASTER_STORE_ID, product: "Tata Salt 1kg", product_hinglish: "Tata Namak", category: "Grocery", unit: "Packet", loosePrice: 20, cartonPrice: 360, stock: 4, badge: "Low Stock" },
];

export async function loginRole(role) {
  localStorage.setItem("dm_role", role);
  if (!firebaseConfigured || !auth || !db) return { uid: "demo-" + role, role };
  const res = await signInAnonymously(auth);
  await setDoc(doc(db, "users", res.user.uid), {
    uid: res.user.uid, role, active: true, updatedAt: serverTimestamp()
  }, { merge: true });
  localStorage.setItem("dm_uid", res.user.uid);
  return { uid: res.user.uid, role };
}

export function getRole() { return localStorage.getItem("dm_role") || "customer"; }

export function listenProducts(cb) {
  if (!firebaseConfigured || !db) { cb(sampleProducts); return () => {}; }
  return onSnapshot(collection(db, "products"), snap => {
    const arr = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    cb(arr.length ? arr : sampleProducts);
  }, () => cb(sampleProducts));
}

export function listenOrdersForStore(storeId, cb) {
  if (!firebaseConfigured || !db) { cb([]); return () => {}; }
  const q = query(collection(db, "orders"), where("storeId", "==", storeId), orderBy("createdAt", "desc"));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => cb([]));
}

export function listenCustomerOrders(customerId, cb) {
  if (!firebaseConfigured || !db) { cb([]); return () => {}; }
  const q = query(collection(db, "orders"), where("customerId", "==", customerId), orderBy("createdAt", "desc"));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))), () => cb([]));
}

export function canUseWhatsAppOrder(store) {
  return store?.id === MASTER_STORE_ID || store?.slug === "devindra-mart-wholesale";
}

export function generatePickupCode(areaCode = "WAR") {
  const d = new Date();
  const date = String(d.getFullYear()).slice(2) + String(d.getMonth()+1).padStart(2,"0") + String(d.getDate()).padStart(2,"0");
  return `${areaCode}-${date}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function createOrder({ customerId, store, items, address }) {
  const subtotal = items.reduce((s, i) => s + Number(i.loosePrice || i.price || 0) * Number(i.qty || 1), 0);
  const delivery = subtotal >= 1000 ? 0 : 50;
  const order = {
    orderId: `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
    customerId,
    customerName: "Demo Customer",
    storeId: store.id,
    storeName: store.name,
    items,
    address,
    total: subtotal + delivery,
    subtotal,
    delivery,
    status: "placed",
    pickupCode: generatePickupCode("WAR"),
    pickupLocked: true,
    createdAt: serverTimestamp ? serverTimestamp() : Date.now(),
  };
  if (!firebaseConfigured || !db) {
    const old = JSON.parse(localStorage.getItem("dm_orders") || "[]");
    old.unshift({ ...order, id: "demo-" + Date.now(), createdAt: Date.now() });
    localStorage.setItem("dm_orders", JSON.stringify(old));
    return order;
  }
  return addDoc(collection(db, "orders"), order);
}

export async function updateOrderStatus(orderId, status) {
  if (!firebaseConfigured || !db || orderId?.startsWith("demo")) return true;
  return updateDoc(doc(db, "orders", orderId), { status, updatedAt: serverTimestamp() });
}

export async function addProduct(product) {
  if (!firebaseConfigured || !db) return true;
  return addDoc(collection(db, "products"), { ...product, createdAt: serverTimestamp() });
}

export function riderCanViewOrder(order, enteredCode) {
  return order.pickupCode === enteredCode;
}
