export type PriceAnalysis = {
    finalPrice: number;
    govtPrice: number;
    competitorPrice: number;
    savings: number;
    isProfitable: boolean;
};

// Expanded Real-time Price Database (Mock)
const GOVT_BASE_PRICES: Record<string, number> = {
    // Vegetables
    'Tomato (Local)': 22,
    'Onion (Kurnool)': 28,
    'Potato (Agra)': 18,
    'Green Chilli': 35,
    'Brinjal (Round)': 24,
    'Ladies Finger': 30,
    'Carrot (Ooty)': 40,
    'Capsicum (Green)': 45,
    'Bitter Gourd': 32,
    'Bottle Gourd': 15,
    'Beetroot': 28,
    'Beans (French)': 42,
    'Cauliflower': 25,
    'Cabbage': 18,
    'Drumstick': 50,
    'Cucumber': 14,

    // Greens (Leafy Vegetables)
    'Coriander': 8,
    'Spinach (Palak)': 12,
    'Mint (Pudina)': 10,
    'Curry Leaves': 5,
    'Methi (Fenugreek)': 15,
    'Amaranthus (Thotakura)': 10,
    'Sorrel Leaves (Gongura)': 12,
    'Spring Onion': 18,

    // Fruits
    'Banana (Chakkarakeli)': 45,
    'Papaya': 25,
    'Apple (Royal Gala)': 160,
    'Pomegranate': 110,
    'Guava': 35,
    'Orange (Nagpur)': 55,
    'Watermelon': 18,
    'Muskmelon': 30,
    'Pineapple': 40,
    'Mango (Banganapalli)': 65,
    'Grapes (Black)': 70,
    'Sapota': 30,
    'Custard Apple': 50,
    'Dragon Fruit': 120,

    // Pulses & Grains
    'Toor Dal': 140,
    'Moong Dal': 110,
    'Urad Dal': 130,
    'Chana Dal': 85,
    'Masoor Dal': 95,
    'Groundnut': 120,
    'Rice (Sona Masoori)': 52,
    'Basmati Rice': 90,
    'Wheat Flour (Atta)': 38,
};

const COMPETITOR_PRICES: Record<string, number> = {
    // Vegetables
    'Tomato (Local)': 48,
    'Onion (Kurnool)': 55,
    'Potato (Agra)': 36,
    'Green Chilli': 80,
    'Brinjal (Round)': 45,
    'Ladies Finger': 58,
    'Carrot (Ooty)': 75,
    'Capsicum (Green)': 80,
    'Bitter Gourd': 60,
    'Bottle Gourd': 35,
    'Beetroot': 55,
    'Beans (French)': 85,
    'Cauliflower': 50,
    'Cabbage': 38,
    'Drumstick': 90,
    'Cucumber': 30,

    // Greens
    'Coriander': 25,
    'Spinach (Palak)': 30,
    'Mint (Pudina)': 20,
    'Curry Leaves': 15,
    'Methi (Fenugreek)': 35,
    'Amaranthus (Thotakura)': 25,
    'Sorrel Leaves (Gongura)': 30,
    'Spring Onion': 40,

    // Fruits
    'Banana (Chakkarakeli)': 75,
    'Papaya': 50,
    'Apple (Royal Gala)': 240,
    'Pomegranate': 180,
    'Guava': 60,
    'Orange (Nagpur)': 90,
    'Watermelon': 35,
    'Muskmelon': 60,
    'Pineapple': 75,
    'Mango (Banganapalli)': 110,
    'Grapes (Black)': 120,
    'Sapota': 60,
    'Custard Apple': 90,
    'Dragon Fruit': 199,

    // Pulses & Grains
    'Toor Dal': 195,
    'Moong Dal': 160,
    'Urad Dal': 185,
    'Chana Dal': 120,
    'Masoor Dal': 140,
    'Groundnut': 180,
    'Rice (Sona Masoori)': 75,
    'Basmati Rice': 140,
    'Wheat Flour (Atta)': 55,
};

export const PricingService = {
    calculateSmartPrice: (itemName: string): PriceAnalysis => {
        const govtPrice = GOVT_BASE_PRICES[itemName] || 50; // Fallback
        const competitorPrice = COMPETITOR_PRICES[itemName] || (govtPrice * 2.1); // Assumed high markup in market

        // Logic: Rythu Bazar price is usually Govt Price + small margin
        // We want to be SIGNIFICANTLY cheaper than competitors
        const maxAllowedPrice = Math.floor(competitorPrice * 0.75); // Should be at least 25% cheaper

        let rythuPrice = Math.ceil(govtPrice * 1.15); // Base price + 15% margin for farmer

        // If calculated rythu price > maxAllowed (rare), cap it
        if (rythuPrice > maxAllowedPrice) {
            rythuPrice = maxAllowedPrice;
        }

        // Ensure we never go below govt price
        if (rythuPrice < govtPrice) {
            rythuPrice = govtPrice;
        }

        return {
            finalPrice: rythuPrice,
            govtPrice,
            competitorPrice,
            savings: competitorPrice - rythuPrice,
            isProfitable: rythuPrice >= govtPrice
        };
    }
};
