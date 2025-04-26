// app/api/email/order-confirmation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmation } from '@/lib/email';

// API endpoint for sending order confirmation emails
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
      'orderNumber', 'customerEmail', 'customerName', 
      'eventName', 'eventDate', 'eventLocation', 
      'attendees', 'totalAmount', 'orderId', 'eventId'
    ];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    const result = await sendOrderConfirmation(data);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error sending order confirmation email:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}