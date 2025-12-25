import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Order, User } from '@/models/schema';

// GET: Fetch Available & Assigned Orders for Delivery Partner
export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const partnerId = searchParams.get('partnerId');
        const serviceArea = searchParams.get('serviceArea');
        const lat = searchParams.get('lat');
        const lng = searchParams.get('lng');

        if (!partnerId) {
            return NextResponse.json({ error: 'Partner ID Required' }, { status: 400 });
        }

        // 1. My Active Orders (Assigned to Me)
        const myOrders = await Order.find({ deliveryPartnerId: partnerId })
            .populate('customerId', 'name identifier address')
            .sort({ createdAt: -1 });

        // 2. Pending Orders Nearby OR in Service Area
        // We want orders that are:
        // - Delivery Type
        // - Pending Assignment
        // - Unassigned
        // - AND (Located near partner OR Matching Service Area)

        let availableOrders = [];
        const baseQuery: any = {
            deliveryType: 'delivery', // STRICTLY ONLY HOME DELIVERY
            status: 'PENDING_ASSIGNMENT',
            deliveryPartnerId: { $exists: false }
        };

        const orConditions = [];

        // Condition A: Service Area Match (Name Based)
        if (serviceArea) {
            orConditions.push({ bazar: { $regex: new RegExp(`^${serviceArea}$`, 'i') } });
        }

        // Condition B: Geospatial Match (Location Based)
        if (lat && lng) {
            orConditions.push({
                'pickupLocation.coordinates': {
                    $near: {
                        $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                        $maxDistance: 20000 // Increased to 20km for better coverage
                    }
                }
            });
        }

        if (orConditions.length > 0) {
            // If we have both, we ideally want $or. 
            // However, $near cannot be inside $or in strict MongoDB.
            // So we will prioritize Name Match if available, OR just do two queries merge?
            // Simpler approach for Mongoose without aggregation complexity:
            // Just use Service Area filter if provided (User's main requirement), 
            // and fallback to Geo if Service Area fails? 
            // No, the user wants "Logged in at same location -> see orders".

            // Let's rely on the explicit Service Area match as primary if it exists, 
            // because that's what fixes the "Tadepalligudem" issue definitively.
            // We can add distinct Geo results if needed, but 'bazar' match is the robust fix.

            if (serviceArea) {
                // Primary: Match by Name (Robust)
                availableOrders = await Order.find({ ...baseQuery, bazar: { $regex: new RegExp(`^${serviceArea}$`, 'i') } }).sort({ createdAt: 1 });
            } else if (lat && lng) {
                // Fallback: Match by GPS (if service area missing)
                availableOrders = await Order.find({
                    ...baseQuery,
                    'pickupLocation.coordinates': {
                        $near: {
                            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
                            $maxDistance: 20000
                        }
                    }
                }).sort({ createdAt: 1 });
            }
        } else {
            // Absolute Fallback (just show some pending deliveries)
            availableOrders = await Order.find(baseQuery).limit(10);
        }

        return NextResponse.json({ success: true, myOrders, availableOrders });

    } catch (error) {
        console.error('Delivery Fetch Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Accept Order or Update Status
export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { orderId, partnerId, action, otp } = body;
        // Actions: 'accept', 'picked_up', 'delivered'

        const order = await Order.findById(orderId);
        if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

        if (action === 'accept') {
            if (order.deliveryPartnerId) {
                return NextResponse.json({ error: 'Order already assigned' }, { status: 400 });
            }
            order.deliveryPartnerId = partnerId;
            order.status = 'Assigned';
            order.otp = Math.floor(1000 + Math.random() * 9000).toString(); // Generate 4-digit OTP
            await order.save();
            return NextResponse.json({ success: true, message: 'Order Accepted', order });
        }

        if (action === 'picked_up') {
            if (order.deliveryPartnerId.toString() !== partnerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
            order.status = 'PickedUp';
            await order.save();
            return NextResponse.json({ success: true, message: 'Order Picked Up', order });
        }

        if (action === 'delivered') {
            if (order.deliveryPartnerId.toString() !== partnerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

            // Verify OTP
            if (order.otp !== otp) {
                return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 });
            }

            order.status = 'Delivered';
            await order.save();
            // Mark partner as available again
            await User.findByIdAndUpdate(partnerId, { status: 'available' });
            return NextResponse.json({ success: true, message: 'Order Delivered Successfully', order });
        }

        if (action === 'cancel') {
            if (order.deliveryPartnerId.toString() !== partnerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

            order.status = 'Cancelled';
            await order.save();

            // Mark partner as available again since they are no longer delivering this
            await User.findByIdAndUpdate(partnerId, { status: 'available' });

            return NextResponse.json({ success: true, message: 'Order Cancelled', order });
        }

        return NextResponse.json({ error: 'Invalid Action' }, { status: 400 });

    } catch (error) {
        console.error('Delivery Update Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
