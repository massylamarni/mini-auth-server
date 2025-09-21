import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb'; // Import the MongoDB connection utility

export async function GET(req) {
  try {
    const url = new URL(req.url);
    let timeStart = parseInt(url.searchParams.get('timeStart'), 10);
    let timeEnd = parseInt(url.searchParams.get('timeEnd'), 10);
    
    if (isNaN(timeStart) || isNaN(timeEnd)) {
      timeStart = new Date().setHours(0, 0, 0, 0);
      timeEnd = new Date().setHours(23, 59, 59, 999);
    }

    const db = await connectToDatabase(); // Connect to MongoDB
    const collection = db.collection('users');
    
    const records =  await collection.find({ createdAt: { $gte: new Date(timeStart), $lte: new Date(timeEnd) } }).sort({ createdAt: 1 }).toArray();
    return NextResponse.json(records);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
