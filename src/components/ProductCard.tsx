import { Product, Size } from "../types";
import { useShop } from "../context/ShopContext";
import { formatPrice } from "../lib/utils";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function ProductCard({ product }: { product: Product; key?: string }) {
  const { addToCart } = useShop();
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = useState<Size | "">("");
  const [smartphoneModel, setSmartphoneModel] = useState("");
  const [error, setError] = useState<string | null>(null);

  const pricesObj = product.tShirtPrices || {};
  const availableSizes = Object.entries(pricesObj)
    .filter(([_, price]) => price !== undefined)
    .map(([size, _]) => size as Size);

  const currentPrice = 
    product.category === "t-shirt" && selectedSize && pricesObj[selectedSize] !== undefined 
      ? pricesObj[selectedSize]! 
      : product.price;

  const handleAdd = () => {
    if (product.category === "t-shirt" && !selectedSize) {
      setError("Please select a size first.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (product.category === "mobile-cover" && !smartphoneModel.trim()) {
      setError("Please enter your model.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    setError(null);
    const cartItemId = `${product.id}-${selectedSize || 'none'}-${smartphoneModel.trim() || 'none'}`;
    addToCart({
      ...product,
      cartItemId,
      quantity: 1,
      selectedSize: selectedSize || undefined,
      smartphoneModel: smartphoneModel.trim() || undefined,
      cartPrice: currentPrice
    });
  };

  return (
    <div className="group flex flex-col bg-white border-4 border-cjp-dark shadow-[8px_8px_0px_#1a1a1a] hover:translate-y-[-4px] hover:shadow-[12px_12px_0px_#ff4500] transition-all duration-300">
      <Link to={`/product/${product.id}`} className="relative overflow-hidden bg-gray-100 border-b-4 border-cjp-dark block">
        <img 
          src={product.imageUrl || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop"} 
          alt={product.name}
          className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-500 max-h-[300px]"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop";
          }}
        />
      </Link>
      <div className="p-3 sm:p-5 flex flex-col flex-grow">
        <Link to={`/product/${product.id}`} className="hover:text-cjp-accent transition-colors block">
          <h3 className="font-display text-xl sm:text-2xl uppercase leading-tight mb-2 line-clamp-2">{product.name}</h3>
        </Link>
        <p className="text-xs sm:text-sm font-medium text-gray-600 mb-4 line-clamp-2 flex-grow">{product.description}</p>
        
        {product.category === "t-shirt" && availableSizes.length > 0 && (
          <div className="mb-4">
            <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Select Size:</label>
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-base border-2 font-bold transition-colors ${
                    selectedSize === size
                      ? "border-cjp-accent bg-cjp-accent text-white"
                      : "border-gray-300 hover:border-cjp-dark text-gray-700"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.category === "mobile-cover" && (
          <div className="mb-4">
            <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Smartphone Model:</label>
            <input
              type="text"
              value={smartphoneModel}
              onChange={(e) => setSmartphoneModel(e.target.value)}
              placeholder="e.g. iPhone 15 Pro Max"
              className="w-full border-2 border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-cjp-dark"
            />
          </div>
        )}

        {error && (
          <div className="mb-3 text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-50 border border-red-200 px-2.5 py-1 flex items-center gap-1.5 rounded-sm">
            ⚠️ <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <span className="font-display text-xl sm:text-2xl text-cjp-accent leading-none">
            {formatPrice(currentPrice)}
            {product.category === "t-shirt" && !selectedSize && availableSizes.length > 0 && <span className="text-[10px] sm:text-xs text-gray-500 block mt-1">* Pick size for price</span>}
          </span>
          <button 
            onClick={handleAdd}
            className="bg-cjp-dark text-white p-2 sm:p-3 hover:bg-cjp-accent transition-colors flex items-center justify-center shrink-0"
            aria-label="Add to cart"
          >
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
