import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ImagePlus, PackagePlus, AlertOctagon, Trash2, Download, ClipboardList, CheckCircle2, Clock, Truck, Upload } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { formatPrice } from "../lib/utils";

export function Admin() {
  const { products, addProduct, removeProduct, orders, updateOrderStatus, deleteOrder, productsSold, updateProductsSold, visitorsCount, updateVisitorsCount } = useShop();
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
      setAuthError("Incorrect password. Access denied.");
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

  const [localProductsSold, setLocalProductsSold] = useState(productsSold.toString());
  const [localVisitorsCount, setLocalVisitorsCount] = useState(visitorsCount.toString());
  React.useEffect(() => {
    setLocalProductsSold(productsSold.toString());
  }, [productsSold]);
  
  React.useEffect(() => {
    setLocalVisitorsCount(visitorsCount.toString());
  }, [visitorsCount]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-black px-4 py-12">
        <div className="w-full max-w-md bg-black border-4 border-blue-900 p-8 shadow-[12px_12px_0px_#1e3a8a] text-center">
          <div className="bg-blue-600 text-black p-4 inline-block shadow-[4px_4px_0px_#000] rotate-[-3deg] mb-6 border border-blue-800">
            <AlertOctagon size={48} className="animate-pulse" />
          </div>
          
          <h1 className="font-display text-4xl uppercase tracking-tight mb-2 text-blue-400">Admin Login</h1>
          <p className="text-blue-600 font-bold uppercase text-xs tracking-wider mb-8">
            Access to dashboard is restricted.
          </p>
          
          <form onSubmit={handleLogin} className="space-y-6 text-left">
            <div className="space-y-2">
              <label className="font-bold uppercase text-xs tracking-wider text-blue-500 block">
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
                className="w-full border-4 border-blue-900 bg-gray-900 px-4 py-3 font-mono font-bold focus:outline-none focus:ring-4 focus:ring-blue-600 text-center text-lg text-blue-200 shadow-[4px_4px_0px_#000]"
                placeholder="••••••••••••"
              />
            </div>

            {authError && (
              <div className="border-2 border-red-800 bg-red-900/30 text-red-500 font-bold uppercase text-xs p-3 text-center">
                {authError}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-blue-700 text-black font-display uppercase text-2xl py-4 hover:bg-blue-500 transition-colors shadow-[6px_6px_0px_#1e3a8a] active:translate-y-1 active:translate-x-1 active:shadow-none cursor-pointer"
            >
              Login
            </button>
          </form>

          <div className="mt-8 pt-4 border-t-2 border-dashed border-blue-900">
            <Link to="/" className="text-sm font-bold uppercase text-blue-700 hover:text-blue-400 transition-colors">
              ← Return to Public Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen w-full overflow-x-hidden">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b-4 border-blue-900 pb-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 text-black p-3 shadow-[4px_4px_0px_#000000] border border-blue-800">
              <AlertOctagon size={40} className="text-black" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-4xl text-blue-500 uppercase tracking-tight border-b-4 border-blue-800 break-words pb-1 pr-4">Admin Dashboard</h1>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <span className="font-mono text-black font-bold uppercase text-xs px-2 py-0.5 bg-blue-500 border border-blue-700">Admin Active</span>
                <span className="text-xs text-blue-500 font-bold uppercase font-mono flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse shrink-0 block"></span>
                  Online
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col sm:flex-row border-2 border-blue-900 bg-black p-1 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-4 sm:px-6 py-2 font-mono font-bold uppercase text-xs cursor-pointer transition-colors w-full sm:w-auto ${
                  activeTab === "orders" ? "bg-blue-600 text-black shadow-[2px_2px_0px_#1e3a8a]" : "hover:bg-gray-900 text-blue-600"
                }`}
              >
                Manage Orders
              </button>
              <button
                onClick={() => setActiveTab("inventory")}
                className={`px-4 sm:px-6 py-2 font-mono font-bold uppercase text-xs cursor-pointer transition-colors w-full sm:w-auto ${
                  activeTab === "inventory" ? "bg-blue-600 text-black shadow-[2px_2px_0px_#1e3a8a]" : "hover:bg-gray-900 text-blue-600"
                }`}
              >
                Inventory Control
              </button>
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-blue-800 text-white font-mono border-2 border-blue-900 font-bold uppercase px-4 py-2 text-xs shadow-[2px_2px_0px_#000] hover:bg-black hover:text-blue-500 transition-colors cursor-pointer w-full sm:w-auto"
            >
              Logout
            </button>
          </div>
        </div>

      {activeTab === "inventory" && (
        <div className="grid md:grid-cols-2 gap-12">
          <div className="flex flex-col gap-6">
            <div className="bg-black text-blue-400 border-2 border-blue-800 p-6 shadow-[8px_8px_0px_#1e3a8a] font-mono">
              <h2 className="text-xl font-bold uppercase mb-4 border-b-2 border-dashed border-blue-900 pb-2 flex items-center gap-2">
                System Stats
              </h2>
              <div className="flex flex-col gap-6 sm:gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
                  <label className="font-bold uppercase text-xs text-blue-600 sm:w-32 shrink-0">Total Products Sold:</label>
                  <div className="flex items-center w-full sm:flex-1 gap-2">
                    <span className="text-blue-800 shrink-0">[</span>
                    <input
                      type="number"
                      value={localProductsSold}
                      onChange={(e) => setLocalProductsSold(e.target.value)}
                      className="flex-1 min-w-0 bg-transparent border-b border-blue-900 text-blue-400 px-2 py-1 font-bold text-xl focus:outline-none focus:border-blue-600 text-center"
                    />
                    <span className="text-blue-800 shrink-0">]</span>
                    <button 
                      onClick={() => {
                        const val = parseInt(localProductsSold) || 0;
                        updateProductsSold(val);
                      }}
                      className="ml-1 sm:ml-2 bg-blue-600 text-black font-bold px-3 py-1 text-xs hover:bg-blue-500 active:translate-y-[1px] active:translate-x-[1px] shrink-0"
                    >
                      UPDATE
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full">
                  <label className="font-bold uppercase text-xs text-blue-600 sm:w-32 shrink-0">Visitors Count:</label>
                  <div className="flex items-center w-full sm:flex-1 gap-2">
                    <span className="text-blue-800 shrink-0">[</span>
                    <input
                      type="number"
                      value={localVisitorsCount}
                      onChange={(e) => setLocalVisitorsCount(e.target.value)}
                      className="flex-1 min-w-0 bg-transparent border-b border-blue-900 text-blue-400 px-2 py-1 font-bold text-xl focus:outline-none focus:border-blue-600 text-center"
                    />
                    <span className="text-blue-800 shrink-0">]</span>
                    <button 
                      onClick={() => {
                        const val = parseInt(localVisitorsCount) || 0;
                        updateVisitorsCount(val);
                      }}
                      className="ml-1 sm:ml-2 bg-blue-600 text-black font-bold px-3 py-1 text-xs hover:bg-blue-500 active:translate-y-[1px] active:translate-x-[1px] shrink-0"
                    >
                      UPDATE
                    </button>
                  </div>
                </div>
                
                <p className="text-[10px] text-blue-700 uppercase mt-2 break-words w-full">* Update total sold and visitors counters manually if required.</p>
              </div>
            </div>

            {/* ADD PRODUCT FORM */}
            <div className="bg-black border-2 border-blue-800 p-6 shadow-[8px_8px_0px_#1e3a8a] text-blue-300">
          <h2 className="text-xl uppercase font-bold mb-6 flex items-center gap-3 border-b-2 border-dashed border-blue-900 pb-3 text-blue-400">
            <PackagePlus /> Add Product
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5 text-sm">
            <div className="space-y-1">
              <label className="font-bold uppercase text-xs text-blue-500 block">Product Name</label>
              <div className="flex items-center gap-2 border border-blue-800 bg-gray-900 px-3 py-2">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-transparent focus:outline-none font-bold placeholder-blue-900 text-blue-200"
                  placeholder="e.g. T-Shirt"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase text-xs text-blue-500 block">Category</label>
              <div className="flex items-center gap-2 border border-blue-800 bg-gray-900 px-3 py-2">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as import("../types").ProductCategory)}
                  className="w-full bg-transparent font-bold focus:outline-none cursor-pointer appearance-none text-blue-200"
                >
                  <option value="other">Other Category</option>
                  <option value="t-shirt">T-Shirt</option>
                  <option value="mobile-cover">Mobile Cover</option>
                </select>
              </div>
            </div>
            
            {category === "t-shirt" ? (
              <div className="space-y-3 border border-dashed border-blue-800 p-4 bg-gray-900">
                <label className="font-bold uppercase text-xs text-blue-500 block">Price (INR)</label>
                {(["S", "M", "L", "XL", "XXL"] as import("../types").Size[]).map((size) => (
                  <div key={size} className="flex items-center gap-4 border-b border-blue-900 pb-2">
                    <span className="font-bold text-blue-600 w-8">[{size}]</span>
                    <input 
                      type="number"
                      value={tShirtPrices[size] || ""}
                      onChange={(e) => setTShirtPrices(prev => ({ ...prev, [size]: e.target.value ? Number(e.target.value) : undefined }))}
                      min="0"
                      className="flex-1 bg-transparent border-none text-sm focus:outline-none focus:ring-0 font-bold text-blue-200"
                      placeholder="Price"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                <label className="font-bold uppercase text-xs text-blue-500 block">Price (INR)</label>
                <div className="flex items-center gap-2 border border-blue-800 bg-gray-900 px-3 py-2">
                  <span className="text-blue-800 font-sans">₹</span>
                  <input 
                    type="number" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="0"
                    step="1"
                    className="w-full bg-transparent font-bold focus:outline-none text-blue-200"
                    placeholder="Amount"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-1">
              <label className="font-bold uppercase text-xs text-blue-500 block">Product Image</label>
              
              {/* Drag and Drop Zone */}
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative border border-dashed ${
                  dragActive ? "border-blue-500 bg-blue-900/30" : "border-blue-800 bg-gray-900"
                } p-6 text-center transition-all flex flex-col items-center justify-center min-h-[160px] cursor-pointer hover:border-blue-600`}
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
                  <div className="space-y-4 w-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
                    <img 
                      src={imageUrl} 
                      alt="Preview" 
                      className="max-h-32 object-cover border border-blue-800 shadow-[4px_4px_0px_#000]"
                    />
                    <div className="flex gap-2">
                       <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="bg-black text-red-500 font-bold text-[10px] uppercase px-3 py-1.5 shadow-[2px_2px_0px_#7f1d1d] transition-colors cursor-pointer border border-red-800 hover:bg-neutral-900"
                      >
                        Remove Image
                      </button>
                      <button
                        type="button"
                        onClick={() => document.getElementById("file-upload")?.click()}
                        className="bg-black text-blue-400 font-bold text-[10px] uppercase px-3 py-1.5 shadow-[2px_2px_0px_#1e3a8a] transition-colors cursor-pointer border border-blue-800 hover:bg-neutral-900"
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                    <Upload className="text-blue-700" size={24} />
                    <p className="font-bold text-xs uppercase text-blue-500">Drag & Drop Image or Click to Browse</p>
                    <p className="text-[10px] text-blue-800">Supports PNG, JPG, GIF</p>
                  </div>
                )}
              </div>

              {/* URL fallback */}
              <div className="pt-2">
                <span className="text-[10px] font-bold text-blue-600 uppercase">Or provide a web URL manually:</span>
                <div className="relative mt-1">
                  <ImagePlus className="absolute left-3 top-2.5 text-blue-800" size={16} />
                  <input 
                    type="url" 
                    value={imageUrl.startsWith("data:") ? "" : imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full border border-blue-800 bg-gray-900 pl-10 pr-4 py-2 focus:outline-none font-bold focus:border-blue-600 text-xs text-blue-200"
                    placeholder="https://"
                  />
                  {imageUrl.startsWith("data:") && (
                    <span className="absolute right-3 top-2 text-[10px] text-blue-500 font-bold">
                      Uploaded File Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase text-xs text-blue-500 block">Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="w-full border border-blue-800 bg-gray-900 px-3 py-2 font-bold focus:outline-none focus:border-blue-600 resize-none text-blue-200"
                placeholder="Product description..."
              />
            </div>

            {submitSuccess && (
              <div className="border border-green-500 bg-green-900/30 text-green-400 p-3 font-bold uppercase text-xs flex items-center justify-center shadow-[4px_4px_0px_#14532d]">
                <span>Product published successfully!</span>
              </div>
            )}

            {submitError && (
              <div className="border border-red-500 bg-red-900/30 text-red-500 p-3 font-bold uppercase text-xs text-center shadow-[4px_4px_0px_#7f1d1d]">
                Blocked: {submitError}
              </div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              className={`w-full font-bold uppercase text-lg py-3 transition-all cursor-pointer flex items-center justify-center gap-2 border-2 border-blue-800 ${
                isSubmitting 
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700 shadow-none" 
                  : "bg-blue-600 text-black hover:bg-blue-500 shadow-[4px_4px_0px_#1e3a8a] active:translate-y-1 active:translate-x-1 active:shadow-none"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  Publishing...
                </>
              ) : (
                "Publish Product"
              )}
            </button>
          </form>
        </div>
        </div>

        {/* INVENTORY LIST */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-dashed border-blue-900 pb-3">
            <h2 className="font-mono text-lg sm:text-xl font-bold uppercase flex items-center gap-2 text-blue-400">
              Current Inventory ({products.length})
            </h2>
            <button
              onClick={handleExportJSON}
              className="flex items-center justify-center gap-2 bg-blue-900/50 text-blue-400 hover:text-blue-300 hover:bg-blue-800 border border-blue-800 font-mono font-bold uppercase text-[10px] px-3 py-1.5 transition-colors shadow-[2px_2px_0px_#1e3a8a] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none shrink-0 self-start sm:self-auto"
            >
              <Download size={14} />
              Export JSON
            </button>
          </div>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar font-sans">
            {products.length === 0 ? (
              <p className="text-blue-700 p-4 text-center border-2 border-dashed border-blue-900 font-bold uppercase text-xs">Inventory depleted. Restock immediately.</p>
            ) : (
              products.map((product) => (
                <div key={product.id} className="flex gap-4 bg-gray-900 border border-blue-800 shadow-[2px_2px_0px_#000] p-3">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-16 h-16 object-cover border border-blue-900"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop";
                    }}
                  />
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-bold uppercase text-sm leading-tight text-blue-200 line-clamp-1">{product.name}</h3>
                    <p className="text-blue-500 text-xs mt-1">{formatPrice(product.price)}</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (window.confirm("Discontinue this item?")) {
                        removeProduct(product.id);
                      }
                    }}
                    className="p-2 bg-red-900/20 flex items-center justify-center text-red-500 hover:bg-red-600 hover:text-white transition-colors cursor-pointer border border-red-900/50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
        </div>
      )}

      {activeTab === "orders" && (
        <div className="bg-black border-2 border-blue-800 p-6 shadow-[8px_8px_0px_#1e3a8a] text-blue-200">
          <h2 className="text-2xl font-bold uppercase mb-6 flex items-center gap-3 border-b-2 border-dashed border-blue-900 pb-3 text-blue-400">
            <ClipboardList /> Received Orders
          </h2>
          
          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center py-10 opacity-60">
                <ClipboardList size={48} className="mx-auto mb-4 text-blue-600" />
                <p className="text-xl uppercase font-bold text-blue-400">No orders received yet.</p>
              </div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="border border-blue-800 bg-gray-900 flex flex-col md:flex-row shadow-[4px_4px_0px_#000]">
                  <div className="flex-1 p-5">
                    <div className="flex justify-between items-center border-b-2 border-blue-900 pb-2 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-600 text-black px-2 py-0.5 text-xs font-bold font-mono">ID: {order.id.slice(0, 10)}...</span>
                        <span className="text-xs font-bold text-blue-600">
                          {new Date(order.date).toLocaleString()}
                        </span>
                      </div>
                      <span className="font-bold text-lg text-blue-400">{formatPrice(order.total)}</span>
                    </div>
                    
                    <div className="bg-black p-4 text-xs border border-blue-800 text-blue-300 mb-4 font-sans">
                      <p className="text-blue-500 font-bold uppercase mb-2 border-b border-blue-900 pb-1">Customer Record</p>
                      <ul className="space-y-1">
                        <li><span className="text-blue-700">Name:</span> {order.customerInfo?.name || "Unknown"}</li>
                        <li><span className="text-blue-700">Phone:</span> {order.customerInfo?.phone || "Unknown"}</li>
                        {order.customerInfo?.whatsapp && <li><span className="text-blue-700">WhatsApp:</span> {order.customerInfo.whatsapp}</li>}
                        <li><span className="text-blue-700">Address:</span> {order.customerInfo?.address || "Unknown"}</li>
                        <li><span className="text-blue-700">PIN:</span> {order.customerInfo?.pincode || "Unknown"}</li>
                        <li className="uppercase mt-2 text-blue-400 border-t border-blue-900 pt-2 font-bold">
                          Payment: {order.customerInfo?.paymentMethod === 'cod' ? 'CASH ON DELIVERY' : 'PREPAID'}
                        </li>
                        <li className={`uppercase mt-1 border-t border-blue-900 pt-1 font-bold ${order.customerInfo?.easyReturnEnabled ? 'text-green-500' : 'text-blue-700'}`}>
                          Return Policy: {order.customerInfo?.easyReturnEnabled ? 'ENABLED (+29 RS)' : 'DISABLED'}
                        </li>
                      </ul>
                    </div>

                    <p className="text-xs font-bold uppercase border-b-2 border-dashed border-blue-900 pb-1 mb-2 text-blue-500">Items</p>
                    <ul className="space-y-2 font-sans">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="flex gap-4 text-sm bg-black border border-blue-900 p-2">
                          {item.imageUrl && (
                            <div className="shrink-0">
                              <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover border border-blue-800" onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop";
                              }}/>
                            </div>
                          )}
                          <div className="flex-1 flex flex-col justify-center">
                            <span className="font-bold text-blue-200 uppercase text-sm leading-tight">{item.quantity} x {item.name}</span>
                            <div className="text-[10px] sm:text-xs text-blue-400 mt-2 flex flex-wrap gap-1 sm:gap-2">
                              {item.selectedSize && <span className="bg-blue-900/50 px-1 border border-blue-800 font-bold">Size: {item.selectedSize}</span>}
                              {item.smartphoneModel && <span className="bg-blue-900/50 px-1 border border-blue-800 font-bold">Model: {item.smartphoneModel}</span>}
                              <span className="bg-blue-900/50 px-1 border border-blue-800 font-bold">{formatPrice(item.cartPrice)}</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-4 flex justify-end border-t-2 border-blue-900 pt-4">
                      <button 
                        onClick={() => {
                          if (window.confirm("Delete this order permanently to free up storage space?")) {
                            deleteOrder(order.id);
                          }
                        }}
                        className="flex items-center gap-2 px-3 py-1 bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-600 hover:text-white transition-colors text-xs uppercase font-bold"
                      >
                        <Trash2 size={14} /> Delete Order
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 flex flex-col gap-2 min-w-[200px] border-t border-blue-900 md:border-t-0 md:border-l p-5">
                    <p className="font-bold uppercase text-xs text-blue-600 mb-1 border-b border-blue-900 pb-2">Fulfillment Status</p>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'pending')}
                      className={`flex items-center gap-2 p-2 font-bold uppercase text-xs border transition-colors ${
                        order.status === 'pending' 
                          ? 'bg-yellow-900/30 border-yellow-600 text-yellow-500 shadow-[2px_2px_0px_#ca8a04]' 
                          : 'bg-black border-blue-900 hover:bg-blue-900/20 text-blue-500'
                      }`}
                    >
                      <Clock size={14} /> Pending
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'shipped')}
                      className={`flex items-center gap-2 p-2 font-bold uppercase text-xs border transition-colors ${
                        order.status === 'shipped' 
                          ? 'bg-blue-900/30 border-blue-500 text-blue-400 shadow-[2px_2px_0px_#3b82f6]' 
                          : 'bg-black border-blue-900 hover:bg-blue-900/20 text-blue-500'
                      }`}
                    >
                      <Truck size={14} /> Shipped
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'delivered')}
                      className={`flex items-center gap-2 p-2 font-bold uppercase text-xs border transition-colors ${
                        order.status === 'delivered' 
                          ? 'bg-green-900/30 border-green-600 text-green-500 shadow-[2px_2px_0px_#16a34a]' 
                          : 'bg-black border-blue-900 hover:bg-blue-900/20 text-blue-500'
                      }`}
                    >
                      <CheckCircle2 size={14} /> Delivered
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
