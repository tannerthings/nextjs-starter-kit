// app/api/email/bulk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendBulkEmail } from '@/lib/email';

// API endpoint for sending bulk emails
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
      'recipients', 'subject', 'messageHtml', 
      'eventName', 'eventDate', 'eventId'
    ];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Limit batch size for safety
    const maxBatchSize = 500;
    if (data.recipients.length > maxBatchSize) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Batch size exceeds maximum of ${maxBatchSize} recipients` 
        },
        { status: 400 }
      );
    }
    
    const result = await sendBulkEmail(data);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error sending bulk emails:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}