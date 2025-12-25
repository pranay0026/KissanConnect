"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Tractor, Bike, MapPin, Phone, Lock, UserCircle, ArrowRight, Leaf } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [role, setRole] = useState<'customer' | 'farmer' | 'delivery'>('customer');
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        identifier: '',
        password: '',
        address: '',
        bazar: 'MVP Colony Rythu Bazar', // For Farmer & Delivery (Service Area)
        vehicleType: 'Bike' // For Delivery
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...formData,
            role,
            serviceArea: role === 'delivery' ? formData.bazar : undefined // Map bazar to serviceArea for delivery
        };

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');

            alert('Registration Successful! Please Login.');
            router.push('/login');

        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white">

            {/* Left Side - Hero / Image */}
            <div className="hidden lg:flex lg:w-1/2 bg-green-900 relative items-center justify-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1616401784845-180882ba9ba8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                <div className="relative z-10 text-white max-w-lg">
                    <div className="bg-white/10 backdrop-blur-sm w-fit p-3 rounded-2xl mb-8 border border-white/20">
                        <Leaf className="w-8 h-8 text-green-300" />
                    </div>
                    <h1 className="text-5xl font-bold mb-6 leading-tight">Join the Kisaan Connect <br />Revolution.</h1>
                    <p className="text-xl text-green-100 leading-relaxed">
                        Connect directly—whether you're growing fresh produce or looking to buy it at the best price.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-stone-50 lg:bg-white overflow-y-auto">
                <div className="max-w-md w-full space-y-8 py-8">

                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                        <p className="text-gray-500 mt-2">Choose your role to get started.</p>
                    </div>

                    {/* Role Selection */}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => setRole('customer')}
                            className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${role === 'customer' ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
                        >
                            <User className="w-5 h-5" />
                            <span className="text-xs font-bold">Consumer</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setRole('farmer')}
                            className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${role === 'farmer' ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
                        >
                            <Tractor className="w-5 h-5" />
                            <span className="text-xs font-bold">Farmer</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setRole('delivery')}
                            className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${role === 'delivery' ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 hover:border-gray-300 text-gray-500'}`}
                        >
                            <Bike className="w-5 h-5" />
                            <span className="text-xs font-bold">Partner</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-500 ml-1">Full Name</label>
                            <div className="relative">
                                <UserCircle className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter full name"
                                    className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none font-medium"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-gray-500 ml-1">Mobile / ID</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        required
                                        value={formData.identifier}
                                        onChange={e => setFormData({ ...formData, identifier: e.target.value })}
                                        placeholder="Phone Number"
                                        className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none font-medium text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-gray-500 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        placeholder="Min 6 chars"
                                        className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none font-medium text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {role === 'customer' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-gray-500 ml-1">Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <input
                                        required
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        placeholder="Your delivery address area"
                                        className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none font-medium"
                                    />
                                </div>
                            </div>
                        )}

                        {role !== 'customer' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-gray-500 ml-1">{role === 'farmer' ? 'Your Market' : 'Service Area'}</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <select
                                        className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none font-medium appearance-none"
                                        value={formData.bazar}
                                        onChange={e => setFormData({ ...formData, bazar: e.target.value })}
                                    >
                                        <option>MVP Colony Rythu Bazar</option>
                                        <option>Seethammadhara Rythu Bazar</option>
                                        <option>Kancharapalem Rythu Bazar</option>
                                        <option>Gajuwaka Rythu Bazar</option>
                                        <option>Eluru Rythu Bazar</option>
                                        <option>Bhimavaram Rythu Bazar</option>
                                        <option>Tanuku Rythu Bazar</option>
                                        <option>Tadepalligudem Rythu Bazar</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {role === 'delivery' && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-gray-500 ml-1">Vehicle Type</label>
                                <div className="relative">
                                    <Bike className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                                    <select
                                        className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none font-medium appearance-none"
                                        value={formData.vehicleType}
                                        onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
                                    >
                                        <option>Bike</option>
                                        <option>Scooter</option>
                                        <option>Electric Bike</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-stone-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-6"
                        >
                            {loading ? 'Creating...' : 'Create Account'} <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500">
                        Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Login here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
