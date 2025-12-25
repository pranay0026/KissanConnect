import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/schema';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { name, identifier, password, role, address, bazar, vehicleType, serviceArea } = body;

        // Check if user exists
        const existing = await User.findOne({ identifier });
        if (existing) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // Create user
        const newUser = await User.create({
            name,
            identifier,
            password, // In production, hash this!
            role,
            address,
            bazar,
            vehicleType,
            serviceArea
        });

        return NextResponse.json({ success: true, user: { name: newUser.name, role: newUser.role, id: newUser._id } });

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
