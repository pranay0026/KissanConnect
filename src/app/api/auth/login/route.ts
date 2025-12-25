import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/schema';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { identifier, password, role } = body;

        // Find user
        const user = await User.findOne({ identifier, role }); // Strict role check (optional)

        if (!user || user.password !== password) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                bazar: user.bazar,
                address: user.address,
                vehicleType: user.vehicleType,
                serviceArea: user.serviceArea
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
