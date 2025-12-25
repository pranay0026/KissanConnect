"use client";

import { useAuth } from "@/context/AuthContext";
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, Truck, Store, MapPin, BadgeCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function CartPage() {
    const { cart, addToCart, removeFromCart, cartTotal, selectedBazar, clearCart, syncCartWithStock } = useAuth();
    const router = useRouter();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Delivery State
    const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
    const [address, setAddress] = useState('');
    const [dropCoords, setDropCoords] = useState<{ lat: number, lng: number } | null>(null);
    const [distance, setDistance] = useState<number>(0);

    useEffect(() => {
        setIsMounted(true);
        refreshStock();
    }, []);

    const refreshStock = async () => {
        // Fetch valid products and update cart item stocks
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.success) {
                syncCartWithStock(data.products);
            }
        } catch (e) { console.error(e) }
    };

    // Better Approach: Update AuthContext to allow batch updates or exposure of setCart (not ideal but quick).
    // Or, simpler: Just validate on checkout before sending request? 
    // Backend validation is the source of truth.
    // The issue "stock limit crossing" implies they succeeded. 
    // If backend validation logic is correct, it's impossible to succeed.

    // Let's first enable detailed error messages so we know if it Failed or Succeeded.

    if (!isMounted) return <div className="p-8 text-center text-gray-400">Loading Cart...</div>;

    // Pricing Logic
    const DELIVERY_BASE = 20;
    const PER_KM_CHARGE = 5;
    const deliveryFee = deliveryType === 'delivery' ? Math.max(DELIVERY_BASE, Math.ceil(distance * PER_KM_CHARGE)) : 0;
    const finalTotal = cartTotal + deliveryFee;

    const handleCheckout = async () => {
        if (deliveryType === 'delivery') {
            if (!address.trim()) {
                alert("Please enter a delivery address.");
                return;
            }
            if (distance <= 0) {
                alert("Please enter a valid distance.");
                return;
            }
        }

        setIsCheckingOut(true);

        try {
            const user = JSON.parse(localStorage.getItem('rb_user') || '{}');
            const newOrder = {
                customerId: user.id || null, // Might be guest
                items: cart.map(i => ({
                    productId: i.id,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                    total: i.price * i.quantity
                })),
                totalAmount: finalTotal,
                deliveryType,
                address: deliveryType === 'delivery' ? address : null,
                dropLocation: deliveryType === 'delivery' ? dropCoords : null,
                deliveryFee,
                bazar: selectedBazar?.name
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrder)
            });

            if (res.ok) {
                clearCart();
                router.push('/orders?new=true');
            } else {
                const data = await res.json();
                alert(data.error || 'Order Failed');
                setIsCheckingOut(false);
            }
        } catch (e) {
            console.error(e);
            setIsCheckingOut(false);
        }
    };

    if (!selectedBazar) return <div className="p-10 text-center">Select a market first.</div>;

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-6">
                <div className="bg-stone-100 p-8 rounded-full">
                    <ShoppingBagIcon className="w-16 h-16 text-stone-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-stone-800">Your bag is empty</h2>
                    <p className="text-stone-500 mt-2">Looks like you haven't added any fresh produce yet.</p>
                </div>
                <Link href="/" className="bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-green-700 transition-colors flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Start Shopping
                </Link>
            </div>
        );
    }

    if (isCheckingOut) {
        return (
            <div className="h-[70vh] flex flex-col items-center justify-center text-center p-8 space-y-6">
                <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Processing Order</h2>
                    <p className="text-gray-500 mt-2">Connecting with {selectedBazar.name}...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            <header className="flex items-center gap-4 border-b border-gray-100 pb-6">
                <Link href="/" className="bg-white p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Shopping Bag</h1>
                    <p className="text-sm text-gray-500">{cart.length} items from <span className="font-semibold text-primary">{selectedBazar.name}</span></p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Left Col: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="font-bold text-lg">Produces</h3>
                            <button onClick={() => { if (confirm('Clear cart?')) clearCart() }} className="text-red-500 text-xs font-bold hover:underline flex items-center gap-1">
                                <Trash2 className="w-3 h-3" /> Clear All
                            </button>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {cart.map((item) => (
                                <motion.div layout key={item.id} className="p-6 flex items-center gap-6 hover:bg-gray-50 transition-colors group">
                                    <div className="w-20 h-20 bg-stone-100 rounded-2xl flex items-center justify-center shrink-0">
                                        {(item.image && (item.image.startsWith('http') || item.image.startsWith('/') || item.image.includes('.png'))) ? (
                                            <img src={item.image} className="w-full h-full object-cover rounded-2xl" />
                                        ) : (
                                            <span className="text-3xl">{item.image || '🥗'}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                                        <p className="text-sm text-gray-500">₹{item.price}/{item.unit || 'kg'}</p>
                                    </div>

                                    <div className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
                                        <button
                                            onClick={() => addToCart(item, -1)}
                                            disabled={item.quantity <= 1}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-30"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="font-bold w-4 text-center text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => addToCart(item, 1)}
                                            disabled={item.stock !== undefined && item.quantity >= item.stock}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <div className="text-right w-24">
                                        <div className="font-bold text-lg">₹{item.price * item.quantity}</div>
                                        {item.stock !== undefined && (
                                            <p className="text-[10px] text-gray-400">Max: {item.stock}</p>
                                        )}
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Col: Summary & Checkout */}
                <div className="lg:col-span-1 space-y-6 sticky top-24">

                    {/* Delivery Method */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-6">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Truck className="w-5 h-5 text-gray-400" /> Delivery
                        </h3>

                        <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl">
                            <button
                                onClick={() => setDeliveryType('pickup')}
                                className={cn("py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                                    deliveryType === 'pickup' ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-900")}
                            >
                                <Store className="w-4 h-4" /> Pickup
                            </button>
                            <button
                                onClick={() => setDeliveryType('delivery')}
                                className={cn("py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2",
                                    deliveryType === 'delivery' ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-900")}
                            >
                                <Truck className="w-4 h-4" /> Home
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {deliveryType === 'delivery' ? (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4 pt-2"
                                >
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-gray-500">Distance (km)</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={distance || ''}
                                                onChange={e => setDistance(Number(e.target.value))}
                                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                                                placeholder="0.0"
                                            />
                                            <div className="bg-gray-100 px-4 flex items-center rounded-xl font-bold text-sm min-w-[3.5rem] justify-center">₹{deliveryFee}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-gray-500">Address</label>
                                        <textarea
                                            value={address}
                                            onChange={e => setAddress(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none h-24 resize-none"
                                            placeholder="House No, Street, Area..."
                                        ></textarea>
                                        <button
                                            onClick={() => {
                                                if (navigator.geolocation) {
                                                    navigator.geolocation.getCurrentPosition(async (pos) => {
                                                        const p = pos.coords;
                                                        setDropCoords({ lat: p.latitude, lng: p.longitude });
                                                        setAddress("Fetching address...");

                                                        try {
                                                            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${p.latitude}&lon=${p.longitude}`);
                                                            const data = await res.json();
                                                            if (data.display_name) {
                                                                setAddress(data.display_name);
                                                            } else {
                                                                setAddress(`Lat: ${p.latitude.toFixed(4)}, Lng: ${p.longitude.toFixed(4)}`);
                                                            }
                                                        } catch (e) {
                                                            setAddress(`Lat: ${p.latitude.toFixed(4)}, Lng: ${p.longitude.toFixed(4)}`);
                                                        }

                                                    }, (err) => alert("Location access denied"));
                                                } else {
                                                    alert("Geolocation not supported");
                                                }
                                            }}
                                            className="text-xs text-primary font-bold flex items-center gap-1 mt-1 hover:underline"
                                        >
                                            <MapPin className="w-3 h-3" /> Use Current Location
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-green-50 text-green-800 p-4 rounded-xl text-sm font-medium flex gap-3 items-start"
                                >
                                    <Store className="w-5 h-5 shrink-0" />
                                    <div>
                                        <p className="font-bold">Self Pickup</p>
                                        <p className="opacity-80 mt-1 text-xs">Collect your order directly from {selectedBazar.name} counter.</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Summary */}
                    <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-xl space-y-6 bg-[url('/pattern.png')]">
                        <h3 className="font-bold text-lg mb-4">Order Summary</h3>
                        <div className="space-y-3 text-sm text-stone-300">
                            <div className="flex justify-between">
                                <span>Item Total</span>
                                <span className="text-white font-mono">₹{cartTotal}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span className={deliveryFee > 0 ? "text-white font-mono" : "text-green-400"}>
                                    {deliveryFee > 0 ? `₹${deliveryFee}` : 'Free'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Platform Fee</span>
                                <span className="text-green-400">Waived</span>
                            </div>
                            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                                <span className="font-bold text-lg text-white">Total Pay</span>
                                <span className="font-bold text-3xl">₹{finalTotal}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            className="w-full bg-primary hover:bg-green-500 text-stone-900 font-bold py-4 rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 mt-4"
                        >
                            Confirm Order <ArrowRight className="w-5 h-5" />
                        </button>
                        <p className="text-center text-[10px] text-stone-500">Secure Payment powered by Govt of AP</p>
                    </div>

                </div>
            </div>
        </div >
    );
}

function ShoppingBagIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    )
}
