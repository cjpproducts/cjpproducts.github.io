import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ImagePlus, PackagePlus, AlertOctagon, Trash2, Download, ClipboardList, CheckCircle2, Clock, Truck, Upload } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { formatPrice } from "../lib/utils";

export function Admin() {
  const { products, addProduct, removeProduct, orders, updateOrderStatus, deleteOrder, productsSold, updateProductsSold } = useShop();
  const [activeTab, setActiveTab] = useState<"inventory" | "orders">("orders");
  
  const [name, setName] = useState("");
  const [category, setCategory] = useState<import("../types").ProductCategory>("other");
  const [price, setPrice] = useState("");
  const [tShirtPrices, setTShirtPrices] = useState<Partial<Record<import("../types").Size, number>>>({});
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // Authentication System
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("cjp_admin_auth") === "true";
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "priyamkesh8825") {
      setIsAuthenticated(true);
      localStorage.setItem("cjp_admin_auth", "true");
      setAuthError("");
    } else {
      setAuthError("INCORRECT SECURITY ACCESS CODE. THE PARTY IS WATCHING.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("cjp_admin_auth");
    setPassword("");
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !description) return;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      await addProduct({
        name,
        category,
        price: category === "t-shirt" && Object.entries(tShirtPrices).length > 0 
          ? Math.min(...Object.values(tShirtPrices).filter(v => v !== undefined) as number[]) 
          : Number(price),
        ...(category === "t-shirt" ? { tShirtPrices } : {}),
        description,
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?q=80&w=800&auto=format&fit=crop",
      });

      setName("");
      setCategory("other");
      setPrice("");
      setTShirtPrices({});
      setDescription("");
      setImageUrl("");
      setSubmitSuccess(true);
      // clear success banner after a few seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err: any) {
      console.error("Publishing failed:", err);
      try {
        const parsed = JSON.parse(err.message);
        setSubmitError(parsed.error || "Failed to publish product.");
      } catch {
        setSubmitError(err.message || "Unknown publishing error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (PNG, JPG, WEBP, GIF etc.)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const img = new Image();
        img.src = event.target.result as string;
        img.onload = () => {
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedUrl = canvas.toDataURL("image/jpeg", 0.7);
            setImageUrl(compressedUrl);
          } else {
            setImageUrl(event.target.result as string);
          }
        };
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `cjp_inventory_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-cjp-light px-4 py-12">
        <div className="w-full max-w-md bg-white border-4 border-cjp-dark p-8 shadow-[12px_12px_0px_#ff4500] text-center">
          <div className="bg-red-600 text-white p-4 inline-block shadow-[4px_4px_0px_#1a1a1a] rotate-[-3deg] mb-6">
            <AlertOctagon size={48} className="animate-pulse" />
          </div>
          
          <h1 className="font-display text-4xl uppercase tracking-tight mb-2">War Room Lockout</h1>
          <p className="text-gray-600 font-bold uppercase text-xs tracking-wider mb-8">
            Access to CJP Party Headquarters is restricted. <br />Comply with security checks.
          </p>
          
          <form onSubmit={handleLogin} className="space-y-6 text-left">
            <div className="space-y-2">
              <label className="font-bold uppercase text-xs tracking-wider text-gray-700 block">
                Enter Secret Access Code
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setAuthError("");
                }}
                required
                className="w-full border-4 border-cjp-dark bg-cjp-light px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-cjp-accent text-center text-lg shadow-[4px_4px_0px_#1a1a1a]"
                placeholder="••••••••••••"
              />
            </div>

            {authError && (
              <div className="border-2 border-red-600 bg-red-50 text-red-700 font-bold uppercase text-xs p-3 text-center">
                {authError}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-cjp-dark text-white font-display uppercase text-2xl py-4 hover:bg-cjp-accent transition-colors shadow-[6px_6px_0px_#ff4500] active:translate-y-1 active:translate-x-1 active:shadow-none cursor-pointer"
            >
              Verify Authority
            </button>
          </form>

          <div className="mt-8 pt-4 border-t-2 border-dashed border-gray-200">
            <Link to="/" className="text-sm font-bold uppercase text-gray-500 hover:text-cjp-accent transition-colors">
              ← Return to Public Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b-4 border-cjp-dark pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-black text-green-500 p-3 shadow-[4px_4px_0px_#1a1a1a] border border-green-500">
            <AlertOctagon size={40} />
          </div>
          <div>
            <h1 className="font-mono text-3xl font-bold uppercase tracking-tight text-gray-900 border-b-4 border-black inline-block pb-1 pr-4">SYS&gt; ADMIN_TERMINAL</h1>
            <div className="flex items-center gap-3 mt-3">
              <span className="font-mono text-gray-600 font-bold uppercase text-xs px-2 py-0.5 bg-gray-200 border border-gray-400">AUTH: OMEGA</span>
              <span className="text-xs text-green-700 font-bold uppercase font-mono flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse block"></span>
                SYSTEM ACTIVE
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex border-2 border-black bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-2 font-mono font-bold uppercase text-xs cursor-pointer transition-colors ${
                activeTab === "orders" ? "bg-black text-green-400 shadow-[2px_2px_0px_#4ade80]" : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              [ Manage Orders ]
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`px-6 py-2 font-mono font-bold uppercase text-xs cursor-pointer transition-colors ${
                activeTab === "inventory" ? "bg-black text-green-400 shadow-[2px_2px_0px_#4ade80]" : "hover:bg-gray-200 text-gray-700"
              }`}
            >
              [ Inventory Control ]
            </button>
          </div>
          
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white font-mono border-2 border-black font-bold uppercase px-4 py-2 text-xs shadow-[2px_2px_0px_#000] hover:bg-black transition-colors cursor-pointer"
          >
            END_SESSION
          </button>
        </div>
      </div>

      {activeTab === "inventory" && (
        <div className="grid md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-6">
            <div className="bg-white border-4 border-cjp-dark p-6 shadow-[8px_8px_0px_#1a1a1a]">
              <h2 className="font-mono text-xl font-bold uppercase mb-4 text-gray-900 border-b-2 border-dashed border-gray-400 pb-2">
                &gt; SYSTEM_STATS
              </h2>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="font-bold uppercase text-xs block text-gray-600 mb-1">Total Rations Sold</label>
                  <input
                    type="number"
                    value={productsSold}
                    onChange={(e) => updateProductsSold(parseInt(e.target.value) || 0)}
                    className="w-full border-2 border-black bg-gray-50 px-4 py-2 font-mono font-bold text-xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-400 text-cjp-dark"
                  />
                </div>
              </div>
            </div>

            {/* ADD PRODUCT FORM */}
            <div className="bg-white border-4 border-cjp-dark p-6 shadow-[8px_8px_0px_#ff4500]">
          <h2 className="font-display text-3xl uppercase mb-6 flex items-center gap-2 border-b-2 border-dashed border-gray-300 pb-3">
            <PackagePlus /> Issue New Ration
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="font-bold uppercase text-sm block">Designation (Product Name)</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border-2 border-cjp-dark bg-cjp-light px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cjp-accent"
                placeholder="e.g. Resistance Banner"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase text-sm block">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value as import("../types").ProductCategory)}
                className="w-full border-2 border-cjp-dark bg-cjp-light px-4 py-3 font-bold uppercase focus:outline-none focus:ring-2 focus:ring-cjp-accent cursor-pointer"
              >
                <option value="other">Other Merchandise</option>
                <option value="t-shirt">T-Shirt (Sized)</option>
                <option value="mobile-cover">Mobile Cover</option>
              </select>
            </div>
            
            {category === "t-shirt" ? (
              <div className="space-y-2 border-2 border-dashed border-gray-300 p-4">
                <label className="font-bold uppercase text-sm block mb-2">Pricing by Size (INR)</label>
                {(["S", "M", "L", "XL", "XXL"] as import("../types").Size[]).map((size) => (
                  <div key={size} className="flex items-center gap-4">
                    <span className="font-bold text-gray-700 w-8">{size}:</span>
                    <input 
                      type="number"
                      value={tShirtPrices[size] || ""}
                      onChange={(e) => setTShirtPrices(prev => ({ ...prev, [size]: e.target.value ? Number(e.target.value) : undefined }))}
                      min="0"
                      className="flex-1 border-2 border-cjp-dark bg-cjp-light px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cjp-accent"
                      placeholder={`Price for ${size}`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                <label className="font-bold uppercase text-sm block">Contribution Amount (Base Price INR)</label>
                <input 
                  type="number" 
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  min="0"
                  step="1"
                  className="w-full border-2 border-cjp-dark bg-cjp-light px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cjp-accent"
                  placeholder="e.g. 500"
                />
              </div>
            )}
            
            <div className="space-y-1">
              <label className="font-bold uppercase text-sm block">Visual Propaganda (Image Upload)</label>
              
              {/* Drag and Drop Zone */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed ${
                  dragActive ? "border-cjp-accent bg-amber-50" : "border-cjp-dark bg-cjp-light"
                } p-6 text-center transition-all flex flex-col items-center justify-center min-h-[160px] group cursor-pointer hover:border-cjp-accent`}
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <input 
                  id="file-upload"
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {imageUrl ? (
                  <div className="space-y-3 w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="max-h-32 object-contain border-2 border-cjp-dark shadow-[4px_4px_0px_#1a1a1a]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="bg-red-600 text-white font-bold text-xs uppercase px-3 py-1.5 shadow-[2px_2px_0px_#000] hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        Remove Image
                      </button>
                      <button
                        type="button"
                        onClick={() => document.getElementById("file-upload")?.click()}
                        className="bg-cjp-dark text-white font-bold text-xs uppercase px-3 py-1.5 shadow-[2px_2px_0px_#ff4500] hover:bg-cjp-accent transition-colors cursor-pointer"
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                    <Upload className="text-gray-500 group-hover:text-cjp-accent transition-colors" size={32} />
                    <p className="font-bold text-sm uppercase">Drag & Drop Image or Click to Browse</p>
                    <p className="text-xs text-gray-500">Supports PNG, JPG, GIF, WEBP</p>
                  </div>
                )}
              </div>

              {/* URL fallback */}
              <div className="pt-2">
                <span className="text-xs font-bold text-gray-500 uppercase">Or provide a web URL manually:</span>
                <div className="relative mt-1">
                  <ImagePlus className="absolute left-3 top-3.5 text-gray-400" size={20} />
                  <input 
                    type="url" 
                    value={imageUrl.startsWith("data:") ? "" : imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full border-2 border-cjp-dark bg-cjp-light pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-cjp-accent text-sm"
                    placeholder="https://..."
                  />
                  {imageUrl.startsWith("data:") && (
                    <span className="absolute right-3 top-2.5 text-xs bg-green-100 text-green-800 font-bold px-2 py-1 border border-green-500">
                      Uploaded File Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase text-sm block">Manifesto (Description)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="w-full border-2 border-cjp-dark bg-cjp-light px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cjp-accent resize-none"
                placeholder="Describe the utility of this item in the revolution..."
              />
            </div>

            {submitSuccess && (
              <div className="border-4 border-green-500 bg-green-50 text-green-800 p-4 font-bold uppercase text-xs flex flex-col gap-1 items-center justify-center animate-bounce shadow-[4px_4px_0px_#10b981]">
                <span>✓ Propaganda Published Successfully!</span>
                <span className="text-[10px] text-green-600">The masses can now view and purchase this ration all over the world.</span>
              </div>
            )}

            {submitError && (
              <div className="border-4 border-red-500 bg-red-50 text-red-800 p-4 font-bold uppercase text-xs text-center shadow-[4px_4px_0px_#ef4444]">
                ⚠ Blocked: {submitError}
              </div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full font-display uppercase text-2xl py-4 transition-all shadow-[4px_4px_0px_#000] active:translate-y-1 active:translate-x-1 active:shadow-none cursor-pointer flex items-center justify-center gap-2 ${
                isSubmitting 
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed shadow-none translate-y-1 translate-x-1" 
                  : "bg-cjp-dark text-white hover:bg-cjp-accent"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="h-5 w-5 border-4 border-white border-t-transparent rounded-full animate-spin"></span>
                  Publishing...
                </>
              ) : (
                "Publish to Masses"
              )}
            </button>
          </form>
        </div>
        </div>

        {/* INVENTORY LIST */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-4 border-cjp-dark pb-3">
            <h2 className="font-display text-3xl uppercase flex items-center gap-2">
              Current Inventory ({products.length})
            </h2>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 border-2 border-cjp-dark font-bold uppercase px-3 py-2 text-sm transition-colors shadow-[2px_2px_0px_#1a1a1a] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none"
            >
              <Download size={18} />
              Export JSON
            </button>
          </div>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {products.length === 0 ? (
              <p className="text-gray-500 italic p-4 text-center border-2 border-dashed border-gray-400">Inventory depleted. Restock immediately.</p>
            ) : (
              products.map((product) => (
                <div key={product.id} className="flex gap-4 bg-white border-2 border-cjp-dark p-3">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-20 h-20 object-cover border border-gray-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop";
                    }}
                  />
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-bold uppercase leading-tight line-clamp-1">{product.name}</h3>
                    <p className="text-cjp-accent font-display text-xl">{formatPrice(product.price)}</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (window.confirm("Discontinue this item?")) {
                        removeProduct(product.id);
                      }
                    }}
                    className="p-3 bg-gray-100 border-2 border-transparent hover:border-cjp-dark hover:bg-red-50 text-gray-500 hover:text-red-600 transition-all cursor-pointer flex flex-col justify-center h-full self-center ml-2"
                  >
                    <Trash2 size={24} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_#1a1a1a]">
          <h2 className="font-mono text-2xl font-bold uppercase mb-6 flex items-center gap-3 border-b-2 border-dashed border-gray-400 pb-3">
            <ClipboardList /> &gt; FETCH_ORDERS_LOG
          </h2>
          
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-10 opacity-60 font-mono">
                <ClipboardList size={48} className="mx-auto mb-4" />
                <p className="text-xl uppercase font-bold">Query returned 0 results.</p>
                <p className="font-bold text-gray-500">Wait for citizens to comply.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="border border-gray-400 bg-gray-50 flex flex-col md:flex-row shadow-[4px_4px_0px_#1a1a1a]">
                  <div className="flex-1 p-5">
                    <div className="flex justify-between items-center border-b-2 border-gray-300 pb-2 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono bg-black text-green-400 px-2 py-0.5 text-xs">ID: {order.id.slice(0, 10)}...</span>
                        <span className="font-mono text-xs font-bold text-gray-500">
                          TS: {new Date(order.date).toLocaleString()}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-lg text-cjp-dark">{formatPrice(order.total)}</span>
                    </div>
                    
                    <div className="bg-black p-4 text-xs font-mono border border-green-500 text-green-400 shadow-[inset_0_0_10px_rgba(0,255,0,0.1)] mb-4">
                      <p className="text-white uppercase mb-2 border-b border-green-900 pb-1">&gt; CUSTOMER_DATA</p>
                      <ul className="space-y-1">
                        <li><span className="text-gray-400">NAME:</span> {order.customerInfo?.name || "Unknown"}</li>
                        <li><span className="text-gray-400">PHON:</span> {order.customerInfo?.phone || "Unknown"}</li>
                        {order.customerInfo?.whatsapp && <li><span className="text-gray-400">WAPP:</span> {order.customerInfo.whatsapp}</li>}
                        <li><span className="text-gray-400">ADDR:</span> {order.customerInfo?.address || "Unknown"}</li>
                        <li><span className="text-gray-400">ZCODE:</span> {order.customerInfo?.pincode || "Unknown"}</li>
                        <li className="uppercase mt-2 text-yellow-400 border-t border-green-900 pt-2">
                          PAY: {order.customerInfo?.paymentMethod === 'cod' ? 'CASH ON DELIVERY' : 'PREPAID'}
                        </li>
                        <li className={`uppercase mt-1 border-t border-green-900 pt-1 ${order.customerInfo?.easyReturnEnabled ? 'text-white' : 'text-gray-500'}`}>
                          RTN_POLICY: {order.customerInfo?.easyReturnEnabled ? 'ENABLED (+29 RS)' : 'DISABLED'}
                        </li>
                      </ul>
                    </div>

                    <p className="font-mono text-xs font-bold uppercase border-b-2 border-dashed border-gray-400 pb-1 mb-2">&gt; ITEMS_MANIFEST</p>
                    <ul className="space-y-2 font-mono">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex gap-4 text-sm bg-white border border-gray-300 p-2 shadow-sm">
                          {item.imageUrl && (
                            <div className="shrink-0">
                              <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover border border-gray-400" onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop";
                              }}/>
                            </div>
                          )}
                          <div className="flex-1 flex flex-col justify-center">
                            <span className="font-bold text-gray-900 uppercase text-sm leading-tight">{item.quantity} x {item.name}</span>
                            <div className="text-[10px] sm:text-xs text-gray-600 mt-2 flex flex-wrap gap-1 sm:gap-2">
                              {item.selectedSize && <span className="bg-gray-200 px-1 border border-gray-400 font-bold">SZ:{item.selectedSize}</span>}
                              {item.smartphoneModel && <span className="bg-gray-200 px-1 border border-gray-400 font-bold">MDL:{item.smartphoneModel}</span>}
                              <span className="bg-gray-200 px-1 border border-gray-400 font-bold">PRC:{formatPrice(item.cartPrice)}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-4 flex justify-end border-t-2 border-gray-300 pt-4">
                      <button 
                        onClick={() => {
                          if (window.confirm("PURGE THIS ORDER FROM SYSTEM MEMORY?")) {
                            deleteOrder(order.id);
                          }
                        }}
                        className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 border border-red-300 hover:bg-red-600 hover:text-white transition-colors text-xs uppercase font-bold font-mono"
                      >
                        <Trash2 size={14} /> PURGE_RECORD
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-200 flex flex-col gap-2 min-w-[200px] border-t border-gray-400 md:border-t-0 md:border-l p-5">
                    <p className="font-bold font-mono uppercase text-xs text-gray-600 mb-1 border-b border-gray-300 pb-2">Status_UPDATE()</p>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'pending')}
                      className={`flex items-center gap-2 p-2 font-bold font-mono uppercase text-xs border transition-colors ${
                        order.status === 'pending' 
                          ? 'bg-yellow-300 border-yellow-600 text-yellow-900 shadow-[2px_2px_0px_#a16207]' 
                          : 'bg-white border-gray-400 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Clock size={14} /> PENDING
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'shipped')}
                      className={`flex items-center gap-2 p-2 font-bold font-mono uppercase text-xs border transition-colors ${
                        order.status === 'shipped' 
                          ? 'bg-blue-300 border-blue-600 text-blue-900 shadow-[2px_2px_0px_#1d4ed8]' 
                          : 'bg-white border-gray-400 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Truck size={14} /> SHIPPED
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className={`flex items-center gap-2 p-2 font-bold font-mono uppercase text-xs border transition-colors ${
                        order.status === 'delivered' 
                          ? 'bg-green-300 border-green-600 text-green-900 shadow-[2px_2px_0px_#166534]' 
                          : 'bg-white border-gray-400 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <CheckCircle2 size={14} /> DELIVERED
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
