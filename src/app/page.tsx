"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ChevronRight, Filter, Search, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import BazarSelector from "@/components/features/BazarSelector";
import { cn } from "@/lib/utils";

type Product = {
  _id?: string;
  name: string;
  category: string;
  stock: number;
  price: number;
  image?: string;
  unit?: string;
};

export default function Home() {
  const { selectedBazar, selectBazar, addToCart, user } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('rb_user');
    if (!storedUser && !user) {
      router.push('/login');
    }
  }, [user, router]);

  useEffect(() => {
    if (selectedBazar) {
      fetchProducts();
    }
  }, [selectedBazar]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        const productMap = new Map<string, Product>();
        data.products.forEach((item: Product) => {
          if (productMap.has(item.name)) {
            const existing = productMap.get(item.name)!;
            existing.stock += item.stock;
          } else {
            productMap.set(item.name, { ...item });
          }
        });
        setProducts(Array.from(productMap.values()));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    if (!user) {
      if (confirm("Please login to add items to cart. Go to login?")) {
        window.location.href = "/login";
      }
      return;
    }
    addToCart({
      id: product._id || Math.random().toString(),
      name: product.name,
      category: product.category,
      price: product.price,
      unit: product.unit || 'kg',
      image: product.image || '🥗',
      available: true
    }, 1);
  };

  if (!selectedBazar) {
    return <BazarSelector />;
  }

  const filteredProducts = products.filter(p =>
    selectedCategory === 'All' ? true : p.category === selectedCategory
  );

  const categories = ['All', 'Vegetables', 'Fruits', 'Greens', 'Pulses'];

  return (
    <div className="space-y-6 pb-20 p-4 md:p-8 max-w-7xl mx-auto">

      {/* Hero / Top Section */}
      <div
        className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
      >
        <div>
          <button
            onClick={() => router.back()}
            className="mb-2 flex items-center text-sm font-bold text-gray-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Marketplace</h1>
          <p className="text-gray-500 text-sm mt-1">Fresh produce from regulated Rythu Bazaars.</p>
        </div>

        <div className="flex items-center gap-3 bg-white p-2 rounded-full shadow-sm border border-gray-100 max-w-sm w-full md:w-auto">
          <div className="bg-primary/10 p-2 rounded-full">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-gray-400 font-bold uppercase">Current Location</p>
            <p className="text-sm font-bold truncate">{selectedBazar.name}</p>
          </div>
          <button
            onClick={() => { if (confirm('Switch market?')) selectBazar('reset'); }}
            className="text-xs text-primary font-bold hover:underline px-2"
          >
            Change
          </button>
        </div>
      </div>

      {/* Hero Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          className="md:col-span-2 bg-gradient-to-r from-primary to-green-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-center min-h-[200px]"
        >
          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl font-bold mb-2">Government Fixed Prices</h2>
            <p className="text-green-100 mb-6 font-medium">Enjoy fair pricing on all vegetables and fruits. No middlemen, directly from farmers.</p>
            <div className="flex gap-3">
              <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold border border-white/10">🍅 Tomato ₹24/kg</span>
              <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold border border-white/10">🧅 Onion ₹30/kg</span>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-10 translate-y-10">
            <svg width="300" height="300" viewBox="0 0 200 200" fill="white"><circle cx="100" cy="100" r="80" /></svg>
          </div>
        </div>

        <div
          className="hidden lg:block bg-stone-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl"
        >
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-1">Stock Updates</h3>
            <p className="text-stone-400 text-sm mb-4">Live inventory status</p>
            <div className="space-y-3">
              {products.slice(0, 3).map(p => (
                <div key={p.name} className="flex justify-between items-center text-sm border-b border-white/10 pb-2">
                  <span>{p.name}</span>
                  <span className="text-green-400 font-bold">{p.stock > 0 ? 'In Stock' : 'Out'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="sticky top-20 md:top-24 z-30 bg-stone-100/90 backdrop-blur-md py-4 -mx-4 px-4 md:-mx-8 md:px-8 border-b border-gray-200/50">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide max-w-7xl mx-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm active:scale-95",
                selectedCategory === cat
                  ? "bg-stone-900 text-white shadow-stone-900/20"
                  : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="min-h-[400px]">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {selectedCategory} <span className="text-sm font-normal text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{filteredProducts.length}</span>
          </h3>
          <div className="hidden md:flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input placeholder="Search..." className="pl-9 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <button className="bg-white border border-gray-200 p-2 rounded-full hover:bg-gray-50"><Filter className="w-4 h-4" /></button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-white aspect-[3/4] rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.stock <= 0;
              return (
                <div
                  key={product._id || product.name}
                  className="group bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col"
                >
                  <div className="bg-stone-50 rounded-2xl aspect-square mb-4 flex items-center justify-center relative overflow-hidden">
                    {(product.image && (product.image.startsWith('http') || product.image.startsWith('/') || product.image.includes('.png') || product.image.includes('.jpg'))) ? (
                      <img src={product.image} className={`w-full h-full object-cover transition-transform duration-500 ${!isOutOfStock && 'group-hover:scale-110'} ${isOutOfStock ? 'grayscale opacity-70' : ''}`} />
                    ) : (
                      <span className={`text-6xl drop-shadow-md transition-transform duration-300 ${!isOutOfStock && 'group-hover:scale-110'} ${isOutOfStock ? 'grayscale opacity-50' : ''}`}>{product.image || '🥗'}</span>
                    )}

                    {!isOutOfStock && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="bg-white text-black font-bold px-6 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform hover:bg-primary hover:text-white"
                        >
                          Add +
                        </button>
                      </div>
                    )}


                    {isOutOfStock && (
                      <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                        <span className="bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-sm">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 px-1 flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-gray-900 leading-tight line-clamp-2">{product.name}</h4>
                    </div>
                    <p className={`text-xs font-medium ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
                      {isOutOfStock ? 'Out of Stock' : `In Stock: ${product.stock}kg`}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between px-1">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Price</p>
                      <span className="text-lg font-extrabold text-gray-900">₹{product.price}</span>
                      <span className="text-xs text-gray-400 font-medium">/{product.unit || 'kg'}</span>
                    </div>
                    <button
                      disabled={isOutOfStock}
                      onClick={() => !isOutOfStock && handleAddToCart(product)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all md:hidden ${isOutOfStock ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-stone-100 hover:bg-stone-900 hover:text-white text-stone-900'}`}
                    >
                      <span className="text-xl mb-0.5 font-light">+</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">🥗</div>
            <h3 className="font-bold text-gray-900 text-lg">No products found</h3>
            <p className="text-gray-500">Try selecting a different category.</p>
          </div>
        )}
      </div>

    </div>
  );
}
