import mongoose from 'mongoose';

// User Schema
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    identifier: { type: String, required: true, unique: true }, // Email or Phone
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'farmer', 'delivery'], required: true },
    address: { type: String }, // For Customers
    bazar: { type: String }, // For Farmers
    vehicleType: { type: String }, // For Delivery (bike/scooter)
    serviceArea: { type: String }, // For Delivery (Preferred Bazar)
    currentLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], index: '2dsphere' }, // [lng, lat]
        updatedAt: Date
    },
    status: { type: String, default: 'available' }, // available/busy
    createdAt: { type: Date, default: Date.now }
});

// Product Schema
const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true }, // Calculated Smart Price
    stock: { type: Number, required: true },
    itemUnit: { type: String, default: 'kg' },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    bazar: { type: String, required: true },
    savings: { type: Number },
    competitorPrice: { type: Number },
    updatedAt: { type: Date, default: Date.now }
});

// Order Schema
const OrderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{
        productId: { type: String },
        name: { type: String },
        price: { type: Number },
        quantity: { type: Number },
        total: { type: Number }
    }],
    totalAmount: { type: Number, required: true },
    deliveryType: { type: String, enum: ['pickup', 'delivery'], default: 'pickup' },
    address: { type: String },
    pickupLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] } // [lng, lat]
    },
    dropLocation: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] } // [lng, lat]
    },
    deliveryFee: { type: Number, default: 0 },
    status: { type: String, default: 'Placed' }, // Placed, Assigned, PickedUp, Delivered
    deliveryPartnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    otp: { type: String }, // Verification OTP
    bazar: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// Prevent overwrite on Hot Reload
export const User = mongoose.models.User || mongoose.model('User', UserSchema);
export const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
