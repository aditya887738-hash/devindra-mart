import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "orders"), (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Devindra Mart - Merchant Dashboard</h1>
      <div style={{ marginTop: '20px' }}>
        {orders.length === 0 ? <p>No orders yet.</p> : orders.map(o => (
          <div key={o.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '5px' }}>
            <p><strong>Order ID:</strong> {o.id}</p>
            <p><strong>Product:</strong> {o.productName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

