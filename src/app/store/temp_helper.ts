
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
