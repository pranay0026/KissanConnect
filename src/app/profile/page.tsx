"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Phone, LogOut, Package, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

import FarmerStockManager from '@/components/features/FarmerStockManager';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('rb_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push('/login');
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('rb_user');
        localStorage.removeItem('rb_selected_bazar');
        localStorage.removeItem('rb_cart');
        window.location.href = '/login';
    };

    if (!user) return <div className="p-10 text-center">Loading Profile...</div>;

    return (
        <div className="max-w-2xl mx-auto p-6 md:p-12">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-stone-500 hover:text-stone-900 font-bold mb-6 transition-colors"
            >
                <ArrowLeft className="w-5 h-5" /> Back
            </button>

            <h1 className="text-3xl font-bold mb-8 text-stone-900">Your Profile</h1>

            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">

                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-700 mx-auto md:mx-0">
                    <User className="w-10 h-10" />
                </div>

                <div className="flex-1 space-y-4 w-full">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                        <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase mt-2">
                            {user.role}
                        </span>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 text-gray-600 justify-center md:justify-start">
                            <Phone className="w-4 h-4" />
                            <span className="font-medium">{user.identifier}</span>
                        </div>
                        {user.address && (
                            <div className="flex items-center gap-3 text-gray-600 justify-center md:justify-start">
                                <MapPin className="w-4 h-4" />
                                <span className="font-medium">{user.address}</span>
                            </div>
                        )}
                        {user.bazar && (
                            <div className="flex items-center gap-3 text-gray-600 justify-center md:justify-start">
                                <MapPin className="w-4 h-4" />
                                <span className="font-medium">Market: {user.bazar}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Farmer Dashboard / Stock Manager */}
            {user.role === 'farmer' && (
                <div className="mt-8">
                    <button
                        onClick={() => router.push('/store')}
                        className="w-full bg-green-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors mb-6 shadow-lg shadow-green-200"
                    >
                        <Package className="w-5 h-5" /> Open Full Inventory Dashboard
                    </button>
                    <FarmerStockManager />
                </div>
            )}

            <div className="mt-8 grid gap-4">
                {user.role !== 'farmer' && (
                    <button
                        onClick={() => router.push('/orders')}
                        className="w-full bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors group"
                    >
                        <div className="flex items-center gap-3 font-bold text-gray-700">
                            <Package className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                            My Orders
                        </div>
                        <span className="text-gray-300 group-hover:text-gray-500 transition-colors">→</span>
                    </button>
                )}

                <button
                    onClick={handleLogout}
                    className="w-full bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-200 p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mt-4"
                >
                    <LogOut className="w-4 h-4" /> Logout
                </button>
            </div>
        </div>
    );
}
