import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ImagePlus, PackagePlus, AlertOctagon, Trash2, Download, ClipboardList, CheckCircle2, Clock, Truck, Upload, Edit3 } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { formatPrice } from "../lib/utils";

export function Admin() {
  const { products, addProduct, editProduct, removeProduct, orders, updateOrderStatus, deleteOrder, productsSold, updateProductsSold, visitorsCount, updateVisitorsCount } = useShop();
  const [activeTab, setActiveTab] = useState<"inventory" | "orders">("orders");

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<import("../types").ProductCategory>("other");
  const [price, setPrice] = useState("");
  const [tShirtPrices, setTShirtPrices] = useState<Partial<Record<import("../types").Size, number>>>({});
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteOrderConfirmId, setDeleteOrderConfirmId] = useState<string | null>(null);

  // Authentication System
  const [password, setPassword] = useState("");
  const [loginStep, setLoginStep] = useState<1 | 2>(1);
  const [pin, setPin] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("cjp_admin_auth") === "true";
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "priyamkesh8825") {
      setLoginStep(2);
      setAuthError("");
    } else {
      setAuthError("Incorrect password. Access denied.");
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPin = pin.trim();
    const now = new Date();
    
    const getPinForDate = (d: Date) => {
      let hours = d.getHours() % 12;
      if (hours === 0) hours = 12;
      const minutes = d.getMinutes();
      const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
      return `${hours}${formattedMinutes}`;
    };

    const currentPin = getPinForDate(now);
    
    // Also check 1 minute ago to absorb clock-boundary delays
    const oneMinAgo = new Date(now.getTime() - 60000);
    const prevPin = getPinForDate(oneMinAgo);
    
    if (trimmedPin === currentPin || trimmedPin === prevPin) {
      setIsAuthenticated(true);
      localStorage.setItem("cjp_admin_auth", "true");
      setAuthError("");
      setPin("");
    } else {
      setAuthError("Incorrect Security PIN. Access denied.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("cjp_admin_auth");
    setPassword("");
    setPin("");
    setLoginStep(1);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name || !description) return;
    if (category !== "t-shirt" && !price) return;
    if (category === "t-shirt" && Object.entries(tShirtPrices).every(([_, v]) => !v)) {
      setSubmitError("Please fill at least one size price for the T-Shirt.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const productPayload = {
        name,
        category,
        price: category === "t-shirt" && Object.entries(tShirtPrices).length > 0 
          ? Math.min(...Object.values(tShirtPrices).filter(v => v !== undefined) as number[]) 
          : Number(price),
        ...(category === "t-shirt" ? { tShirtPrices } : {}),
        description,
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?q=80&w=800&auto=format&fit=crop",
      };

      if (editingProductId) {
        await editProduct(editingProductId, productPayload);
        setEditingProductId(null);
      } else {
        await addProduct(productPayload);
      }

      setName("");
      setCategory("other");
      setPrice("");
      setTShirtPrices({});
      setDescription("");
      setImageUrl("");
      setSubmitSuccess(true);
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
      setSubmitError("Please upload a valid image file (PNG, JPG, WEBP, GIF etc.)");
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

  const handleEditClick = (product: import("../types").Product) => {
    setEditingProductId(product.id);
    setName(product.name);
    setCategory(product.category);
    setPrice(product.price.toString());
    setTShirtPrices(product.tShirtPrices || {});
    setDescription(product.description || "");
    setImageUrl(product.imageUrl || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-black px-4 py-8 sm:py-12">
        <div className="w-full max-w-md bg-black border-4 border-blue-900 p-6 sm:p-8 shadow-[8px_8px_0px_#1e3a8a] text-center">
          <div className="bg-blue-600 text-black p-4 inline-block shadow-[4px_4px_0px_#000] rotate-[-3deg] mb-6 border border-blue-800">
            <AlertOctagon size={40} className="animate-pulse" />
          </div>
          
          <h1 className="font-display text-3xl sm:text-4xl uppercase tracking-tight mb-2 text-blue-400">Admin Login</h1>
          
          {loginStep === 1 ? (
            <>
              <p className="text-blue-600 font-bold uppercase text-[10px] sm:text-xs tracking-wider mb-8">
                Step 1 of 2: Primary Password Check
              </p>
              
              <form onSubmit={handleLogin} className="space-y-6 text-left">
                <div className="space-y-2">
                  <label className="font-bold uppercase text-[10px] sm:text-xs tracking-wider text-blue-500 block">
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
                    className="w-full border border-blue-900 bg-gray-900 px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 text-center text-sm sm:text-lg text-blue-200 shadow-[4px_4px_0px_#000]"
                    placeholder="••••••••••••"
                  />
                </div>

                {authError && (
                  <div className="border border-red-800 bg-red-900/30 text-red-500 font-bold uppercase text-xs p-3 text-center">
                    {authError}
                  </div>
                )}

                <button 
                  type="submit"
                  className="w-full bg-blue-700 text-black font-display uppercase text-xl sm:text-2xl py-3 sm:py-4 hover:bg-blue-500 transition-colors shadow-[4px_4px_0px_#1e3a8a] sm:shadow-[6px_6px_0px_#1e3a8a] active:translate-y-1 active:translate-x-1 active:shadow-none cursor-pointer"
                >
                  Next Step
                </button>
              </form>
            </>
          ) : (
            <>
              <p className="text-blue-600 font-bold uppercase text-[10px] sm:text-xs tracking-wider mb-8">
                Step 2 of 2: Security Verification
              </p>
              
              <form onSubmit={handlePinSubmit} className="space-y-6 text-left">
                <div className="space-y-2">
                  <label className="font-bold uppercase text-[10px] sm:text-xs tracking-wider text-blue-500 block">
                    Security PIN
                  </label>
                  <input 
                    type="password" 
                    pattern="\d*"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setAuthError("");
                    }}
                    required
                    className="w-full border border-blue-900 bg-gray-900 px-4 py-3 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 text-center text-lg sm:text-2xl tracking-widest text-blue-200 shadow-[4px_4px_0px_#000]"
                    placeholder="••••"
                  />
                </div>

                {authError && (
                  <div className="border border-red-800 bg-red-900/30 text-red-500 font-bold uppercase text-xs p-3 text-center font-bold">
                    {authError}
                  </div>
                )}

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => {
                      setLoginStep(1);
                      setAuthError("");
                      setPin("");
                    }}
                    className="w-1/3 bg-gray-900 border border-blue-900 font-display uppercase tracking-tight text-xs py-3 text-blue-500 hover:bg-gray-850 hover:text-blue-400 transition-colors shadow-[2px_2px_0px_#000] active:translate-y-0.5 active:translate-x-0.5 active:shadow-none"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    className="w-2/3 bg-blue-700 text-black font-display uppercase tracking-tight text-base sm:text-lg py-3 hover:bg-blue-500 transition-colors shadow-[4px_4px_0px_#1e3a8a] active:translate-y-1 active:translate-x-1 active:shadow-none cursor-pointer"
                  >
                    Verify PIN
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="mt-8 pt-4 border-t border-dashed border-blue-900">
            <Link to="/" className="text-xs sm:text-sm font-bold uppercase text-blue-700 hover:text-blue-400 transition-colors">
              ← Return to Public Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-blue-100 flex flex-col relative w-full overflow-hidden box-border">
      <div className="w-full mx-auto px-4 py-6 md:py-12 max-w-5xl box-border flex-1">
        
        {/* Header Block */}
        <div className="flex flex-col gap-6 mb-8 border-b-4 border-blue-900 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 text-black p-2.5 sm:p-3 shadow-[4px_4px_0px_#000000] border border-blue-800 shrink-0">
                <AlertOctagon size={36} className="text-black" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-2xl sm:text-4xl text-blue-500 uppercase tracking-tight border-b-4 border-blue-800 pb-1 break-words">
                  Admin Dashboard
                </h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                  <span className="font-mono text-black font-bold uppercase text-[10px] px-2 py-0.5 bg-blue-500 border border-blue-700">Admin Active</span>
                  <span className="text-[10px] sm:text-xs text-blue-500 font-bold uppercase font-mono flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse block"></span>
                    Online
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="bg-blue-900/50 hover:bg-red-900/30 text-blue-400 hover:text-red-400 font-mono border-2 border-blue-900 hover:border-red-900/50 font-bold uppercase px-4 py-2 text-xs shadow-[2px_2px_0px_#000] transition-colors cursor-pointer self-start sm:self-auto"
            >
              Logout Account
            </button>
          </div>

          {/* Navigation Tab Selector */}
          <div className="flex flex-col sm:flex-row border-2 border-blue-950 bg-black p-1 w-full max-w-md">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 px-4 py-2.5 font-mono font-bold uppercase text-xs cursor-pointer transition-colors text-center ${
                activeTab === "orders" 
                  ? "bg-blue-600 text-black shadow-[2px_2px_0px_#1e3a8a] select-none" 
                  : "hover:bg-gray-900/40 text-blue-600"
              }`}
            >
              Manage Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab("inventory")}
              className={`flex-1 px-4 py-2.5 font-mono font-bold uppercase text-xs cursor-pointer transition-colors text-center ${
                activeTab === "inventory" 
                  ? "bg-blue-600 text-black shadow-[2px_2px_0px_#1e3a8a] select-none" 
                  : "hover:bg-gray-900/40 text-blue-600"
              }`}
            >
              Inventory Control ({products.length})
            </button>
          </div>
        </div>

        {/* INVENTORY TAB CONTROLS */}
        {activeTab === "inventory" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
            
            {/* Left Column: Stats & Add */}
            <div className="lg:col-span-5 flex flex-col gap-6 w-full">
              
              {/* SYSTEM STATS CARD */}
              <div className="bg-black text-blue-400 border border-blue-800 p-4 sm:p-5 shadow-[4px_4px_0px_#1e3a8a] font-mono overflow-hidden">
                <h2 className="text-lg font-bold uppercase mb-4 border-b border-dashed border-blue-900 pb-2 flex items-center gap-2">
                  System Stats
                </h2>
                <div className="space-y-4">
                  {/* Sold Counter */}
                  <div className="flex flex-col gap-2 w-full">
                    <label className="font-bold uppercase text-[10px] text-blue-600">Total Products Sold:</label>
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-blue-800 text-lg font-bold shrink-0">[</span>
                      <input
                        type="number"
                        value={localProductsSold}
                        onChange={(e) => setLocalProductsSold(e.target.value)}
                        className="flex-1 min-w-0 bg-transparent border-b border-blue-900 text-blue-400 px-1 py-0.5 font-bold text-lg focus:outline-none focus:border-blue-600 text-center"
                      />
                      <span className="text-blue-800 text-lg font-bold shrink-0">]</span>
                      <button 
                        onClick={() => {
                          const val = parseInt(localProductsSold) || 0;
                          updateProductsSold(val);
                        }}
                        className="bg-blue-600 text-black font-bold px-3 py-1 text-[10px] uppercase hover:bg-blue-500 active:translate-y-[1px] cursor-pointer shrink-0"
                      >
                        UPDATE
                      </button>
                    </div>
                  </div>
                  
                  {/* Visitor Counter */}
                  <div className="flex flex-col gap-2 w-full">
                    <label className="font-bold uppercase text-[10px] text-blue-600">Visitors Count:</label>
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-blue-800 text-lg font-bold shrink-0">[</span>
                      <input
                        type="number"
                        value={localVisitorsCount}
                        onChange={(e) => setLocalVisitorsCount(e.target.value)}
                        className="flex-1 min-w-0 bg-transparent border-b border-blue-900 text-blue-400 px-1 py-0.5 font-bold text-lg focus:outline-none focus:border-blue-600 text-center"
                      />
                      <span className="text-blue-800 text-lg font-bold shrink-0">]</span>
                      <button 
                        onClick={() => {
                          const val = parseInt(localVisitorsCount) || 0;
                          updateVisitorsCount(val);
                        }}
                        className="bg-blue-600 text-black font-bold px-3 py-1 text-[10px] uppercase hover:bg-blue-500 active:translate-y-[1px] cursor-pointer shrink-0"
                      >
                        UPDATE
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-blue-700 uppercase mt-2 leading-relaxed font-sans">* MANUALLY UPDATE SYSTEM COUNTERS IF DESIRED.</p>
                </div>
              </div>

              {/* ADD PRODUCT FORM CARD */}
              <div className="bg-black border border-blue-800 p-4 sm:p-5 shadow-[4px_4px_0px_#1e3a8a] text-blue-300 overflow-hidden w-full">
                <h2 className="text-lg uppercase font-bold mb-4 flex items-center gap-2.5 border-b border-blue-900 pb-2 text-blue-400">
                  <PackagePlus size={18} /> Add Product
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  {/* Name Input */}
                  <div className="space-y-1">
                    <label className="font-bold uppercase text-[10px] text-blue-500 block">Product Name</label>
                    <div className="flex items-center gap-2 border border-blue-800 bg-gray-900 px-3 py-2 w-full box-border">
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full bg-transparent focus:outline-none font-bold placeholder-blue-900 text-blue-200 text-xs min-w-0"
                        placeholder="e.g. Official T-Shirt"
                      />
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div className="space-y-1">
                    <label className="font-bold uppercase text-[10px] text-blue-500 block">Category</label>
                    <div className="flex items-center gap-2 border border-blue-800 bg-gray-900 px-3 py-2 w-full box-border">
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value as import("../types").ProductCategory)}
                        className="w-full bg-transparent font-bold focus:outline-none cursor-pointer appearance-none text-blue-200 text-xs"
                      >
                        <option value="other">Other Category</option>
                        <option value="t-shirt">T-Shirt</option>
                        <option value="mobile-cover">Mobile Cover</option>
                        <option value="books">Books</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Size pricing logic */}
                  {category === "t-shirt" ? (
                    <div className="space-y-2.5 border border-dashed border-blue-800 p-3 bg-gray-950">
                      <label className="font-bold uppercase text-[10px] text-blue-500 block">Size-wise Pricing (INR)</label>
                      {(["S", "M", "L", "XL", "XXL"] as import("../types").Size[]).map((size) => (
                        <div key={size} className="flex items-center gap-3 border-b border-blue-950 pb-1.5 last:border-0 last:pb-0">
                          <span className="font-bold font-mono text-blue-600 w-10">[{size}]</span>
                          <span className="text-blue-800 font-sans">₹</span>
                          <input 
                            type="number"
                            value={tShirtPrices[size] || ""}
                            onChange={(e) => setTShirtPrices(prev => ({ ...prev, [size]: e.target.value ? Number(e.target.value) : undefined }))}
                            min="0"
                            className="flex-1 bg-transparent border-none text-xs focus:outline-none focus:ring-0 font-bold text-blue-200 p-0"
                            placeholder="Set Price"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="font-bold uppercase text-[10px] text-blue-500 block">Price (INR)</label>
                      <div className="flex items-center gap-2 border border-blue-800 bg-gray-900 px-3 py-2 w-full box-border">
                        <span className="text-blue-800 font-sans">₹</span>
                        <input 
                          type="number" 
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          required
                          min="0"
                          step="1"
                          className="w-full bg-transparent font-bold focus:outline-none text-blue-200 text-xs min-w-0"
                          placeholder="Product Price"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Image uploading */}
                  <div className="space-y-1.5">
                    <label className="font-bold uppercase text-[10px] text-blue-500 block">Product Image</label>
                    
                    {/* Drag and Drop Box */}
                    <div 
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`relative border border-dashed transition-all flex flex-col items-center justify-center p-4 text-center min-h-[120px] cursor-pointer ${
                        dragActive ? "border-blue-500 bg-blue-900/20" : "border-blue-800 bg-gray-900 hover:border-blue-600"
                      }`}
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
                            className="max-h-24 object-contain border border-blue-800 shadow-[2px_2px_0px_#000]"
                          />
                          <div className="flex flex-wrap gap-2 justify-center">
                            <button
                              type="button"
                              onClick={() => setImageUrl("")}
                              className="bg-black text-red-500 font-bold text-[9px] uppercase px-2 py-1 shadow-[1px_1px_0px_#7f1d1d] border border-red-800 hover:bg-neutral-900 cursor-pointer"
                            >
                              Remove
                            </button>
                            <button
                              type="button"
                              onClick={() => document.getElementById("file-upload")?.click()}
                              className="bg-black text-blue-400 font-bold text-[9px] uppercase px-2 py-1 shadow-[1px_1px_0px_#1e3a8a] border border-blue-800 hover:bg-neutral-900 cursor-pointer"
                            >
                              Replace
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-1 pointer-events-none">
                          <Upload className="text-blue-700" size={20} />
                          <p className="font-bold text-[10px] uppercase text-blue-500 px-2 leading-snug">Drag & Drop Image or Click to Browse</p>
                          <p className="text-[9px] text-blue-800">PNG, JPG, GIF up to 500x500px</p>
                        </div>
                      )}
                    </div>

                    {/* Web Link Input */}
                    <div className="pt-1.5 w-full">
                      <span className="text-[9px] font-bold text-blue-600 uppercase">Or provide manual image URL:</span>
                      <div className="relative mt-1 border border-blue-800 bg-gray-900 flex items-center pl-2 px-3 py-1.5">
                        <ImagePlus className="text-blue-800 mr-2 shrink-0" size={14} />
                        <input 
                          type="url" 
                          value={imageUrl.startsWith("data:") ? "" : imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="w-full bg-transparent focus:outline-none font-bold text-blue-200 text-xs min-w-0"
                          placeholder="https://example.com/image.jpg"
                        />
                        {imageUrl.startsWith("data:") && (
                          <span className="text-[9px] text-blue-500 font-bold uppercase shrink-0 whitespace-nowrap ml-2">
                            [Uploaded]
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description field */}
                  <div className="space-y-1">
                    <label className="font-bold uppercase text-[10px] text-blue-500 block">Description</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={2}
                      className="w-full border border-blue-800 bg-gray-900 px-3 py-2 font-bold text-xs focus:outline-none focus:border-blue-600 resize-none text-blue-200 box-border"
                      placeholder="Enter product description details..."
                    />
                  </div>

                  {/* Submit status banners */}
                  {submitSuccess && (
                    <div className="border border-green-500 bg-green-900/20 text-green-400 p-2 text-center font-bold uppercase text-[10px] shadow-[2px_2px_0px_#14532d]">
                      Product published successfully!
                    </div>
                  )}

                  {submitError && (
                    <div className="border border-red-500 bg-red-900/20 text-red-500 p-2 text-center font-bold uppercase text-[10px] shadow-[2px_2px_0px_#7f1d1d]">
                      Error: {submitError}
                    </div>
                  )}

                  {/* Publish submit button */}
                  <div className="flex gap-2">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 font-bold uppercase text-xs sm:text-sm py-2.5 sm:py-3 transition-all cursor-pointer flex items-center justify-center gap-2 border border-blue-850 outline-none ${
                        isSubmitting 
                          ? "bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700 shadow-none" 
                          : "bg-blue-600 text-black hover:bg-blue-500 shadow-[3px_3px_0px_#1e3a8a] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-3.5 w-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                          {editingProductId ? "Updating..." : "Publishing..."}
                        </>
                      ) : (
                        editingProductId ? "Update Product" : "Publish Product"
                      )}
                    </button>
                    {editingProductId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProductId(null);
                          setName("");
                          setCategory("other");
                          setPrice("");
                          setTShirtPrices({});
                          setDescription("");
                          setImageUrl("");
                        }}
                        className="bg-gray-800 text-gray-300 px-4 font-bold uppercase text-xs border border-gray-700 hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>

            {/* Right Column: Inventory List Card */}
            <div className="lg:col-span-7 w-full space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dashed border-blue-900 pb-3">
                <h2 className="font-mono text-base sm:text-lg font-bold uppercase flex items-center gap-2 text-blue-400">
                  Current Inventory ({products.length})
                </h2>
                <button
                  onClick={handleExportJSON}
                  className="flex items-center justify-center gap-1.5 bg-blue-900/50 text-blue-400 hover:text-blue-300 hover:bg-blue-800/80 border border-blue-800 font-mono font-bold uppercase text-[10px] px-3 py-1.5 transition-colors shadow-[2px_2px_0px_#1e3a8a] active:translate-y-[1px] active:shadow-none cursor-pointer shrink-0"
                >
                  <Download size={12} />
                  Export JSON Backup
                </button>
              </div>
              
              <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar font-sans w-full box-border">
                {products.length === 0 ? (
                  <p className="text-blue-700 p-6 text-center border-2 border-dashed border-blue-900 font-bold uppercase text-xs">
                    Inventory depleted. Restock immediately.
                  </p>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="flex gap-3 bg-gray-900 border border-blue-800 shadow-[2px_2px_0px_#000] p-2.5 items-center w-full min-w-0">
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover border border-blue-900 shrink-0 bg-black"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop";
                        }}
                      />
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-bold uppercase text-xs sm:text-sm leading-tight text-blue-200 truncate select-all">{product.name}</h3>
                        <p className="text-blue-500 text-[10px] sm:text-xs mt-0.5 font-mono">{formatPrice(product.price)}</p>
                        <span className="text-[9px] bg-blue-950/60 uppercase font-mono px-1.5 py-0.5 border border-blue-900/40 text-blue-400 rounded-sm mt-1 inline-block">
                          {product.category}
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="p-2 sm:p-2.5 bg-blue-950/30 flex items-center justify-center text-blue-500 hover:bg-blue-600 hover:text-white transition-colors cursor-pointer border border-blue-950 hover:border-blue-750 rounded-sm"
                          title="Edit product"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => {
                            if (deleteConfirmId === product.id) {
                              removeProduct(product.id);
                              setDeleteConfirmId(null);
                            } else {
                              setDeleteConfirmId(product.id);
                              // Auto-reset after 3 seconds
                              setTimeout(() => setDeleteConfirmId(null), 3500);
                            }
                          }}
                          className={`p-2 sm:p-2.5 flex items-center justify-center transition-colors cursor-pointer border rounded-sm ${
                            deleteConfirmId === product.id
                              ? "bg-red-600 text-white border-red-500 animate-pulse text-xs font-bold px-2 py-1"
                              : "bg-red-950/30 text-red-500 border-red-950 hover:bg-red-600 hover:text-white hover:border-red-750"
                          }`}
                          title={deleteConfirmId === product.id ? "Click again to confirm delete" : "Remove product"}
                        >
                          {deleteConfirmId === product.id ? (
                            <span className="text-[10px] uppercase font-mono font-bold">Confirm?</span>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* RECEIVED ORDERS TAB CONTROLS */}
        {activeTab === "orders" && (
          <div className="bg-black border border-blue-800 p-4 sm:p-5 shadow-[4px_4px_0px_#1e3a8a] text-blue-200 w-full overflow-hidden box-border">
            <h2 className="text-lg sm:text-xl font-bold uppercase mb-6 flex items-center gap-2.5 border-b border-dashed border-blue-900 pb-3 text-blue-400">
              <ClipboardList size={20} className="text-blue-500" /> Received Orders
            </h2>
            
            <div className="space-y-6 w-full box-border">
              {orders.length === 0 ? (
                <div className="text-center py-12 opacity-60">
                  <ClipboardList size={40} className="mx-auto mb-3 text-blue-600" />
                  <p className="text-sm uppercase font-bold text-blue-400 font-mono text-center">No customer orders found in records.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border border-blue-800 bg-gray-900/40 flex flex-col md:flex-row shadow-[3px_3px_0px_#000] w-full min-w-0 box-border">
                    
                    <div className="flex-1 p-4 sm:p-5 min-w-0 w-full box-border">
                      {/* Order general info header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-900 pb-2 mb-4 w-full">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="bg-blue-600 text-black px-1.5 py-0.5 text-[9px] sm:text-xs font-bold font-mono uppercase tracking-tight">
                            ORD ID: {order.id.slice(0, 10).toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-blue-600">
                            {new Date(order.date).toLocaleString()}
                          </span>
                        </div>
                        <span className="font-bold text-base sm:text-lg text-blue-400 font-mono whitespace-nowrap">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                      
                      {/* Customer info card */}
                      <div className="bg-black p-3.5 text-xs border border-blue-805 text-blue-300 mb-4 font-sans w-full box-border">
                        <p className="text-blue-500 font-bold uppercase mb-2 border-b border-blue-950 pb-1 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 bg-blue-500 rounded-full block"></span> CUSTOMER DOCUMENT RECORD
                        </p>
                        <ul className="space-y-1 font-mono text-[11px] sm:text-xs">
                          <li className="break-words"><span className="text-blue-700 font-bold">NAME:</span> {order.customerInfo?.name || "N/A"}</li>
                          <li className="break-words"><span className="text-blue-700 font-bold">TEL:</span> {order.customerInfo?.phone || "N/A"}</li>
                          {order.customerInfo?.whatsapp && (
                            <li className="break-words">
                              <span className="text-blue-700 font-bold">WHATSAPP:</span>{" "}
                              <a 
                                href={`https://wa.me/91${order.customerInfo.whatsapp}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-green-450 font-bold hover:underline"
                              >
                                {order.customerInfo.whatsapp} ↗
                              </a>
                            </li>
                          )}
                          <li className="break-words"><span className="text-blue-700 font-bold">DELIVERY ADDR:</span> {order.customerInfo?.address || "N/A"}</li>
                          <li><span className="text-blue-700 font-bold">AREA ZIPCODE:</span> {order.customerInfo?.pincode || "N/A"}</li>
                          
                          <li className="uppercase mt-2.5 text-blue-400 border-t border-blue-950 pt-2 font-bold flex flex-wrap items-center gap-1.5">
                            <span className="text-blue-750 font-bold">PAYMENT TYPE:</span>
                            <span className="text-blue-200">
                              {order.customerInfo?.paymentMethod === 'cod' ? 'CASH ON DELIVERY (COD)' : 'PREPAID'}
                            </span>
                          </li>
                          <li className={`uppercase mt-1 border-t border-blue-950 pt-1 font-bold flex flex-wrap items-center gap-1.5 ${order.customerInfo?.easyReturnEnabled ? 'text-green-500' : 'text-blue-750'}`}>
                            <span>EASY RETURN POLICY:</span>
                            <span>{order.customerInfo?.easyReturnEnabled ? 'ENABLED (+29 RS CO-PAY)' : 'DISABLED'}</span>
                          </li>
                        </ul>
                      </div>

                      {/* Items list */}
                      <p className="text-[10px] font-bold uppercase border-b border-dashed border-blue-900 pb-1 mb-2 text-blue-500">
                        Purchased Items ({order.items.reduce((sum, item) => sum + item.quantity, 0)})
                      </p>
                      
                      <ul className="space-y-2 font-sans w-full box-border">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex gap-3 text-xs bg-black border border-blue-900 p-2 items-center w-full box-border min-w-0">
                            {item.imageUrl && (
                              <img 
                                src={item.imageUrl} 
                                alt={item.name} 
                                className="w-12 h-12 sm:w-14 sm:h-14 object-cover border border-blue-800 shrink-0 bg-gray-900" 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800&auto=format&fit=crop";
                                }}
                              />
                            )}
                            <div className="flex-1 min-w-0 pr-1">
                              <span className="font-bold text-blue-200 uppercase text-xs leading-tight truncate block select-all">
                                {item.quantity} x {item.name}
                              </span>
                              <div className="text-[9px] sm:text-[10px] text-blue-400 mt-1.5 flex flex-wrap gap-1.5 font-mono">
                                {item.selectedSize && (
                                  <span className="bg-blue-950/60 px-1 border border-blue-900 uppercase">
                                    Size: {item.selectedSize}
                                  </span>
                                )}
                                {item.smartphoneModel && (
                                  <span className="bg-blue-950/60 px-1 border border-blue-900 uppercase">
                                    Model: {item.smartphoneModel}
                                  </span>
                                )}
                                <span className="bg-blue-950/60 px-1 border border-blue-900">
                                  {formatPrice(item.cartPrice)}
                                </span>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                      
                      {/* Delete actions */}
                      <div className="mt-4 flex justify-end border-t border-blue-950 pt-3">
                        <button 
                          onClick={() => {
                            if (deleteOrderConfirmId === order.id) {
                              deleteOrder(order.id);
                              setDeleteOrderConfirmId(null);
                            } else {
                              setDeleteOrderConfirmId(order.id);
                              setTimeout(() => setDeleteOrderConfirmId(null), 3500);
                            }
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors text-[10px] uppercase font-mono font-bold cursor-pointer rounded-sm border ${
                            deleteOrderConfirmId === order.id
                              ? "bg-red-600 text-white border-red-500 animate-pulse font-sans"
                              : "bg-red-950/20 text-red-500 border-red-950/50 hover:bg-red-600 hover:text-white"
                          }`}
                        >
                          <Trash2 size={12} /> {deleteOrderConfirmId === order.id ? "[ Click Again to Clear Log ]" : "Delete Order Log"}
                        </button>
                      </div>
                    </div>
                    
                    {/* Status controllers column */}
                    <div className="bg-gray-950/90 flex flex-col gap-2 min-w-[180px] md:w-[220px] border-t border-blue-900 md:border-t-0 md:border-l p-4 sm:p-5 shrink-0 block">
                      <p className="font-bold uppercase text-[10px] text-blue-600 mb-1 border-b border-blue-900 pb-1.5 font-mono">Fulfillment Record</p>
                      
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'pending')}
                        className={`flex items-center gap-2 p-2.5 font-bold uppercase text-[10px] font-mono border transition-all cursor-pointer ${
                          order.status === 'pending' 
                            ? 'bg-yellow-900/30 border-yellow-600 text-yellow-500 shadow-[2px_2px_0px_#ca8a04]' 
                            : 'bg-black border-blue-950 hover:bg-blue-950/50 text-blue-500 hover:border-blue-800'
                        }`}
                      >
                        <Clock size={13} /> Pending Status
                      </button>
                      
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'shipped')}
                        className={`flex items-center gap-2 p-2.5 font-bold uppercase text-[10px] font-mono border transition-all cursor-pointer ${
                          order.status === 'shipped' 
                            ? 'bg-blue-900/30 border-blue-500 text-blue-400 shadow-[2px_2px_0px_#3b82f6]' 
                            : 'bg-black border-blue-950 hover:bg-blue-950/50 text-blue-500 hover:border-blue-800'
                        }`}
                      >
                        <Truck size={13} /> Shipped Status
                      </button>
                      
                      <button 
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className={`flex items-center gap-2 p-2.5 font-bold uppercase text-[10px] font-mono border transition-all cursor-pointer ${
                          order.status === 'delivered' 
                            ? 'bg-green-900/30 border-green-600 text-green-500 shadow-[2px_2px_0px_#16a34a]' 
                            : 'bg-black border-blue-950 hover:bg-blue-950/50 text-blue-500 hover:border-blue-800'
                        }`}
                      >
                        <CheckCircle2 size={13} /> Delivered Status
                      </button>

                      {/* Info indicator */}
                      <div className="mt-2 text-[9px] text-blue-700 leading-tight uppercase font-mono bg-black p-2 border border-blue-950 select-none">
                        Status syncs dynamically to customer's order tracker.
                      </div>
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
