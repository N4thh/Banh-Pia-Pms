'use client';

export type CartItem = {
  id: string;    
  productId: string;
  productName: string;
  saltedEgg: number;
  quantity: number;
  unitPrice: number;
  addedAt: number;  
};

const CART_KEY = 'banh_pia_cart';
const CART_EXPIRY_MS = 60 * 60 * 1000; 

const LEGACY_PRODUCT_ID_MAP: Record<string, string> = {
  'dauxanh': '1',
  'saurieng': '2',
};

function migrateLegacyIds(items: CartItem[]): CartItem[] {
  return items.map((item) => {
    const newProductId = LEGACY_PRODUCT_ID_MAP[item.productId] ?? item.productId;
    if (newProductId === item.productId) return item;
    return {
      ...item,
      productId: newProductId,
      id: `${newProductId}-${item.saltedEgg}`,
    };
  });
}

function cleanExpired(items: CartItem[]): CartItem[] {
  const now = Date.now();
  return items.filter((item) => now - item.addedAt < CART_EXPIRY_MS);
}

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const items: CartItem[] = JSON.parse(raw);
    return migrateLegacyIds(cleanExpired(items));
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}


export function addToCart(item: Omit<CartItem, 'id' | 'addedAt'>): CartItem[] {
  const cart = getCart();
  const id = `${item.productId}-${item.saltedEgg}`;
  const existing = cart.find((c) => c.id === id);

  if (existing) {
    existing.quantity += item.quantity;
    existing.addedAt = Date.now();
  } else {
    cart.push({ ...item, id, addedAt: Date.now() });
  }

  saveCart(cart);
  return cart;
}

export function removeFromCart(id: string): CartItem[] {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_KEY);
}

export function refreshTimeCart(): void { 
  const cart = getCart(); 

  const updated = cart.map(item => ({
    ...item, 
    addedAt: Date.now(),
  })); 

  saveCart(updated); 
}