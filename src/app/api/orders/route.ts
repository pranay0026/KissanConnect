import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Order, Product, User } from '@/models/schema';
import { findBestPartner } from '@/lib/delivery';

// POST: Create New Order
export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        // const body = await req.json(); // Removed duplicate
        const { items, dropLocation, address } = body; // dropLocation: { lat, lng }

        // 1. Validate Stock for all items
        for (const item of items) {
            const product = await Product.findById(item.productId || item.id); // Handle potential ID mismatch if needed
            if (!product) {
                return NextResponse.json({ error: `Product not found: ${item.name}` }, { status: 404 });
            }
            if (product.stock < item.quantity) {
                return NextResponse.json({ error: `Insufficient stock for ${item.name}. Available: ${product.stock}` }, { status: 400 });
            }
        }

        // 2. Atomically Decrement and Create Order
        // Note: In a real production app with high concurrency, we'd use transactions or a two-phase commit.
        // For this MVP/size, we'll try to decrement one by one and rollback if fail (or just simpler optimistic locking via query).

        console.log('Processing Order Items:', items);

        const validItems = [];

        for (const item of items) {
            const productId = item.productId || item.id;

            // Try to decrement
            const updateResult = await Product.updateOne(
                { _id: productId, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } }
            );

            console.log(`Decrementing ${productId} by ${item.quantity}. Match/Mod: ${updateResult.matchedCount}/${updateResult.modifiedCount}`);

            if (updateResult.modifiedCount === 0) {
                // If we failed here, we should ideally rollback previous decrements.
                // For simplicity in this iteration, we will fail the request.
                // A better approach would be to use a Transaction (Session).

                // Rollback previously processed items
                for (const validItem of validItems) {
                    await Product.updateOne({ _id: validItem.productId }, { $inc: { stock: validItem.quantity } });
                }

                return NextResponse.json({ error: `Stock check failed for ${item.name} during processing. Please try again.` }, { status: 409 });
            }

            validItems.push({ productId, quantity: item.quantity });
        }

        // 3. Prepare Order Data with Location & Assignment
        let pickupLoc = null;
        let assignedPartner = null;
        let otp = null;
        let status = 'Placed';

        // Derive Pickup Location from the First Product's Farmer
        // Assumption: All items are from the same Bazar/Area for now.
        if (validItems.length > 0) {
            const firstProduct = await Product.findById(validItems[0].productId).populate('farmerId');
            if (firstProduct && firstProduct.farmerId && firstProduct.farmerId.currentLocation) {
                // Clone the farmer's location structure (GeoJSON)
                pickupLoc = {
                    type: 'Point',
                    coordinates: firstProduct.farmerId.currentLocation.coordinates
                };
            } else {
                // Fallback / Default Rythu Bazar Location if farmer location not set
                pickupLoc = {
                    type: 'Point',
                    coordinates: [78.4867, 17.3850] // HYD default
                };
            }

            // Automatic Assignment REMOVED - Switching to Pull Model
            // Orders wait in PENDING_ASSIGNMENT state for partners to pick them up.
            // FIX: Ensure ALL delivery orders go to PENDING_ASSIGNMENT, even if dropLocation (coords) is missing.
            // Manual address entry shouldn't block visibility.
            if (body.deliveryType === 'delivery') {
                status = 'PENDING_ASSIGNMENT';
                otp = Math.floor(1000 + Math.random() * 9000).toString();
            }
        }

        const orderData = {
            ...body,
            status,
            otp,
            deliveryPartnerId: undefined, // No partner assigned initially
            pickupLocation: pickupLoc,
            dropLocation: dropLocation ? {
                type: 'Point',
                coordinates: [dropLocation.lng, dropLocation.lat] // GeoJSON: [lng, lat]
            } : undefined
        };

        // 4. Create Order
        try {
            const newOrder = await Order.create(orderData);
            return NextResponse.json({ success: true, order: newOrder });
        } catch (createError) {
            // If order creation fails, rollback stock
            for (const validItem of validItems) {
                await Product.updateOne({ _id: validItem.productId }, { $inc: { stock: validItem.quantity } });
            }
            throw createError;
        }

    } catch (error) {
        console.error('Order Creation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// GET: Fetch Orders (e.g., by Customer ID)
export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const customerId = searchParams.get('customerId');

        if (!customerId) {
            return NextResponse.json({ error: 'Customer ID required' }, { status: 400 });
        }

        const orders = await Order.find({ customerId })
            .populate('deliveryPartnerId') // Populate to get Partner Location
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, orders });

    } catch (error) {
        console.error('Order Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT: Cancel Order
export async function PUT(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        if (order.status === 'Cancelled') {
            return NextResponse.json({ error: 'Order is already cancelled' }, { status: 400 });
        }

        // Time Check: 3 Minutes
        const created = new Date(order.createdAt).getTime();
        const now = Date.now();
        const diffMinutes = (now - created) / 1000 / 60;

        if (diffMinutes > 3) {
            return NextResponse.json({ error: 'Cancellation period (3 mins) expired. Please contact support.' }, { status: 400 });
        }

        // Proceed to Cancel
        order.status = 'Cancelled';
        await order.save();

        // Restore Stock
        // Note: Using a loop update for simplicity.
        for (const item of order.items) {
            if (item.productId && item.quantity) {
                await Product.updateOne(
                    { _id: item.productId },
                    { $inc: { stock: item.quantity } }
                );
            }
        }

        return NextResponse.json({ success: true, message: 'Order cancelled and stock restored.' });

    } catch (error) {
        console.error('Order Cancellation Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
