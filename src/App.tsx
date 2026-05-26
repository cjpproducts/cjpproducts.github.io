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
          {/* TOP FLASH ANNOUNCEMENT: FREE DELIVERY ALL OVER INDIA */}
          <div className="w-full bg-yellow-400 text-cjp-dark py-2.5 font-mono text-xs md:text-sm font-bold uppercase tracking-widest border-b-4 border-cjp-dark overflow-hidden flex select-none z-50 group">
            <div className="flex shrink-0 animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]">
              <span className="mx-4">⚡ FREE DELIVERY ALL OVER INDIA</span>
              <span className="mx-4">⚡ SECURE DISPATCH TERMINAL</span>
              <span className="mx-4">⚡ FREE DELIVERY ALL OVER INDIA</span>
              <span className="mx-4">⚡ VOTE ROACH</span>
              <span className="mx-4">⚡ FREE DELIVERY ALL OVER INDIA</span>
              <span className="mx-4">⚡ SECURE DISPATCH TERMINAL</span>
              <span className="mx-4">⚡ FREE DELIVERY ALL OVER INDIA</span>
              <span className="mx-4">⚡ VOTE ROACH</span>
            </div>
            <div className="flex shrink-0 animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]" aria-hidden="true">
              <span className="mx-4">⚡ FREE DELIVERY ALL OVER INDIA</span>
              <span className="mx-4">⚡ SECURE DISPATCH TERMINAL</span>
              <span className="mx-4">⚡ FREE DELIVERY ALL OVER INDIA</span>
              <span className="mx-4">⚡ VOTE ROACH</span>
              <span className="mx-4">⚡ FREE DELIVERY ALL OVER INDIA</span>
              <span className="mx-4">⚡ SECURE DISPATCH TERMINAL</span>
              <span className="mx-4">⚡ FREE DELIVERY ALL OVER INDIA</span>
              <span className="mx-4">⚡ VOTE ROACH</span>
            </div>
          </div>
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
