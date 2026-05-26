import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useShop } from "../context/ShopContext";
import { Product, Size } from "../types";
import { formatPrice } from "../lib/utils";
import { ShoppingCart, ArrowLeft, Share2, Link as LinkIcon, Check } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { motion } from "motion/react";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart } = useShop();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedSize, setSelectedSize] = useState<Size | "">("");
  const [smartphoneModel, setSmartphoneModel] = useState("");
  const [copiedProduct, setCopiedProduct] = useState(false);
  const [copiedSite, setCopiedSite] = useState(false);

  const pricesObj = product?.tShirtPrices || {};
  const currentPrice = product 
    ? (product.category === "t-shirt" && selectedSize && pricesObj[selectedSize] !== undefined 
      ? pricesObj[selectedSize]! 
      : product.price)
    : 0;

  useEffect(() => {
    if (products.length > 0 && id) {
      const foundProduct = products.find(p => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
        
        // Find related products (same category, exclude current)
        const related = products
          .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
          .slice(0, 3);
        setRelatedProducts(related);
      }
    }
    // Reset selections on route change
    setSelectedSize("");
    setSmartphoneModel("");
  }, [id, products]);

  // Dynamically inject Google Shopping Product Structured Data for top ranking
  useEffect(() => {
    if (product) {
      const existingScript = document.getElementById("product-schema-ld");
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.id = "product-schema-ld";
      script.type = "application/ld+json";
      
      const schemaData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.imageUrl || "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop",
        "description": product.description,
        "sku": product.id,
        "mpn": product.id,
        "brand": {
          "@type": "Brand",
          "name": "Cockroach Janta Party"
        },
        "offers": {
          "@type": "Offer",
          "url": window.location.href,
          "priceCurrency": "INR",
          "price": currentPrice.toString(),
          "priceValidUntil": "2030-12-31",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "Cockroach Janta Party"
          },
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": "0",
              "currency": "INR"
            },
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "IN"
            }
          },
          "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "applicableCountry": "IN",
            "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
            "merchantReturnDays": "7",
            "returnMethod": "https://schema.org/ReturnByMail",
            "returnFees": "https://schema.org/FreeReturn"
          }
        }
      };

      script.textContent = JSON.stringify(schemaData);
      document.head.appendChild(script);

      // Dynamically update document title & meta description for aggressive Google Search optimization
      const originalTitle = document.title;
      const originalMetaDesc = document.querySelector('meta[name="description"]')?.getAttribute("content");
      
      document.title = `${product.name} - Official Cockroach Janta Party Merch`;
      
      const metaDescEl = document.querySelector('meta[name="description"]');
      if (metaDescEl) {
        metaDescEl.setAttribute("content", `Buy ${product.name} online at Cockroach Janta Party Store! ${product.description.slice(0, 150)}... High quality, radiation resistant, Free Delivery all over India!`);
      }

      return () => {
        const scriptToRemove = document.getElementById("product-schema-ld");
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
        document.title = originalTitle;
        if (metaDescEl && originalMetaDesc) {
          metaDescEl.setAttribute("content", originalMetaDesc);
        }
      };
    }
  }, [product, currentPrice]);

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

  const availableSizes = Object.entries(pricesObj)
    .filter(([_, price]) => price !== undefined)
    .map(([size, _]) => size as Size);

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

  const handleShareProduct = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedProduct(true);
      setTimeout(() => setCopiedProduct(false), 2000);
    } catch (err) {
      console.error("Failed to copy link");
    }
  };

  const handleShareWebsite = async () => {
    try {
      const url = window.location.origin;
      await navigator.clipboard.writeText(url);
      setCopiedSite(true);
      setTimeout(() => setCopiedSite(false), 2000);
    } catch (err) {
      console.error("Failed to copy link");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-cjp-accent font-bold uppercase transition-colors">
          <ArrowLeft size={20} /> Back to Products
        </Link>
        <div className="flex gap-2">
          <button 
            onClick={handleShareProduct}
            className="flex items-center gap-2 text-xs font-bold uppercase bg-white border-2 border-cjp-dark px-3 py-1.5 shadow-[2px_2px_0px_#1a1a1a] hover:bg-gray-100 transition-colors active:translate-y-1 active:translate-x-1 active:shadow-none"
          >
            {copiedProduct ? <Check size={14} className="text-green-600" /> : <Share2 size={14} />}
            {copiedProduct ? "Link Copied!" : "Share Product"}
          </button>
          <button 
            onClick={handleShareWebsite}
            className="flex items-center gap-2 text-xs font-bold uppercase bg-white border-2 border-cjp-dark px-3 py-1.5 shadow-[2px_2px_0px_#1a1a1a] hover:bg-gray-100 transition-colors active:translate-y-1 active:translate-x-1 active:shadow-none"
          >
            {copiedSite ? <Check size={14} className="text-green-600" /> : <LinkIcon size={14} />}
            {copiedSite ? "Copied!" : "Share Website"}
          </button>
        </div>
      </div>
      
      <div className="bg-white border-4 border-cjp-dark shadow-[12px_12px_0px_#1a1a1a] flex flex-col md:flex-row overflow-hidden mb-16">
        <div className="w-full md:w-1/2 border-b-4 md:border-b-0 md:border-r-4 border-cjp-dark bg-gray-100 flex items-center justify-center p-8">
          <motion.img 
            key={product.id}
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
              <ShoppingCart size={28} /> Add to Cart
            </button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="font-display text-4xl uppercase mb-8 border-b-4 border-cjp-dark pb-4">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedProducts.map(rp => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
