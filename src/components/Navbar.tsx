import { Link } from "react-router-dom";
import { ShoppingCart, Bug, ShieldAlert } from "lucide-react";
import { useShop } from "../context/ShopContext";

export function Navbar() {
  const { cartItemCount, setIsCartOpen } = useShop();

  return (
    <header className="sticky top-0 z-40 w-full border-b-4 border-cjp-dark bg-cjp-light">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-cjp-dark text-cjp-light p-2 rotate-[-5deg] group-hover:rotate-0 transition-transform duration-300 shadow-[4px_4px_0px_#ff4500]">
            <Bug size={32} />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-2xl leading-none uppercase tracking-wide">Cockroach</span>
            <span className="font-display text-xl leading-none uppercase text-cjp-accent tracking-tighter">Janta Party</span>
          </div>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link to="/admin" className="hidden sm:flex items-center gap-2 font-bold uppercase hover:text-cjp-accent transition-colors">
            <ShieldAlert size={20} />
            <span>Admin</span>
          </Link>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 bg-cjp-dark text-cjp-light hover:bg-cjp-accent transition-colors shadow-[4px_4px_0px_#ff4500]"
          >
            <ShoppingCart size={24} />
            {cartItemCount > 0 && (
              <span className="absolute -top-3 -right-3 bg-cjp-accent text-white font-bold text-xs h-6 w-6 flex items-center justify-center rounded-full border-2 border-cjp-dark">
                {cartItemCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
