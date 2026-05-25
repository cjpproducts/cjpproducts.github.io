export type ProductCategory = "t-shirt" | "mobile-cover" | "other";

export type Size = "S" | "M" | "L" | "XL" | "XXL";

export interface Product {
  id: string;
  category: ProductCategory;
  name: string;
  price: number;
  tShirtPrices?: Partial<Record<Size, number>>;
  description: string;
  imageUrl: string;
  createdAt: number;
}

export interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  selectedSize?: Size;
  smartphoneModel?: string;
  cartPrice: number;
}

export interface OrderInfo {
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  pincode: string;
  paymentMethod: "cod" | "prepaid";
  easyReturnEnabled?: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  customerInfo: OrderInfo;
  total: number;
  date: number;
  status: "pending" | "shipped" | "delivered";
}
