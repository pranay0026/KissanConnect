import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Product } from '@/models/schema';

export async function GET(req: Request) {
    await dbConnect();
    // Fetch all products for now, filter in frontend or add query params later
    const products = await Product.find({}).sort({ updatedAt: -1 });
    return NextResponse.json({ success: true, products });
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { name, category, stock, price, savings, competitorPrice, bazar, image } = body;

        // Check if product exists in this bazar to prevent duplicates
        // Update existing stock if found (upsert behavior for stock, price, etc.)
        const product = await Product.findOneAndUpdate(
            { name, bazar }, // Find by Name + Bazar
            {
                $set: {
                    category,
                    price,
                    // stock removed from set
                    savings,
                    competitorPrice,
                    image: image || '✨',
                    updatedAt: new Date()
                },
                $inc: { stock: Number(stock) } // Increment stock
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, product });
    } catch (error) {
        console.error('Product Create Error:', error);
        return NextResponse.json({ error: 'Failed to add product' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
        }

        await Product.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Delete Failed' }, { status: 500 });
    }
}
