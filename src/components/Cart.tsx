import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft, CheckCircle2, AlertOctagon } from "lucide-react";
import { useShop } from "../context/ShopContext";
import { formatPrice, cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import React, { useState } from "react";

export function Cart() {
  const { cart, isCartOpen, setIsCartOpen, updateCartQuantity, removeFromCart, cartTotal, placeOrder } = useShop();

  const [checkoutStep, setCheckoutStep] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "prepaid">("cod");
  const [easyReturn, setEasyReturn] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);

  const finalTotal = cartTotal + (easyReturn ? 29 : 0);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address || !pincode) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await placeOrder(cart, finalTotal, {
        name,
        phone,
        whatsapp,
        address,
        pincode,
        paymentMethod,
        easyReturnEnabled: easyReturn,
      });
      setOrderSuccess(true);
      setCheckoutStep(false);
      setName("");
      setPhone("");
      setWhatsapp("");
      setAddress("");
      setPincode("");
      setEasyReturn(false);
    } catch (err: any) {
      console.error("Order submission failed:", err);
      let errMsg = "Unable to process order. Please check your credentials.";
      try {
        const parsed = JSON.parse(err.message);
        errMsg = parsed.error || errMsg;
      } catch {
        errMsg = err.message || errMsg;
      }
      setErrorMessage(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCartOpen(false);
    setCheckoutStep(false);
    setErrorMessage("");
    setOrderSuccess(false);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-cjp-light z-50 border-l-4 border-cjp-dark shadow-[-12px_0_0_#ff4500] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b-4 border-cjp-dark bg-white">
              <h2 className="font-display text-3xl uppercase flex items-center gap-3">
                {checkoutStep ? (
                  <button onClick={() => setCheckoutStep(false)} className="hover:text-cjp-accent"><ArrowLeft size={28} /></button>
                ) : (
                  <ShoppingBag />
                )}
                {checkoutStep ? "Customer Record" : "Cart"}
              </h2>
              <button 
                onClick={handleClose}
                className="p-2 bg-cjp-dark text-white hover:bg-cjp-accent transition-colors shadow-[2px_2px_0px_#000]"
              >
                <X size={24} />
              </button>
            </div>

            {orderSuccess ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white space-y-6 overflow-y-auto">
                <div className="bg-green-100 text-green-600 p-6 rounded-full border-4 border-cjp-dark shadow-[4px_4px_0px_#1a1a1a]">
                  <CheckCircle2 size={56} />
                </div>
                <h3 className="font-display text-3xl uppercase text-cjp-dark">Receipt Authenticated!</h3>
                <p className="font-bold text-gray-700 max-w-xs uppercase text-xs leading-relaxed">
                  Your revolutionary contribution has been officially logged in the survival database catalog.
                </p>
                <div className="w-full bg-cjp-light border-4 border-cjp-dark p-4 font-mono text-xs uppercase font-bold text-gray-600 shadow-[4px_4px_0px_#ff4500] tracking-wider text-center">
                  Long live Cockroach Janta Party!
                </div>
                <button
                  onClick={handleClose}
                  className="w-full py-4 mt-6 bg-cjp-accent text-white font-display text-2xl uppercase hover:bg-cjp-dark transition-colors shadow-[4px_4px_0px_#1a1a1a] active:translate-y-1 active:translate-x-1 active:shadow-none"
                >
                  Close Dispatch Terminal
                </button>
              </div>
            ) : !checkoutStep ? (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-4">
                      <ShoppingBag size={64} />
                      <p className="font-display text-2xl uppercase">Your survival kit is empty.</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.cartItemId} className="flex gap-4 border-2 border-cjp-dark p-3 bg-white">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name}
                          className="w-24 h-24 object-cover border-2 border-cjp-dark"
                        />
                        <div className="flex-1 flex flex-col">
                          <h3 className="font-bold text-lg leading-tight uppercase line-clamp-2">{item.name}</h3>
                          {item.selectedSize && <p className="text-sm font-bold text-gray-500">Size: {item.selectedSize}</p>}
                          {item.smartphoneModel && <p className="text-sm font-bold text-gray-500">Model: {item.smartphoneModel}</p>}
                          <p className="font-display text-cjp-accent text-xl mt-1">{formatPrice(item.cartPrice)}</p>
                          
                          <div className="flex items-center gap-4 mt-auto pt-2">
                             <div className="flex items-center border-2 border-cjp-dark w-fit bg-cjp-light">
                              <button 
                                onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                                className="p-1 hover:bg-cjp-dark hover:text-white transition-colors"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-8 text-center font-bold px-2">{item.quantity}</span>
                              <button 
                                onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                                className="p-1 hover:bg-cjp-dark hover:text-white transition-colors border-l-2 border-cjp-dark"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                            <button 
                              onClick={() => removeFromCart(item.cartItemId)}
                              className="text-gray-500 hover:text-red-600 transition-colors ml-auto"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-6 border-t-4 border-cjp-dark bg-white space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between font-bold text-green-600 text-sm uppercase">
                        <span>Delivery Fee</span>
                        <span>FREE</span>
                      </div>
                      <div className="flex items-center justify-between font-display text-2xl uppercase pt-2 border-t-2 border-gray-100">
                        <span>Total Tax</span>
                        <span className="text-cjp-accent">{formatPrice(cartTotal)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setCheckoutStep(true)}
                      className="w-full py-4 bg-cjp-accent text-white font-display text-2xl uppercase hover:bg-cjp-dark transition-colors shadow-[4px_4px_0px_#1a1a1a] active:translate-y-1 active:translate-x-1 active:shadow-none"
                    >
                      Proceed
                    </button>
                  </div>
                )}
              </>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="flex-1 overflow-y-auto flex flex-col">
                <div className="p-6 space-y-5 flex-1">
                  {errorMessage && (
                    <div className="bg-red-50 text-red-600 border-2 border-red-500 p-4 font-bold uppercase text-xs flex items-center gap-3">
                      <AlertOctagon className="shrink-0" size={20} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="font-bold uppercase text-sm block">Name *</label>
                    <input 
                      required type="text" value={name} onChange={(e) => setName(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full border-2 border-cjp-dark bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cjp-accent disabled:opacity-50"
                      placeholder="Full Name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold uppercase text-sm block">Phone Number *</label>
                    <input 
                      required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full border-2 border-cjp-dark bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cjp-accent disabled:opacity-50"
                      placeholder="10-digit number"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold uppercase text-sm block">WhatsApp Number</label>
                    <input 
                      type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full border-2 border-cjp-dark bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cjp-accent disabled:opacity-50"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold uppercase text-sm block">Delivery Address *</label>
                    <textarea 
                      required rows={3} value={address} onChange={(e) => setAddress(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full border-2 border-cjp-dark bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cjp-accent resize-none disabled:opacity-50"
                      placeholder="Street, Area, City"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold uppercase text-sm block">Pin Code *</label>
                    <input 
                      required type="text" value={pincode} onChange={(e) => setPincode(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full border-2 border-cjp-dark bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-cjp-accent disabled:opacity-50"
                      placeholder="6-digit pin"
                    />
                  </div>
                  <div className="space-y-2 pt-2">
                    <label className="font-bold uppercase text-sm block">Payment Method</label>
                    <label className="flex items-center gap-3 p-3 border-2 border-cjp-dark bg-white cursor-pointer hover:bg-gray-50">
                      <input type="radio" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="w-5 h-5 accent-cjp-accent" disabled={isSubmitting} />
                      <span className="font-bold uppercase">Cash on Delivery</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border-2 border-gray-300 bg-gray-100 cursor-not-allowed opacity-60">
                      <input type="radio" disabled checked={paymentMethod === "prepaid"} className="w-5 h-5" />
                      <div className="flex flex-col">
                        <span className="font-bold uppercase text-gray-500">Prepaid</span>
                        <span className="text-xs font-bold text-red-500">Temporarily Unavailable</span>
                      </div>
                    </label>
                  </div>

                  <div className="pt-2">
                    <label className={cn("flex items-center gap-3 p-4 border-2 border-cjp-accent bg-orange-50 cursor-pointer", isSubmitting && "opacity-50 cursor-not-allowed")}>
                      <input 
                        type="checkbox" 
                        checked={easyReturn} 
                        onChange={(e) => setEasyReturn(e.target.checked)}
                        disabled={isSubmitting}
                        className="w-5 h-5 accent-cjp-accent"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold uppercase text-cjp-dark">Enable Easy Return / Exchange</span>
                        <span className="text-xs font-bold text-cjp-accent">+ {formatPrice(29)} for hassle-free returns</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="p-6 border-t-4 border-cjp-dark bg-white space-y-4 mt-auto">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-bold text-gray-500 text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex items-center justify-between font-bold text-green-600 text-sm uppercase">
                      <span>Delivery Fee</span>
                      <span>FREE</span>
                    </div>
                    {easyReturn && (
                      <div className="flex items-center justify-between font-bold text-cjp-accent text-sm">
                        <span>Easy Return Addon</span>
                        <span>{formatPrice(29)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between font-display text-2xl uppercase pt-2 border-t-2 border-gray-100">
                      <span>Total Tax</span>
                      <span className="text-cjp-accent">{formatPrice(finalTotal)}</span>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className={cn(
                      "w-full py-4 font-display text-2xl uppercase transition-colors shadow-[4px_4px_0px_#1a1a1a] active:translate-y-1 active:translate-x-1 active:shadow-none",
                      isSubmitting 
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed border-2 border-gray-500 shadow-none translate-y-0"
                        : "bg-cjp-accent text-white hover:bg-cjp-dark"
                    )}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Contribution"}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
