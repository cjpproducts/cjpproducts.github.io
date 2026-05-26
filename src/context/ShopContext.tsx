import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Product, CartItem, Order } from "../types";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  getDocFromServer,
  getDocs
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

interface ShopContextType {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  isCartOpen: boolean;
  addProduct: (product: Omit<Product, "id" | "createdAt">) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  addToCart: (item: CartItem) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  setIsCartOpen: (isOpen: boolean) => void;
  placeOrder: (items: CartItem[], total: number, customerInfo: import("../types").OrderInfo) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order["status"]) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  cartTotal: number;
  cartItemCount: number;
  productsSold: number;
  visitorsCount: number;
  updateProductsSold: (num: number) => Promise<void>;
  updateVisitorsCount: (num: number) => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productsSold, setProductsSold] = useState<number>(0);
  const [visitorsCount, setVisitorsCount] = useState<number>(0);
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("cjp_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Validate Firestore Connection on Boot
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test-connection-cjp', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // Listen to products from Firestore in real-time
  useEffect(() => {
    const isAdmin = localStorage.getItem("cjp_admin_auth") === "true";
    if (!isAdmin) {
      const cached = localStorage.getItem("cjp_products_cache");
      if (cached) {
        try {
          const { timestamp, data } = JSON.parse(cached);
          if (Date.now() - timestamp < 60 * 60 * 1000) {
            setProducts(data);
            return;
          }
        } catch (e) {}
      }
      
      getDocs(collection(db, "products"))
        .then(snapshot => {
          const prodList: Product[] = [];
          snapshot.forEach((doc) => prodList.push(doc.data() as Product));
          prodList.sort((a, b) => b.createdAt - a.createdAt);
          setProducts(prodList);
          localStorage.setItem("cjp_products_cache", JSON.stringify({ timestamp: Date.now(), data: prodList }));
        })
        .catch(err => handleFirestoreError(err, OperationType.GET, "products"));
        
      return; 
    }

    const unsubscribe = onSnapshot(
      collection(db, "products"),
      async (snapshot) => {
        const prodList: Product[] = [];
        snapshot.forEach((doc) => {
          prodList.push(doc.data() as Product);
        });
        prodList.sort((a, b) => b.createdAt - a.createdAt);
        setProducts(prodList);
        localStorage.setItem("cjp_products_cache", JSON.stringify({ timestamp: Date.now(), data: prodList }));
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "products");
      }
    );
    return () => unsubscribe();
  }, []);

  // Listen to orders from Firestore in real-time
  useEffect(() => {
    const isAdmin = localStorage.getItem("cjp_admin_auth") === "true";
    if (!isAdmin) return;

    const unsubscribe = onSnapshot(
      collection(db, "orders"),
      (snapshot) => {
        const ordList: Order[] = [];
        snapshot.forEach((doc) => {
          ordList.push(doc.data() as Order);
        });
        ordList.sort((a, b) => b.date - a.date);
        setOrders(ordList);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "orders");
      }
    );
    return () => unsubscribe();
  }, []);

  // Listen to global stats
  useEffect(() => {
    const isAdmin = localStorage.getItem("cjp_admin_auth") === "true";
    if (!isAdmin) {
      const cached = localStorage.getItem("cjp_stats_cache");
      if (cached) {
        try {
          const { timestamp, productsSold, visitorsCount } = JSON.parse(cached);
          if (Date.now() - timestamp < 60 * 60 * 1000) {
            setProductsSold(productsSold || 0);
            setVisitorsCount(visitorsCount || 0);
            return;
          }
        } catch (e) {}
      }
      
      getDocFromServer(doc(db, "stats", "global"))
        .then(docSnap => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProductsSold(data.productsSold || 0);
            setVisitorsCount(data.visitorsCount || 0);
            localStorage.setItem("cjp_stats_cache", JSON.stringify({ timestamp: Date.now(), ...data }));
          }
        })
        .catch(err => handleFirestoreError(err, OperationType.GET, "stats/global"));
        
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, "stats", "global"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProductsSold(data.productsSold || 0);
          setVisitorsCount(data.visitorsCount || 0);
          localStorage.setItem("cjp_stats_cache", JSON.stringify({ timestamp: Date.now(), ...data }));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "stats/global");
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem("cjp_cart", JSON.stringify(cart));
  }, [cart]);

  const addProduct = async (product: Omit<Product, "id" | "createdAt">) => {
    const id = "PROD-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    const newProduct: Product = {
      ...product,
      id,
      createdAt: Date.now(),
    };
    try {
      await setDoc(doc(db, "products", id), newProduct);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${id}`);
    }
  };

  const removeProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, "products", id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `products/${id}`);
    }
  };

  const addToCart = (product: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === product.cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === product.cartItemId ? { ...item, quantity: item.quantity + product.quantity } : item
        );
      }
      return [...prev, product];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + item.cartPrice * item.quantity, 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const placeOrder = async (items: CartItem[], total: number, customerInfo: import("../types").OrderInfo) => {
    const id = "ORD-" + Math.random().toString(36).substring(2, 9).toUpperCase();
    const newOrder: Order = {
      id,
      items,
      total,
      customerInfo,
      date: Date.now(),
      status: "pending",
    };
    try {
      await setDoc(doc(db, "orders", id), newOrder);
      clearCart();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `orders/${id}`);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, "orders", orderId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
    }
  };

  const updateProductsSold = async (num: number) => {
    try {
      await setDoc(doc(db, "stats", "global"), { productsSold: num }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `stats/global`);
    }
  };

  const updateVisitorsCount = async (num: number) => {
    try {
      await setDoc(doc(db, "stats", "global"), { visitorsCount: num }, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `stats/global`);
    }
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        cart,
        orders,
        isCartOpen,
        addProduct,
        removeProduct,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        setIsCartOpen,
        placeOrder,
        updateOrderStatus,
        deleteOrder,
        cartTotal,
        cartItemCount,
        productsSold,
        visitorsCount,
        updateProductsSold,
        updateVisitorsCount,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
