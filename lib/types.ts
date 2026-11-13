export type Category =
  | "Women"
  | "Men"
  | "Crop Tops"
  | "Dresses"
  | "Swimwear"
  | "Shoes"
  | "Accessories"
  | "Bags";

export type Color = { name: string; hex: string };

export type Review = {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  createdAt: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: Category;
  brand: string;
  description: string;
  material: string;
  details: string[];
  price: number;
  compareAtPrice: number | null;
  images: string[];
  sizes: string[];
  colors: Color[];
  rating: number;
  reviewCount: number;
  sold: number;
  stock: number;
  isNew: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  createdAt: string;
};

export type CartItem = {
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  qty: number;
  stock: number;
};

export type WishlistItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
};

export type Discount = {
  code: string;
  percent: number;
  freeShipping: boolean;
  active: boolean;
  description: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  size: string;
  color: string;
  qty: number;
};

export type Order = {
  id: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
  discountCode: string | null;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    region: string;
    city: string;
    address: string;
    notes?: string;
  };
  paymentMethod: string;
  paymentStatus: "unpaid" | "pending" | "test_paid";
  status: "pending" | "processing" | "shipped" | "completed" | "cancelled";
  createdAt: string;
};

export type UserRole = "customer" | "admin" | "manager";

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type NewsletterSubscriber = {
  email: string;
  createdAt: string;
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

export type Database = {
  products: Product[];
  orders: Order[];
  discounts: Discount[];
  users: User[];
  reviews: Review[];
  subscribers: NewsletterSubscriber[];
  messages: ContactMessage[];
};

export type Currency = "TZS" | "USD";
export type Language = "en" | "sw";
