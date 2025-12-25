"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bike, Navigation, CheckCircle, Package, MapPin, LogOut } from 'lucide-react';
import dynamic from 'next/dynamic';


const MapTracking = dynamic(() => import('@/components/MapTracking'), { ssr: false });

type Order = {
    _id: string;
    items: { name: string; quantity: number; unit: string; price: number }[];
    totalAmount: number;
    address: string;
    bazar: string;
    status: string;
    otp?: string;
    pickupLocation?: { type: 'Point', coordinates: [number, number] };
    dropLocation?: { type: 'Point', coordinates: [number, number] };
    customerId?: {
        name: string;
        identifier: string;
    };
};

export default function DeliveryDashboard() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    // ... constants for simulation
    const MOCK_PICKUP = { lat: 16.5062, lng: 80.6480, address: 'Benz Circle Bazar' };
    const MOCK_DROP = { lat: 16.5150, lng: 80.6300, address: 'Customer Home' };
    const MOCK_DRIVER = { lat: 16.5100, lng: 80.6400 };

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'available' | 'active' | 'history'>('available');
    const [myOrders, setMyOrders] = useState<Order[]>([]);
    const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
    const [otpInput, setOtpInput] = useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('rb_user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role !== 'delivery') {
            router.push('/');
            return;
        }
        setUser(parsedUser);
        // Start Polling with Location
        const getLocationAndFetch = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        fetchOrders(parsedUser, position.coords.latitude, position.coords.longitude);
                    },
                    (error) => {
                        console.error("Location Error:", error);
                        fetchOrders(parsedUser); // Fallback
                    }
                );
            } else {
                fetchOrders(parsedUser);
            }
        };

        getLocationAndFetch();
        const interval = setInterval(getLocationAndFetch, 10000); // 10s Poll
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async (currentUser: any, lat?: number, lng?: number) => {
        try {
            let url = `/api/orders/delivery?partnerId=${currentUser.id}&serviceArea=${encodeURIComponent(currentUser.serviceArea || '')}`;
            if (lat && lng) url += `&lat=${lat}&lng=${lng}`;

            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setMyOrders(data.myOrders);
                setAvailableOrders(data.availableOrders);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (orderId: string, action: string, otp?: string) => {
        if (action === 'delivered' && !otp) {
            alert('Please enter Customer OTP');
            return;
        }

        try {
            const res = await fetch('/api/orders/delivery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, partnerId: user.id, action, otp })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                fetchOrders(user); // Refresh
                setOtpInput('');
            } else {
                alert(data.error);
            }
        } catch (err) {
            alert('Action Failed');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('rb_user');
        window.location.href = '/login';
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-stone-50 pb-20">
            {/* Header */}
            <div className="bg-stone-900 text-white p-6 sticky top-0 z-50 shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <Bike className="text-green-400" /> Delivery Partner
                    </h1>
                    <div className="text-right flex items-center gap-4">
                        <div>
                            <p className="font-bold text-sm">{user.name}</p>
                            <p className="text-xs text-stone-400">{user.serviceArea}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-stone-800 hover:bg-red-900/50 p-2 rounded-lg transition-colors text-stone-400 hover:text-red-400"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-stone-800 p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('available')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'available' ? 'bg-green-600 text-white shadow' : 'text-stone-400 hover:text-white'}`}
                    >
                        Available ({availableOrders.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'active' ? 'bg-green-600 text-white shadow' : 'text-stone-400 hover:text-white'}`}
                    >
                        Active ({myOrders.filter(o => o.status !== 'Delivered').length})
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 py-2 text-sm font-bold rounded-md transition-colors ${activeTab === 'history' ? 'bg-green-600 text-white shadow' : 'text-stone-400 hover:text-white'}`}
                    >
                        History
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4 max-w-lg mx-auto">
                {activeTab === 'available' ? (
                    /* AVAILABLE ORDERS POOL */
                    availableOrders.length === 0 ? (
                        <div className="text-center py-10 text-stone-500">
                            <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No new orders in your area.</p>
                        </div>
                    ) : (
                        availableOrders.map(order => (
                            <div key={order._id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-stone-800">Order #{order._id.slice(-6)}</h3>
                                        <p className="text-xs text-stone-500">{order.items.length} Items • ₹{order.totalAmount}</p>
                                    </div>
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold">New</span>
                                </div>
                                <div className="bg-stone-50 p-2 rounded-lg mb-3 text-sm text-stone-600">
                                    <p className="flex items-center gap-1"><Navigation className="w-3 h-3" /> Pickup: <b>{order.bazar}</b></p>
                                    <p className="flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> Drop: <b>{order.address}</b></p>
                                </div>

                                <div className="mb-3 flex flex-wrap gap-1">
                                    {order.items.map((item, idx) => (
                                        <span key={idx} className="text-xs bg-stone-100 px-2 py-1 rounded text-stone-600 border border-stone-200">
                                            {item.name} x{item.quantity}
                                        </span>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handleAction(order._id, 'accept')}
                                    className="w-full bg-stone-900 text-white font-bold py-3 rounded-lg hover:bg-black transition-colors"
                                >
                                    Accept Order
                                </button>
                            </div>
                        ))
                    )
                ) : activeTab === 'active' ? (
                    /* MY ACTIVE ORDERS */
                    myOrders.filter(o => o.status !== 'Delivered').length === 0 ? (
                        <div className="text-center py-10 text-stone-500">
                            <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No active deliveries.</p>
                        </div>
                    ) : (
                        myOrders.filter(o => o.status !== 'Delivered').map(order => (
                            <div key={order._id} className="bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500">
                                {/* ... Order Card Content (Same as before) ... */}
                                <div className="flex justify-between mb-4 border-b pb-2">
                                    <span className="font-bold text-lg">#{order._id.slice(-6)}</span>
                                    <span className="text-xs font-bold uppercase bg-yellow-100 text-yellow-800 px-2 py-1 rounded">{order.status}</span>
                                </div>

                                <div className="mb-4 flex flex-wrap gap-1">
                                    {order.items.map((item, idx) => (
                                        <span key={idx} className="text-xs bg-stone-100 px-2 py-1 rounded text-stone-600 border border-stone-200">
                                            {item.name} x{item.quantity}
                                        </span>
                                    ))}
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex gap-3">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-2 h-2 bg-stone-300 rounded-full"></div>
                                            <div className="w-0.5 h-8 bg-stone-200"></div>
                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        </div>
                                        <div className="space-y-4 text-sm">
                                            <div>
                                                <p className="text-xs text-stone-400 uppercase">Pickup</p>
                                                <p className="font-semibold">{order.bazar}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-stone-400 uppercase">Delivery Location</p>
                                                <p className="font-semibold">{order.address}</p>
                                                {order.customerId && (
                                                    <div className="mt-2 text-stone-600 bg-stone-50 p-2 rounded">
                                                        <p className="font-bold text-stone-800">{order.customerId.name}</p>
                                                        <p className="text-xs font-mono">{order.customerId.identifier}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-full h-48 bg-stone-100 rounded-lg overflow-hidden mt-4 border border-stone-200">
                                        {/* <MapTracking
                                            pickup={order.pickupLocation ? { lat: order.pickupLocation.coordinates[1], lng: order.pickupLocation.coordinates[0] } : MOCK_PICKUP}
                                            drop={order.dropLocation ? { lat: order.dropLocation.coordinates[1], lng: order.dropLocation.coordinates[0] } : MOCK_DROP}
                                            driver={order.status === 'Delivered' && order.dropLocation ? { lat: order.dropLocation.coordinates[1], lng: order.dropLocation.coordinates[0] } : MOCK_DRIVER}
                                        /> */}
                                        <div className="flex items-center justify-center h-full text-stone-400 text-sm">Map Loading... (Disabled for Debugging)</div>
                                    </div>
                                </div>

                                {/* Cancel Action */}
                                <div className="mb-3">
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to cancel this order?')) {
                                                handleAction(order._id, 'cancel');
                                            }
                                        }}
                                        className="w-full bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 rounded-lg transition-colors border border-red-200 text-sm flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4" /> Cancel Order
                                    </button>
                                </div>

                                {/* Actions based on Status */}
                                {order.status === 'Assigned' && (
                                    <button
                                        onClick={() => handleAction(order._id, 'picked_up')}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors"
                                    >
                                        Confirm Pickup
                                    </button>
                                )}

                                {order.status === 'PickedUp' && (
                                    <div className="bg-stone-100 p-3 rounded-lg">
                                        <label className="text-xs font-bold text-stone-500 mb-1 block">Ask Customer for OTP</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Enter 4-digit OTP"
                                                className="flex-1 border p-2 rounded text-center font-mono font-bold tracking-widest"
                                                maxLength={4}
                                                value={otpInput}
                                                onChange={e => setOtpInput(e.target.value)}
                                            />
                                            <button
                                                onClick={() => handleAction(order._id, 'delivered', otpInput)}
                                                className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 rounded"
                                            >
                                                Verfiy & Deliver
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )
                ) : (
                    /* HISTORY TAB */
                    myOrders.filter(o => o.status === 'Delivered').length === 0 ? (
                        <div className="text-center py-10 text-stone-500">
                            <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>No completed deliveries yet.</p>
                        </div>
                    ) : (
                        myOrders.filter(o => o.status === 'Delivered').map(order => (
                            <div key={order._id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 opacity-75">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-stone-600">#{order._id.slice(-6)}</span>
                                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                        <CheckCircle className="w-3 h-3" /> Delivered
                                    </span>
                                </div>
                                <div className="text-sm text-stone-500">
                                    <p>Earned: <span className="font-bold text-stone-800">₹{order.totalAmount - order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span></p>
                                    <p className="text-xs mt-1">{new Date().toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    );
}
