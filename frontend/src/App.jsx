
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetails from "./pages/CustomerDetails";
import Invoices from "./pages/Invoices";
import CreateInvoice from "./pages/CreateInvoice";
import InvoiceDetails from "./pages/InvoiceDetails";
import Payments from "./pages/Payments";
import RecordPayment from "./pages/RecordPayment";
import AIAssistant from "./pages/AIAssistant";

function Placeholder({ title }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
        {title}
      </h1>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          
          <Route path="/customers" element={<Customers />} />

          <Route
            path="/customers/:id"
            element={<CustomerDetails />}
          />

          <Route path="/invoices" element={<Invoices />} />

          <Route
            path="/invoices/:id"
            element={<InvoiceDetails />}
          />

          <Route
            path="/invoices/new"
            element={<CreateInvoice />}
          />

          <Route path="/payments" element={<Payments />} />

          <Route
            path="/invoices/:id/payment"
            element={<RecordPayment />}
          />

          <Route path="/ai" element={<AIAssistant />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;