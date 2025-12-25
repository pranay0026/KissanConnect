"use client";

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { Package, Truck, CheckCircle, Navigation, Clock, ArrowLeft } from 'lucide-react';

import dynamic from 'next/dynamic';

const MapTracking = dynamic(() => import('@/components/MapTracking'), { ssr: false });

type Order = {
    _id: string;
    items: any[];
    totalAmount: number;
    status: string;
    deliveryType: string;
    bazar: string;
    otp?: string;
    createdAt: string;
    deliveryPartnerId?: {
        name: string;
        currentLocation?: { coordinates: [number, number] };
    };
    pickupLocation?: { coordinates: [number, number] };
    dropLocation?: { coordinates: [number, number] };
};

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            const user = JSON.parse(localStorage.getItem('rb_user') || '{}');
            if (!user.id) return;

            try {
                // In a real app we would have a specific API for my orders. 
                // Reusing delivery API temporarily or assuming we create a new one.
                // Let's assume we created a simple `api/orders?customerId=...` endpoint.
                // Since we haven't created that yet, let's create it implicitly here or create the route file.
                // I will create the route file in the next step.

                const res = await fetch(`/api/orders?customerId=${user.id}`);
                const data = await res.json();
                if (data.success) {
                    setOrders(data.orders);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();

        // Poll for status updates every 5 seconds
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="p-10 text-center">Loading Orders...</div>;

    // Simulation Coordinates (Vijayawada Area)
    const MOCK_PICKUP = { lat: 16.5062, lng: 80.6480, address: 'Benz Circle Bazar' };
    const MOCK_DROP = { lat: 16.5150, lng: 80.6300, address: 'Customer Home' };
    const MOCK_DRIVER = { lat: 16.5100, lng: 80.6400 };

    const handleCancelOrder = async (orderId: string) => {
        if (!confirm('Are you sure you want to cancel this order? Stock will be restored.')) return;

        try {
            const res = await fetch('/api/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId })
            });

            const data = await res.json();
            if (data.success) {
                alert('Order Cancelled Successfully');
                // Refresh orders immediately
                const user = JSON.parse(localStorage.getItem('rb_user') || '{}');
                if (user.id) {
                    const existingRes = await fetch(`/api/orders?customerId=${user.id}`);
                    const existingData = await existingRes.json();
                    if (existingData.success) setOrders(existingData.orders);
                }
            } else {
                alert(data.error || 'Failed to cancel');
            }
        } catch (e) {
            console.error(e);
            alert('Something went wrong');
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8">
            <button
                onClick={() => router.back()}
                className="mb-4 flex items-center text-sm font-bold text-gray-500 hover:text-primary transition-colors"
            >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>
            <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-stone-50 rounded-3xl">
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No past orders found.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map(order => {
                        const created = new Date(order.createdAt).getTime();
                        const now = Date.now(); // Note: This won't auto-update every second without a timer, but the 5s poll will trigger re-renders mostly.
                        const diffMinutes = (now - created) / 1000 / 60;
                        const canCancel = diffMinutes < 3 && order.status !== 'Cancelled' && order.status !== 'Delivered';

                        return (
                            <div key={order._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm overflow-hidden relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Order #{order._id.slice(-6)}</p>
                                        <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold">₹{order.totalAmount}</p>
                                        <p className="text-xs text-gray-500 capitalize">{order.deliveryType}</p>
                                    </div>
                                </div>

                                {/* Tracking Status Bar */}
                                <div className="bg-stone-50 rounded-xl p-4 mb-4">
                                    {order.status === 'Cancelled' ? (
                                        <div className="text-center text-red-500 font-bold py-2 border-2 border-red-100 rounded-lg bg-red-50">
                                            ❌ Order Cancelled
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-2 uppercase tracking-wide">
                                                <span className={order.status !== 'Placed' ? 'text-green-600' : 'text-green-600'}>Placed</span>
                                                <span className={['Assigned', 'PickedUp', 'Delivered'].includes(order.status) ? 'text-green-600' : ''}>Assigned</span>
                                                <span className={['PickedUp', 'Delivered'].includes(order.status) ? 'text-green-600' : ''}>On High Way</span>
                                                <span className={order.status === 'Delivered' ? 'text-green-600' : ''}>Delivered</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-green-500 transition-all duration-1000"
                                                    style={{ width: order.status === 'Delivered' ? '100%' : order.status === 'PickedUp' ? '75%' : order.status === 'Assigned' ? '50%' : '25%' }}
                                                ></div>
                                            </div>
                                            <p className="text-center text-sm font-bold text-gray-700 mt-2 flex items-center justify-center gap-2">
                                                {order.status === 'Placed' && <><Clock className="w-4 h-4" /> Waiting for Partner</>}
                                                {order.status === 'Assigned' && <><Navigation className="w-4 h-4 text-blue-500" /> Partner Assigned! Preparing.</>}
                                                {order.status === 'PickedUp' && <><Truck className="w-4 h-4 text-orange-500" /> Out for Delivery!</>}
                                                {order.status === 'Delivered' && <><CheckCircle className="w-4 h-4 text-green-500" /> Delivered Successfully</>}
                                            </p>
                                        </>
                                    )}

                                    {order.status === 'PickedUp' && order.otp && (
                                        <div className="mt-3 bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-center animate-pulse">
                                            <p className="text-xs font-bold uppercase mb-1">Share OTP with Delivery Partner</p>
                                            <p className="text-2xl font-mono font-bold tracking-widest">{order.otp}</p>
                                        </div>
                                    )}
                                </div>

                                {/* CANCEL BUTTON */}
                                {canCancel && (
                                    <div className="mb-4 flex justify-end">
                                        <button
                                            onClick={() => handleCancelOrder(order._id)}
                                            className="text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                                        >
                                            Cancel Order (Available for {Math.max(0, 3 - Math.floor(diffMinutes))}m)
                                        </button>
                                    </div>
                                )}

                                {/* Partner Details Card */}
                                {['Assigned', 'PickedUp'].includes(order.status) && order.deliveryPartnerId && (
                                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl mb-4 flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                                            🛵
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-600 font-bold uppercase">Delivery Partner</p>
                                            <p className="font-bold text-gray-900 text-lg">{order.deliveryPartnerId.name}</p>
                                            <p className="text-sm text-gray-500">Verified Partner • Vaccinated</p>
                                        </div>
                                    </div>
                                )}

                                {/* MAP INTEGRATION */}
                                {['Assigned', 'PickedUp', 'Delivered'].includes(order.status) && (
                                    <div className="w-full h-64 bg-stone-100 rounded-xl overflow-hidden mb-4 border border-stone-200">
                                        {/* <MapTracking
                                        pickup={order.pickupLocation ? { lat: order.pickupLocation.coordinates[1], lng: order.pickupLocation.coordinates[0] } : MOCK_PICKUP}
                                        drop={order.dropLocation ? { lat: order.dropLocation.coordinates[1], lng: order.dropLocation.coordinates[0] } : MOCK_DROP}
                                        driver={order.deliveryPartnerId?.currentLocation?.coordinates?.length === 2 ? { lat: order.deliveryPartnerId.currentLocation.coordinates[1], lng: order.deliveryPartnerId.currentLocation.coordinates[0] } : MOCK_DRIVER}
                                    /> */}
                                        <div className="flex items-center justify-center h-full text-stone-400 text-sm">Map Loading... (Disabled for Debugging)</div>
                                    </div>
                                )}

                                <div className="border-t pt-4">
                                    <p className="text-sm text-gray-500 mb-2">{order.items.length} Items</p>
                                    <div className="flex flex-wrap gap-2">
                                        {order.items.slice(0, 5).map((item, i) => (
                                            <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600">{item.name} x{item.quantity}</span>
                                        ))}
                                        {order.items.length > 5 && <span className="text-xs text-gray-400">+{order.items.length - 5} more</span>}
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
