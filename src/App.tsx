import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { ShopProvider } from "./context/ShopContext";
import { Navbar } from "./components/Navbar";
import { Cart } from "./components/Cart";
import { Home } from "./pages/Home";
import { Admin } from "./pages/Admin";
import { ProductDetail } from "./pages/ProductDetail";

export default function App() {
  return (
    <ShopProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans relative selection:bg-cjp-accent selection:text-white">
          <Navbar />
          <Cart />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/product/:id" element={<ProductDetail />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ShopProvider>
  );
}
