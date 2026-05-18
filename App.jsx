import { Routes, Route } from "react-router-dom";
import CustomerApp from "./apps/customer/CustomerApp";
import AdminApp from "./apps/admin/AdminApp";
import BillingApp from "./apps/billing/BillingApp";
import RiderApp from "./apps/rider/RiderApp";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<CustomerApp />} />
      <Route path="/admin" element={<AdminApp />} />
      <Route path="/billing" element={<BillingApp />} />
      <Route path="/rider" element={<RiderApp />} />
      <Route path="*" element={<CustomerApp />} />
    </Routes>
  );
}
