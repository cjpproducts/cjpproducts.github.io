import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useShop } from "../context/ShopContext";
import { Product, Size } from "../types";
import { formatPrice } from "../lib/utils";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart } = useShop();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | "">("");
  const [smartphoneModel, setSmartphoneModel] = useState("");

  useEffect(() => {
    if (products.length > 0 && id) {
      const foundProduct = products.find(p => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
      }
    }
  }, [id, products]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="font-display text-4xl uppercase mb-4">Product Not Found.</h2>
        <Link to="/" className="inline-block bg-cjp-dark text-white px-6 py-3 font-display uppercase hover:bg-cjp-accent transition-colors shadow-[4px_4px_0px_#1a1a1a] active:translate-y-1 active:translate-x-1 active:shadow-none">
          Return to HQ
        </Link>
      </div>
    );
  }

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
      alert("Please select a size first.");
      return;
    }
    if (product.category === "mobile-cover" && !smartphoneModel.trim()) {
      alert("Please enter your smartphone model.");
      return;
    }
    
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
    <div className="container mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-2 mb-8 text-gray-600 hover:text-cjp-accent font-bold uppercase transition-colors">
        <ArrowLeft size={20} /> Back to Products
      </Link>
      
      <div className="bg-white border-4 border-cjp-dark shadow-[12px_12px_0px_#1a1a1a] flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-1/2 border-b-4 md:border-b-0 md:border-r-4 border-cjp-dark bg-gray-100 flex items-center justify-center p-8">
          <motion.img 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            src={product.imageUrl || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop"} 
            alt={product.name}
            className="w-full h-auto max-h-[600px] object-contain shadow-xl border-4 border-cjp-dark bg-white"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop";
            }}
          />
        </div>
        
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col">
          <h1 className="font-display text-4xl md:text-5xl uppercase leading-tight mb-4">{product.name}</h1>
          
          <div className="font-display text-4xl text-cjp-accent mb-8">
            {formatPrice(currentPrice)}
            {product.category === "t-shirt" && !selectedSize && availableSizes.length > 0 && (
              <span className="text-sm font-sans text-gray-500 block mt-2">* Pick a size for the final price</span>
            )}
          </div>
          
          <div className="prose prose-lg mb-10 max-w-none text-gray-700">
            <p className="font-medium">{product.description}</p>
          </div>
          
          <div className="mt-auto space-y-8 bg-gray-50 p-6 border-2 border-dashed border-gray-300">
            {product.category === "t-shirt" && availableSizes.length > 0 && (
              <div>
                <label className="text-sm font-bold uppercase text-gray-800 block mb-3">Select Size:</label>
                <div className="flex gap-3 flex-wrap">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-14 h-14 text-xl border-2 font-bold transition-all ${
                        selectedSize === size
                          ? "border-cjp-accent bg-cjp-accent text-white shadow-[4px_4px_0px_#1a1a1a] translate-y-[-2px] translate-x-[-2px]"
                          : "border-cjp-dark bg-white text-cjp-dark hover:shadow-[4px_4px_0px_#1a1a1a] hover:translate-y-[-2px] hover:translate-x-[-2px]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.category === "mobile-cover" && (
              <div>
                <label className="text-sm font-bold uppercase text-gray-800 block mb-3">Smartphone Model:</label>
                <input
                  type="text"
                  value={smartphoneModel}
                  onChange={(e) => setSmartphoneModel(e.target.value)}
                  placeholder="e.g. iPhone 15 Pro Max, Samsung S24 Ultra"
                  className="w-full border-2 border-cjp-dark bg-white px-4 py-4 text-lg focus:outline-none focus:ring-4 focus:ring-cjp-accent/30 font-bold"
                />
                <p className="text-xs font-bold text-gray-500 mt-2 uppercase">Please enter the exact model name</p>
              </div>
            )}

            <button 
              onClick={handleAdd}
              className="w-full bg-cjp-accent text-white py-5 font-display text-2xl uppercase hover:bg-cjp-dark transition-colors shadow-[6px_6px_0px_#1a1a1a] active:translate-y-2 active:translate-x-2 active:shadow-none flex items-center justify-center gap-3"
            >
              <ShoppingCart size={28} /> Add to Rations (Cart)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
