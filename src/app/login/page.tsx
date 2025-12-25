"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Tractor, ArrowRight, Phone, Leaf, Bike } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [role, setRole] = useState<'customer' | 'farmer' | 'delivery'>('customer');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!identifier || !password) {
            alert('Please enter credentials');
            return;
        }

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password, role })
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Login Failed');
                return;
            }

            localStorage.setItem('rb_user', JSON.stringify(data.user));

            if (data.user.role === 'farmer') {
                window.location.href = '/store';
            } else if (data.user.role === 'delivery') {
                window.location.href = '/delivery';
            } else {
                window.location.href = '/';
            }

        } catch (err) {
            console.error(err);
            alert('Something went wrong.');
        }
    };

    return (
        <div className="min-h-screen flex bg-white">

            {/* Left Side - Hero / Image */}
            <div className="hidden lg:flex lg:w-1/2 bg-stone-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
                <div className="relative z-10 text-white max-w-lg">
                    <div className="bg-green-500/20 backdrop-blur-sm w-fit p-3 rounded-2xl mb-8 border border-green-500/30">
                        <Leaf className="w-8 h-8 text-green-400" />
                    </div>
                    <h1 className="text-5xl font-bold mb-6 leading-tight">Fresh from the farm, <br /><span className="text-green-400">straight to you.</span></h1>
                    <p className="text-xl text-stone-300 leading-relaxed">
                        Supporting local farmers and ensuring the best prices for everyone. Government regulated, community driven.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-stone-50 lg:bg-white">
                <div className="max-w-md w-full space-y-8">

                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
                        <p className="text-gray-500 mt-2">Please sign in to your account</p>
                    </div>

                    {/* Role Selector */}
                    <div className="grid grid-cols-3 gap-2 p-1 bg-stone-100 rounded-2xl">
                        <button
                            onClick={() => setRole('customer')}
                            className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all ${role === 'customer' ? 'bg-white shadow-md text-green-700' : 'text-gray-500 hover:bg-stone-200'}`}
                        >
                            <User className="w-4 h-4" /> Consumer
                        </button>
                        <button
                            onClick={() => setRole('farmer')}
                            className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all ${role === 'farmer' ? 'bg-white shadow-md text-green-700' : 'text-gray-500 hover:bg-stone-200'}`}
                        >
                            <Tractor className="w-4 h-4" /> Farmer
                        </button>
                        <button
                            onClick={() => setRole('delivery')}
                            className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 sm:gap-2 transition-all ${role === 'delivery' ? 'bg-white shadow-md text-green-700' : 'text-gray-500 hover:bg-stone-200'}`}
                        >
                            <Bike className="w-4 h-4" /> Partner
                        </button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-500 ml-1">
                                {role === 'customer' ? 'Mobile Number' : role === 'farmer' ? 'Farmer ID / License' : 'Vehicle / Partner ID'}
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-3.5 text-gray-400">
                                    {role === 'customer' ? <Phone className="w-5 h-5" /> : role === 'farmer' ? <Tractor className="w-5 h-5" /> : <Bike className="w-5 h-5" />}
                                </div>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder={role === 'customer' ? '9876543210' : role === 'farmer' ? 'AP-FARM-01' : 'DLV-001'}
                                    className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-500 ml-1">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition-all font-medium"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 group"
                        >
                            Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500">
                        Don't have an account? <Link href="/register" className="text-primary font-bold hover:underline">Create Account</Link>
                    </p>
                </div>
            </div>

        </div>
    );
}
