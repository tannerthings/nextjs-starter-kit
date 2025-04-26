// app/api/email/admin-notification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendAdminNotification } from '@/lib/email';

// API endpoint for sending admin notification emails
export async function POST(req: NextRequest) {
  // Validate API key
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.EMAIL_API_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const data = await req.json();
    
    // Validate required fields
    const requiredFields = [
      'orderNumber', 'customerEmail', 'eventName',
      'ticketSummary', 'totalAmount', 'adminEmails'
    ];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    const result = await sendAdminNotification(data);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error sending admin notification email:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}