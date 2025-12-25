"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBasket, Menu, MapPin, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { selectedBazar, cart, selectBazar, user } = useAuth();
    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="min-h-screen flex flex-col w-full bg-white shadow-xl overflow-hidden relative">

            {/* Header - Only show if a bazar is selected */}
            {
                selectedBazar && (
                    <motion.header
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md"
                    >
                        <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight">Kisaan Connect</h1>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Location Indicator */}
                                <button
                                    className="hidden sm:flex items-center text-xs bg-primary-foreground/20 px-2 py-1 rounded-full hover:bg-primary-foreground/30 transition-colors"
                                    // For demo purposes, clicking location resets it to allow changing bazar
                                    onClick={() => { if (confirm('Change Rythu Bazar? Cart will be cleared.')) selectBazar('reset_all_hack'); }}
                                >
                                    <MapPin className="w-3 h-3 mr-1" />
                                    <span className="truncate max-w-[100px]">{selectedBazar.mandal}</span>
                                </button>

                                {/* Only show Cart if user is logged in AND is a customer AND not on store/orders/cart pages */}
                                {user && user.role !== 'farmer' && user.role !== 'delivery' && !pathname?.startsWith('/store') && !pathname?.startsWith('/orders') && !pathname?.startsWith('/cart') && (
                                    <Link href="/cart" className="relative p-2">
                                        <ShoppingBasket className="w-6 h-6" />
                                        {cartCount > 0 && (
                                            <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-in zoom-in">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                )}

                                {user && !pathname?.startsWith('/profile') ? (
                                    <Link href="/profile" className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors font-semibold text-xs border border-white/10">
                                        <User className="w-3.5 h-3.5" />
                                        <span>Profile</span>
                                    </Link>
                                ) : (
                                    !user && !pathname?.startsWith('/login') && (
                                        <Link href="/login" className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors font-semibold text-xs border border-white/10">
                                            <User className="w-3.5 h-3.5" />
                                            <span>Login</span>
                                        </Link>
                                    )
                                )}
                            </div>
                        </div>
                    </motion.header>
                )
            }

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-20 scrollbar-hide bg-stone-50">
                {children}
            </main>

            {/* Bottom Navigation (Mobile) - Only if selectedBazar AND NOT on auth/partner/delivery/profile/store/home pages */}
            {
                selectedBazar && pathname !== '/' && !pathname?.startsWith('/delivery') && !pathname?.startsWith('/partner') && !pathname?.startsWith('/profile') && !pathname?.startsWith('/store') && !pathname?.startsWith('/login') && !pathname?.startsWith('/register') && (
                    <motion.nav
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 sm:absolute sm:bottom-0 sm:w-full max-w-md mx-auto z-40"
                    >
                        <div className="flex justify-around items-center text-xs font-medium text-gray-500">
                            <Link href="/" className="flex flex-col items-center gap-1 text-primary p-2">
                                <div className="bg-primary/10 p-1.5 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                </div>
                                <span>Home</span>
                            </Link>
                            <button className="flex flex-col items-center gap-1 p-2 hover:text-primary transition-colors">
                                <div className="p-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></svg>
                                </div>
                                <span>Categories</span>
                            </button>
                            <Link href="/orders" className="flex flex-col items-center gap-1 p-2 hover:text-primary transition-colors">
                                <div className="p-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                                </div>
                                <span>Orders</span>
                            </Link>
                            <Link href="/profile" className="flex flex-col items-center gap-1 p-2 hover:text-primary transition-colors">
                                <div className="p-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                </div>
                                <span>Profile</span>
                            </Link>
                        </div>
                    </motion.nav>
                )
            }
        </div >
    );
}
