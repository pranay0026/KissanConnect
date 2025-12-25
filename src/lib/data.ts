export type Bazar = {
    id: string;
    name: string;
    district: string;
    mandal: string;
    image: string;
    status: 'Open' | 'Closed';
};

export type Product = {
    id: string;
    name: string;
    category: string;
    price: number; // Price per Kg/Unit
    unit: string;
    image: string;
    available: boolean;
    stock?: number;
};

export const MOCK_DISTRICTS = ['Visakhapatnam', 'Krishna', 'Guntur', 'West Godavari', 'Chittoor', 'Nellore'];

export const MOCK_BAZARS: Bazar[] = [
    { id: '1', name: 'MVP Colony Rythu Bazar', district: 'Visakhapatnam', mandal: 'MVP Colony', image: '/images/mvp.jpg', status: 'Open' },
    { id: '2', name: 'Seethammadhara Rythu Bazar', district: 'Visakhapatnam', mandal: 'Seethammadhara', image: '/images/seethamma.jpg', status: 'Open' },
    { id: '3', name: 'Swaraj Maidan Rythu Bazar', district: 'Krishna', mandal: 'Vijayawada', image: '/images/swaraj.jpg', status: 'Open' },
    { id: '4', name: 'Patamata Rythu Bazar', district: 'Krishna', mandal: 'Vijayawada', image: '/images/patamata.jpg', status: 'Open' },
    { id: '5', name: 'Chuttugunta Rythu Bazar', district: 'Guntur', mandal: 'Guntur', image: '/images/chuttugunta.jpg', status: 'Open' },
    { id: '8', name: 'Eluru Rythu Bazar', district: 'West Godavari', mandal: 'Eluru', image: '/images/eluru.jpg', status: 'Open' },
    { id: '9', name: 'Bhimavaram Rythu Bazar', district: 'West Godavari', mandal: 'Bhimavaram', image: '/images/bhimavaram.jpg', status: 'Open' },
    { id: '10', name: 'Tanuku Rythu Bazar', district: 'West Godavari', mandal: 'Tanuku', image: '/images/tanuku.jpg', status: 'Open' },
    { id: '11', name: 'Tadepalligudem Rythu Bazar', district: 'West Godavari', mandal: 'Tadepalligudem', image: '/images/tpg.jpg', status: 'Open' },
    { id: '6', name: 'Tirupati Rythu Bazar', district: 'Chittoor', mandal: 'Tirupati', image: '/images/tirupati.jpg', status: 'Open' },
    { id: '7', name: 'Kancharapalem Rythu Bazar', district: 'Visakhapatnam', mandal: 'Kancharapalem', image: '/images/kanch.jpg', status: 'Closed' },
];

export const MOCK_PRODUCTS: Product[] = [
    // Vegetables
    { id: '101', name: 'Tomato (Local)', category: 'Vegetables', price: 24, unit: 'kg', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80', available: true, stock: 150 },
    { id: '102', name: 'Onion (Kurnool)', category: 'Vegetables', price: 30, unit: 'kg', image: 'https://images.unsplash.com/photo-1620574387735-3624d75b2dbc?auto=format&fit=crop&w=400&q=80', available: true, stock: 200 },
    { id: '103', name: 'Potato (Agra)', category: 'Vegetables', price: 20, unit: 'kg', image: 'https://images.unsplash.com/photo-1518977676651-b471c912371b?auto=format&fit=crop&w=400&q=80', available: true, stock: 300 },
    { id: '104', name: 'Green Chilli', category: 'Vegetables', price: 40, unit: 'kg', image: 'https://images.unsplash.com/photo-1601648764658-cf37e8c07b70?auto=format&fit=crop&w=400&q=80', available: true, stock: 50 },
    { id: '105', name: 'Brinjal (Purple Round)', category: 'Vegetables', price: 28, unit: 'kg', image: 'https://images.unsplash.com/photo-1664654924765-4f475e533c64?auto=format&fit=crop&w=400&q=80', available: true, stock: 80 },
    { id: '106', name: 'Ladies Finger', category: 'Vegetables', price: 35, unit: 'kg', image: 'https://images.unsplash.com/photo-1637408754512-0761619859fa?auto=format&fit=crop&w=400&q=80', available: true, stock: 60 },
    { id: '107', name: 'Carrot (Ooty)', category: 'Vegetables', price: 50, unit: 'kg', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=400&q=80', available: true, stock: 100 },
    { id: '108', name: 'Cauliflower', category: 'Vegetables', price: 30, unit: 'piece', image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=400&q=80', available: true, stock: 40 },
    { id: '109', name: 'Cabbage', category: 'Vegetables', price: 20, unit: 'piece', image: 'https://images.unsplash.com/photo-1627329156066-608f1b63510c?auto=format&fit=crop&w=400&q=80', available: true, stock: 50 },
    { id: '110', name: 'Bottle Gourd', category: 'Vegetables', price: 15, unit: 'piece', image: 'https://images.unsplash.com/photo-1686675003310-85f0962b9213?auto=format&fit=crop&w=400&q=80', available: true, stock: 30 },
    { id: '111', name: 'Bitter Gourd', category: 'Vegetables', price: 32, unit: 'kg', image: 'https://plus.unsplash.com/premium_photo-1675237626068-de572f7e9145?auto=format&fit=crop&w=400&q=80', available: true, stock: 40 },
    { id: '112', name: 'Ridge Gourd', category: 'Vegetables', price: 38, unit: 'kg', image: 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=400&q=80', available: true, stock: 25 },
    { id: '113', name: 'Capsicum', category: 'Vegetables', price: 45, unit: 'kg', image: 'https://images.unsplash.com/photo-1563565375-f3fdf5d6c465?auto=format&fit=crop&w=400&q=80', available: true, stock: 45 },
    { id: '114', name: 'Drumstick', category: 'Vegetables', price: 10, unit: 'piece', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8e27r2Lg5k_T8t8aZqE7c6q8u9w0&s', available: true, stock: 100 },
    { id: '115', name: 'Cucumber', category: 'Vegetables', price: 20, unit: 'kg', image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&w=400&q=80', available: true, stock: 60 },

    // Greens
    { id: '201', name: 'Coriander', category: 'Greens', price: 10, unit: 'bunch', image: 'https://images.unsplash.com/photo-1582035905333-e65b7968595a?auto=format&fit=crop&w=400&q=80', available: true, stock: 200 },
    { id: '202', name: 'Spinach (Palak)', category: 'Greens', price: 15, unit: 'bunch', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80', available: true, stock: 150 },
    { id: '203', name: 'Mint (Pudina)', category: 'Greens', price: 8, unit: 'bunch', image: 'https://images.unsplash.com/photo-1628556270448-4d4e3e4e9f9c?auto=format&fit=crop&w=400&q=80', available: true, stock: 100 },
    { id: '204', name: 'Curry Leaves', category: 'Greens', price: 5, unit: 'bunch', image: 'https://images.unsplash.com/photo-1615485925763-867862f80877?auto=format&fit=crop&w=400&q=80', available: true, stock: 300 },
    { id: '205', name: 'Methi (Fenugreek)', category: 'Greens', price: 12, unit: 'bunch', image: 'https://images.unsplash.com/photo-1600850022064-500b5220c5d5?auto=format&fit=crop&w=400&q=80', available: true, stock: 80 },

    // Fruits
    { id: '301', name: 'Banana (Chakkarakeli)', category: 'Fruits', price: 50, unit: 'dozen', image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=400&q=80', available: true, stock: 50 },
    { id: '302', name: 'Papaya', category: 'Fruits', price: 30, unit: 'kg', image: 'https://images.unsplash.com/photo-1517260739837-e07e7c883e69?auto=format&fit=crop&w=400&q=80', available: true, stock: 40 },
    { id: '303', name: 'Watermelon', category: 'Fruits', price: 20, unit: 'kg', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80', available: true, stock: 20 },
    { id: '304', name: 'Pomegranate', category: 'Fruits', price: 120, unit: 'kg', image: 'https://images.unsplash.com/photo-1552664530-01053a483a99?auto=format&fit=crop&w=400&q=80', available: true, stock: 25 },
    { id: '305', name: 'Guava', category: 'Fruits', price: 40, unit: 'kg', image: 'https://images.unsplash.com/photo-1536510344784-b46e8ad71921?auto=format&fit=crop&w=400&q=80', available: true, stock: 35 },
    { id: '306', name: 'Mango (Banginapalli)', category: 'Fruits', price: 60, unit: 'kg', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=400&q=80', available: true, stock: 0 }, // Out of stock example

    // Pulses (Dals in local terms)
    { id: '401', name: 'Red Gram (Kandi Pappu)', category: 'Pulses', price: 140, unit: 'kg', image: 'https://images.unsplash.com/photo-1585996877663-8d25439b1d9d?auto=format&fit=crop&w=400&q=80', available: true, stock: 500 },
    { id: '402', name: 'Green Gram (Pesara Pappu)', category: 'Pulses', price: 110, unit: 'kg', image: 'https://images.unsplash.com/photo-1610996839355-6b45a201c80f?auto=format&fit=crop&w=400&q=80', available: true, stock: 400 },
];
