"use client";

import Link from 'next/link';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-stone-100">
            <nav className="bg-stone-900 text-white p-4 shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-green-500 p-1 rounded font-bold text-black text-xs">OFFICIAL</div>
                        <h1 className="font-bold text-lg">Rythu Store Manager</h1>
                    </div>
                    <div className="flex gap-4 text-sm font-medium">


                        <button onClick={() => { window.location.href = '/login'; }} className="text-red-400 hover:text-red-300">Logout</button>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto p-6">
                {children}
            </main>
        </div>
    );
}
