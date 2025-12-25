"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Plus, Loader2 } from "lucide-react";
import { PricingService } from "@/lib/services/pricing";

export default function FarmerStockManager() {
    const { user } = useAuth();
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', category: 'Vegetables', price: '', stock: '', bazar: user?.bazar || 'Benz Circle Bazar', image: '' });

    const [priceAnalysis, setPriceAnalysis] = useState<any>(null);

    useEffect(() => {
        if (newProduct.name) {
            const analysis = PricingService.calculateSmartPrice(newProduct.name);
            setPriceAnalysis(analysis);
            setNewProduct(prev => ({ ...prev, price: analysis.finalPrice.toString() }));
        }
    }, [newProduct.name]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // In a real app, query by farmerId. For now, we fetch all and filter in frontend (as per existing simplistic approach)
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.success) {
                // Filter products for this farmer. Assuming product.farmerId matches user._id, 
                // OR as per current mock setup, we might just show all if no farmerId enforced.
                // Let's assume we show everything for now to facilitate testing as requested.
                setProducts(data.products);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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

    const addStock = async (productId: string, currentStock: number) => {
        const quantityStr = prompt(`Current Stock: ${currentStock}kg\nEnter quantity to ADD (kg):`, "10");
        if (!quantityStr) return;

        const quantity = parseFloat(quantityStr);
        if (isNaN(quantity) || quantity <= 0) {
            alert("Please enter a valid positive number.");
            return;
        }

        setUpdatingId(productId);
        try {
            const res = await fetch('/api/products/stock', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity })
            });
            const data = await res.json();

            if (data.success) {
                // Update local state
                setProducts(prev => prev.map(p =>
                    p._id === productId ? { ...p, stock: p.stock + quantity } : p
                ));
                alert("Stock updated successfully!");
            } else {
                alert(data.error || "Failed to update stock");
            }
        } catch (error) {
            console.error(error);
            alert("Error updating stock");
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
                📦 Manage Inventory
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="ml-auto text-sm bg-primary text-white px-3 py-1 rounded-full flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" /> Add Item
                </button>
            </h3>

            {isAdding && (
                <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 mb-4 animate-in fade-in slide-in-from-top-2">
                    <h4 className="font-bold mb-3">Add New Product</h4>
                    <div className="grid grid-cols-2 gap-3 mb-3">

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Category</label>
                            <select
                                className="w-full p-2 rounded border bg-white"
                                value={newProduct.category}
                                onChange={e => setNewProduct({ ...newProduct, category: e.target.value, name: '' })}
                            >
                                <option>Vegetables</option>
                                <option>Fruits</option>
                                <option>Greens</option>
                                <option>Pulses</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Product Name</label>
                            <select
                                className="w-full p-2 rounded border bg-white"
                                value={newProduct.name}
                                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                            >
                                <option value="">-- Select Item --</option>
                                {getProduceList(newProduct.category).map(item => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1 col-span-2 sm:col-span-1">
                            <input
                                className="p-2 rounded border w-full bg-gray-100 cursor-not-allowed"
                                type="number"
                                placeholder="Price (₹)"
                                value={newProduct.price}
                                readOnly
                                title="Auto-calculated based on market rates"
                            />
                            {priceAnalysis && (
                                <p className="text-[10px] text-green-700 font-bold">
                                    Market: ₹{priceAnalysis.competitorPrice} (Save ₹{priceAnalysis.savings})
                                </p>
                            )}
                        </div>

                        <input className="p-2 rounded border" type="number" placeholder="Stock (kg)" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
                        <input className="p-2 rounded border" placeholder="Bazar" value={newProduct.bazar} onChange={e => setNewProduct({ ...newProduct, bazar: e.target.value })} />
                        <input className="p-2 rounded border" placeholder="Image Emoji (🍅)" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })} />
                    </div>
                    <button
                        onClick={async () => {
                            if (!newProduct.name || !newProduct.price || !newProduct.stock) return alert("Fill all fields");
                            try {
                                const res = await fetch('/api/products', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(newProduct)
                                });
                                if (res.ok) {
                                    alert("Product Added!");
                                    setIsAdding(false);
                                    fetchProducts();
                                    setNewProduct({ name: '', category: 'Vegetables', price: '', stock: '', bazar: user?.bazar || 'Benz Circle Bazar', image: '' });
                                } else {
                                    alert("Failed");
                                }
                            } catch (e) { console.error(e); }
                        }}
                        className="w-full bg-stone-900 text-white font-bold py-2 rounded-lg"
                    >
                        Save Product
                    </button>
                </div>
            )}

            <div className="grid gap-3">
                {products.map(product => (
                    <div key={product._id} className="bg-white border border-gray-100 p-4 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-stone-50 rounded-lg flex items-center justify-center text-xl">
                                {product.image && !product.image.startsWith('http') ? product.image : '📦'}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900">{product.name}</h4>
                                <p className="text-sm text-gray-500">Stock: <span className={product.stock > 0 ? "text-green-600 font-bold" : "text-red-500 font-bold"}>{product.stock} kg</span></p>
                            </div>
                        </div>

                        <button
                            onClick={() => addStock(product._id, product.stock)}
                            disabled={updatingId === product._id}
                            className="bg-primary/10 text-primary hover:bg-primary hover:text-white disabled:opacity-50 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all"
                        >
                            {updatingId === product._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Add Stock
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
