import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // For now, return instructions for manual sync
    // This avoids Prisma import issues
    return NextResponse.json(
      { 
        message: 'User sync requires manual intervention',
        instruction: 'Please run the SQL command in your Supabase database to create the missing user record',
        sqlCommand: `INSERT INTO "User" (
          id, 
          email, 
          "firstName", 
          "lastName", 
          "memberType", 
          "contactNumber", 
          "studentVerificationStatus", 
          "createdAt", 
          "updatedAt"
        ) VALUES (
          '${userId}',
          'usamajawad125@gmail.com',
          'Usama',
          'Jawad',
          'STUDENT',
          '+923000080216',
          'PENDING',
          NOW(),
          NOW()
        ) ON CONFLICT (id) DO NOTHING;`
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Error in sync-user API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
