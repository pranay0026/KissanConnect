"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bazar, MOCK_BAZARS, Product } from '@/lib/data';

type CartItem = Product & { quantity: number };

type AuthContextType = {
    selectedBazar: Bazar | null;
    selectBazar: (bazarId: string) => void;
    cart: CartItem[];
    addToCart: (product: Product, qty: number) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    cartTotal: number;
    user: any; // Using any for rough typing for now, ideally strictly typed
    setUser: (user: any) => void;
    syncCartWithStock: (latestProducts: Product[]) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [selectedBazar, setSelectedBazar] = useState<Bazar | null>(null);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Load from local storage on mount
    useEffect(() => {
        setIsMounted(true);
        const savedBazarId = localStorage.getItem('rb_bazar_id');
        if (savedBazarId) {
            const found = MOCK_BAZARS.find((b) => b.id === savedBazarId);
            if (found) setSelectedBazar(found);
        }

        // Restore user from localStorage (Persistent Session)
        const savedUser = localStorage.getItem('rb_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) { }
        }
    }, []);

    // Save cart to storage whenever it changes
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('rb_cart', JSON.stringify(cart));
        }
    }, [cart, isMounted]);

    const selectBazar = (bazarId: string) => {
        // Handle reset
        if (!bazarId || bazarId === 'reset' || bazarId === 'reset_all_hack') {
            setSelectedBazar(null);
            localStorage.removeItem('rb_bazar_id');
            setCart([]);
            return;
        }

        const found = MOCK_BAZARS.find((b) => b.id === bazarId);
        if (found) {
            setSelectedBazar(found);
            localStorage.setItem('rb_bazar_id', bazarId);
            // Clear cart when switching bazaars
            setCart([]);
        }
    };

    const addToCart = (product: Product, qty: number) => {
        setCart((prev) => {
            const existing = prev.find((p) => p.id === product.id);
            const currentQty = existing ? existing.quantity : 0;
            const newQty = currentQty + qty;

            // Stock Check
            if (product.stock !== undefined && newQty > product.stock) {
                alert(`Cannot add more. Only ${product.stock} available.`);
                return prev;
            }

            // Prevent negative
            if (newQty <= 0 && existing) {
                return prev.filter(p => p.id !== product.id);
            }

            if (existing) {
                return prev.map((p) =>
                    p.id === product.id ? { ...p, quantity: newQty, stock: product.stock } : p
                );
            }
            return [...prev, { ...product, quantity: qty, stock: product.stock }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart((prev) => prev.filter((p) => p.id !== productId));
    };

    const syncCartWithStock = (latestProducts: Product[]) => {
        setCart(prev => prev.map(item => {
            const fresh = latestProducts.find(p => ((p as any)._id || p.id) === item.id);
            if (fresh && fresh.stock !== undefined) {
                return { ...item, stock: fresh.stock };
            }
            return item;
        }));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Prevent flash of wrong content during hydration? 
    // Actually basic state is fine, but persisted state might cause mismatch if we render content based on it immediately. 
    // But we are using useEffect to load, so initial is null.

    return (
        <AuthContext.Provider
            value={{
                selectedBazar,
                selectBazar,
                cart,
                addToCart,
                removeFromCart,
                clearCart,
                cartTotal,
                user,
                setUser,
                syncCartWithStock
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
