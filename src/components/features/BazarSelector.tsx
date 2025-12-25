"use client";

import { useState } from "react";
import { MapPin, Search, ChevronRight } from "lucide-react";
import { MOCK_BAZARS, MOCK_DISTRICTS } from "@/lib/data";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function BazarSelector() {
    const { selectBazar } = useAuth();
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [search, setSearch] = useState('');

    const filteredBazars = MOCK_BAZARS.filter(b => {
        const matchesDistrict = selectedDistrict ? b.district === selectedDistrict : true;
        const matchesSearch = b.name.toLowerCase().includes(search.toLowerCase()) ||
            b.mandal.toLowerCase().includes(search.toLowerCase());
        return matchesDistrict && matchesSearch;
    });

    return (
        <div className="p-6 h-full flex flex-col items-center justify-center bg-green-50/50">
            <div className="w-full max-w-sm space-y-6">

                <div className="text-center space-y-2 mb-8">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Select Rythu Bazar</h2>
                    <p className="text-sm text-gray-500">Choose your nearest government market to see today's fixed prices.</p>
                </div>

                {/* Filters */}
                <div className="space-y-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by area (e.g. Mehdipatnam)"
                            className="w-full pl-9 pr-4 py-2 border border-input rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setSelectedDistrict('')}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                                selectedDistrict === ''
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white text-gray-600 border-gray-200 hover:border-primary/50"
                            )}
                        >
                            All Districts
                        </button>
                        {MOCK_DISTRICTS.map(d => (
                            <button
                                key={d}
                                onClick={() => setSelectedDistrict(d)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border",
                                    selectedDistrict === d
                                        ? "bg-primary text-white border-primary"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-primary/50"
                                )}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
                    {filteredBazars.map((bazar) => (
                        <button
                            key={bazar.id}
                            onClick={() => selectBazar(bazar.id)}
                            disabled={bazar.status === 'Closed'}
                            className={cn(
                                "w-full text-left bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden",
                                bazar.status === 'Closed' && "opacity-60 grayscale cursor-not-allowed"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{bazar.name}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">{bazar.mandal}, {bazar.district}</p>
                                </div>
                                <span className={cn(
                                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                    bazar.status === 'Open' ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}>
                                    {bazar.status}
                                </span>
                            </div>
                            {bazar.status === 'Open' && (
                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                            )}
                        </button>
                    ))}

                    {filteredBazars.length === 0 && (
                        <p className="text-center text-xs text-gray-400 py-4">No markets found in this area.</p>
                    )}
                </div>

            </div>
        </div>
    );
}
