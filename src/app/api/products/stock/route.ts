import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Product } from '@/models/schema';

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const { productId, quantity } = await req.json();

        if (!productId || !quantity || quantity <= 0) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $inc: { stock: quantity } },
            { new: true }
        );

        if (!updatedProduct) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, product: updatedProduct });

    } catch (error) {
        console.error('Stock Update Error:', error);
        return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
    }
}
