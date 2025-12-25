"use client";

import { useState, useEffect } from "react";
import { PricingService } from "@/lib/services/pricing";
import { Plus, TrendingDown, Save, Image as ImageIcon, Trash2 } from "lucide-react";

type StoreProduct = {
    _id?: string;
    name: string;
    category: string;
    stock: number;
    price: number;
    savings: number;
    competitorPrice: number;
    image?: string;
};

export default function StoreDashboard() {
    const [products, setProducts] = useState<StoreProduct[]>([]);
    const [newItem, setNewItem] = useState({ name: 'Tomato (Local)', stock: 50, category: 'Vegetables', image: '' });
    const [calculatedPrice, setCalculatedPrice] = useState<any>(null);
    const [isMounted, setIsMounted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.success) {
                setProducts(data.products);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getProduceList = (category: string) => {
        switch (category) {
            case 'Vegetables':
                return ['Tomato (Local)', 'Onion (Kurnool)', 'Potato (Agra)', 'Carrot (Ooty)', 'Beans (French)', 'Brinjal (Round)', 'Ladies Finger', 'Capsicum (Green)', 'Cucumber'];
            case 'Fruits':
                return ['Banana (Chakkarakeli)', 'Apple (Royal Gala)', 'Papaya', 'Guava', 'Pomegranate', 'Watermelon', 'Mango (Banganapalli)', 'Dragon Fruit'];
            case 'Greens':
                return ['Coriander', 'Spinach (Palak)', 'Mint (Pudina)', 'Curry Leaves', 'Methi (Fenugreek)', 'Spring Onion'];
            case 'Pulses':
                return ['Toor Dal', 'Moong Dal', 'Urad Dal', 'Chana Dal', 'Rice (Sona Masoori)', 'Wheat Flour (Atta)', 'Groundnut'];
            default:
                return [];
        }
    };

    // Recalculate price when item selection changes
    useEffect(() => {
        const analysis = PricingService.calculateSmartPrice(newItem.name);
        setCalculatedPrice(analysis);
    }, [newItem.name]);

    const handleAddProduct = async () => {
        if (!calculatedPrice) return;
        setLoading(true);

        try {
            // Mock Bazar from localStorage (Logged in user)
            const userStr = localStorage.getItem('rb_user');
            const user = userStr ? JSON.parse(userStr) : {};
            const bazarName = user.bazar || 'MVP Colony Rythu Bazar'; // Fallback

            const payload = {
                name: newItem.name,
                category: newItem.category,
                stock: newItem.stock,
                price: calculatedPrice.finalPrice,
                savings: calculatedPrice.savings,
                competitorPrice: calculatedPrice.competitorPrice,
                bazar: bazarName,
                image: newItem.image // Image URL
            };

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (data.success) {
                alert('Stock Added Successfully!');
                fetchProducts(); // Refresh list
                setNewItem({ ...newItem, stock: 50, image: '' });
            } else {
                alert('Failed: ' + data.error);
            }
        } catch (err) {
            alert('Error adding product');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(products.filter(p => p._id !== id));
            } else {
                alert('Failed to delete');
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (!isMounted) {
        return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Add Stock Panel */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" /> Add Daily Stock
                </h2>

                <div className="space-y-4">
                    {/* Category Selector */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {['Vegetables', 'Fruits', 'Greens', 'Pulses'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setNewItem({ ...newItem, category: cat, name: '' })}
                                    className={`p-2 text-xs font-bold rounded-lg border ${newItem.category === cat
                                        ? 'bg-stone-800 text-white border-stone-800'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Produce ({newItem.category})</label>
                        <select
                            className="w-full p-3 border rounded-lg bg-gray-50"
                            value={newItem.name}
                            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        >
                            <option value="">-- Choose Item --</option>
                            {getProduceList(newItem.category).map((item) => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Stock Quantity (kg)</label>
                        <input
                            type="number"
                            value={newItem.stock}
                            onChange={(e) => setNewItem({ ...newItem, stock: Number(e.target.value) })}
                            className="w-full p-3 border rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Product Image URL</label>
                        <div className="relative">
                            <ImageIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={newItem.image}
                                onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                                placeholder="https://example.com/image.jpg"
                                className="w-full pl-10 pr-3 py-3 border rounded-lg text-sm"
                            />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">Paste a link to the photo (optional)</p>
                    </div>

                    {/* Smart Price Preview */}
                    {calculatedPrice && (
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-blue-800 uppercase">Govt Base Price</span>
                                <span className="text-sm font-mono">₹{calculatedPrice.govtPrice}</span>
                            </div>
                            <div className="flex justify-between items-center text-red-400 line-through text-xs">
                                <span>Market / Competitor</span>
                                <span>₹{calculatedPrice.competitorPrice}</span>
                            </div>
                            <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between items-center">
                                <span className="font-bold text-blue-900">Auto-Selling Price</span>
                                <span className="font-bold text-2xl text-primary">₹{calculatedPrice.finalPrice}</span>
                            </div>
                            <div className="text-[10px] text-green-700 font-bold text-center bg-green-100 py-1 rounded">
                                Unbeatable! ₹{calculatedPrice.savings} cheaper than Blinkit
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleAddProduct}
                        disabled={loading}
                        className="w-full bg-stone-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        {loading ? 'Saving...' : 'Update Inventory'}
                    </button>
                </div>
            </div>

            {/* Live Inventory List */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Live Inventory (Global)</h2>
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                        {products.length} Items Active
                    </span>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs sticky top-0">
                            <tr>
                                <th className="p-4">Product</th>
                                <th className="p-4">Image</th>
                                <th className="p-4">Stock</th>
                                <th className="p-4">Price</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map((p) => (
                                <tr key={p._id || Math.random()} className="hover:bg-gray-50">
                                    <td className="p-4 font-medium">{p.name}</td>
                                    <td className="p-4">
                                        {p.image && p.image.startsWith('http') ? (
                                            <img src={p.image} alt="" className="w-8 h-8 rounded object-cover border" />
                                        ) : (
                                            <span className="text-xl">{p.image || '📦'}</span>
                                        )}
                                    </td>
                                    <td className="p-4">{p.stock} kg</td>
                                    <td className="p-4 font-bold text-green-700">₹{p.price}</td>
                                    <td className="p-4 flex items-center gap-2">
                                        <span className="bg-green-50 text-green-600 px-2 py-1 rounded text-xs font-bold">Active</span>
                                        <button
                                            onClick={() => handleDelete(p._id!)}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete Item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {products.length === 0 && <div className="p-8 text-center text-gray-400">No inventory added yet.</div>}
            </div>

        </div>
    );
}
