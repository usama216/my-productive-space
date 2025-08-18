import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const userData = await request.json();

    // handling the data (step 1: save to database, step 2:validate, etc.)

    // final response:
    return NextResponse.json({ message: 'User created', data: userData });
}