import { useState } from "react";
import { ShieldAlert, TrendingUp, Search } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { ProductCard } from "../components/ProductCard";

export function Home() {
  const { products, productsSold } = useShop();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "t-shirt" | "mobile-cover" | "other">("all");

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* HERO SECTION */}
      <section className="bg-cjp-dark text-cjp-light py-10 md:py-20 border-b-8 border-cjp-accent overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <h1 className="font-display text-5xl md:text-8xl uppercase tracking-tighter leading-[0.85] mb-4 md:mb-6 drop-shadow-[4px_4px_0px_#ff4500]">
              Survive. Adapt. <br/> Multiply.
            </h1>
            <p className="text-lg md:text-2xl font-bold uppercase tracking-wide text-gray-300 mb-6 md:mb-10 max-w-2xl border-l-4 border-cjp-accent pl-4 md:pl-6">
              The only political movement guaranteed to outlive a nuclear apocalypse. Secure your official merchandise today.
            </p>
            <div className="flex flex-col items-start gap-4">
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                <a href="#store" className="bg-cjp-accent text-white font-display text-2xl md:text-3xl uppercase px-6 py-3 md:px-10 md:py-5 hover:bg-white hover:text-cjp-accent transition-colors shadow-[4px_4px_0px_#000] md:shadow-[6px_6px_0px_#000] active:translate-y-1 active:translate-x-1 active:shadow-none inline-flex items-center gap-2 md:gap-3">
                  <TrendingUp className="w-5 h-5 md:w-6 md:h-6" /> Shop Now
                </a>
                <div className="flex items-center gap-2 text-cjp-accent font-bold text-sm md:text-base bg-black/40 px-3 py-1.5 md:px-4 md:py-2 border-2 border-cjp-accent">
                  <ShieldAlert className="w-4 h-4 md:w-5 md:h-5" />
                  <span>100% Radiation Resistant</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-white font-mono font-bold text-sm md:text-base bg-gray-900 px-3 py-1.5 md:px-4 md:py-2 border border-gray-600 shadow-[2px_2px_0px_#000]">
                <span>PRODUCTS SOLD: </span>
                <span className="text-cjp-accent">[{productsSold}]</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STORE SECTION */}
      <section id="store" className="pt-2 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-cjp-dark pb-6 mb-8">
            <div>
              <h2 className="font-display text-5xl md:text-7xl uppercase tracking-tighter">Official Products</h2>
              <p className="text-gray-600 font-bold uppercase mt-2">Fund the revolution. Buy our stuff.</p>
            </div>
            
            <div className="mt-8 md:mt-0 max-w-sm w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border-4 border-cjp-dark bg-white font-bold focus:outline-none focus:ring-4 focus:ring-cjp-accent/30"
                />
                <Search size={22} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 md:gap-4 mb-12 uppercase font-bold text-sm sm:text-base">
            {(["all", "t-shirt", "mobile-cover", "other"] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`py-2 px-6 border-2 transition-all ${
                  activeCategory === cat 
                    ? "bg-cjp-accent text-white border-cjp-accent shadow-[4px_4px_0px_#1a1a1a] translate-y-[-2px] translate-x-[-2px]" 
                    : "bg-white text-cjp-dark border-cjp-dark hover:shadow-[4px_4px_0px_#1a1a1a] hover:translate-y-[-2px] hover:translate-x-[-2px]"
                }`}
              >
                {cat === "all" ? "All" : cat === "t-shirt" ? "T-Shirts" : cat === "mobile-cover" ? "Mobile Covers" : "Others"}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white border-4 border-cjp-dark p-12 text-center shadow-[8px_8px_0px_#1a1a1a]">
              <h3 className="font-display text-4xl uppercase mb-4">No Products Found</h3>
              <p className="text-xl text-gray-600">Try another search or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* FOOTER */}
      <footer className="bg-cjp-dark text-white py-12 border-t-8 border-cjp-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-4xl uppercase tracking-widest text-[#ff4500] mb-4">Vote Roach</h2>
          <p className="text-gray-400 font-bold uppercase tracking-wider mb-8">We were here before you. We will be here after you.</p>
          <p className="text-sm text-gray-600 mb-6">© {new Date().getFullYear()} Cockroach Janta Party. All Rights Reserved. Not a real political party (yet).</p>
          <p className="text-xs text-gray-500 font-mono font-bold uppercase tracking-wider">
            Made by <a href="https://polarithweb.github.io" target="_blank" rel="noopener noreferrer" className="text-cjp-accent hover:text-white transition-colors underline decoration-2 underline-offset-2">Polarith Web</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
