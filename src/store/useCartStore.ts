import { create } from 'zustand';
import { supabase } from '@/utils/supabase';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image_url: string;
    description?: string;
}

interface CartStorageData {
    items: CartItem[];
    savedAt: number;
}



const STORAGE_KEY = 'highland_cart';
const EXPIRY_TIME_MS = 24 * 60 * 60 * 1000;

function loadCartItemFromStorage(): CartItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed: CartStorageData = JSON.parse(raw);

        if(Date.now() - parsed.savedAt > EXPIRY_TIME_MS) {
            restoreStockForItems(parsed.items);
            localStorage.removeItem(STORAGE_KEY);
            return [];
        }

        return parsed.items || [];
    } catch {
        return [];
    }
}

function saveCartToStorage(items: CartItem[]) {
    if (items.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
        return;
    }

    const data: CartStorageData = {
        items,
        savedAt: Date.now()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

async function restoreStockForItems(items: CartItem[]) {
    for (const item of items) {
        try {
            await supabase.rpc('increment_product_stock', {p_product_id: item.id});
        } catch (err) {
            console.error(`Cannot restock for ${item.name}:`, err);
        }
    }
}

interface CartStore {
    items: CartItem[];
    addToCart: (item: CartItem) => Promise<boolean>;
    removeFromCart: (itemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    initCartWatcher: () => () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: loadCartItemFromStorage(),

    addToCart: async (item: CartItem) => {
        const { items } = get();

        if (items.length >= 2) {
            alert('Giỏ hàng chỉ được phép chứa tối đa 2 sản phẩm');
            return false;
        }

        if (items.some((i) => i.id === item.id)) {
            alert('Sản phẩm này đã có trong giỏ hàng');
            return false;
        } 
        
        try {
            const { error } = await supabase.rpc('decrement_product_stock', {p_product_id: item.id});
            if (error) throw error;

            const newItems = [...items, item];
            saveCartToStorage(newItems);
            set({ items: newItems});
            return true;
        } catch(err: any) {
            alert(err.message || 'Không thể thêm vào giỏ hàng');
            return false;
        }
    },


}))