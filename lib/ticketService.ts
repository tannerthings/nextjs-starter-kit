// src/ticketService.ts
import * as PDFLib from 'pdf-lib';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import { createCanvas } from 'canvas';

interface TicketData {
  eventName: string;
  customerName: string;
  ticketType: string;
  ticketQuantity: number;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  transactionId: string;
}

/**
 * Generates a PDF ticket for an event
 * @param data Ticket data
 * @returns Buffer containing the PDF data
 */
export async function generateTicketPdf(data: TicketData): Promise<Buffer> {
  // Create a new PDF document
  const pdfDoc = await PDFLib.PDFDocument.create();
  
  // Set up fonts
  const fontBytes = await fetch('/fonts/Montserrat-Regular.ttf').then(res => res.arrayBuffer());
  const fontBytesTitle = await fetch('/fonts/Montserrat-Bold.ttf').then(res => res.arrayBuffer());
  const regularFont = await pdfDoc.embedFont(fontBytes);
  const titleFont = await pdfDoc.embedFont(fontBytesTitle);
  
  // Generate one ticket per quantity
  for (let i = 0; i < data.ticketQuantity; i++) {
    const page = pdfDoc.addPage([595.28, 339.84]); // A6 paper size in points
    const { width, height } = page.getSize();
    
    // Set up drawing parameters
    const margin = 40;
    const contentWidth = width - 2 * margin;
    
    // Draw event title
    page.drawText(data.eventName, {
      x: margin,
      y: height - margin - 20,
      size: 18,
      font: titleFont,
      color: PDFLib.rgb(0.2, 0.2, 0.2),
      maxWidth: contentWidth,
    });
    
    // Draw ticket type
    page.drawText(`Ticket Type: ${data.ticketType}`, {
      x: margin,
      y: height - margin - 50,
      size: 12,
      font: regularFont,
      color: PDFLib.rgb(0.3, 0.3, 0.3),
    });
    
    // Draw ticket number
    page.drawText(`Ticket ${i + 1} of ${data.ticketQuantity}`, {
      x: margin,
      y: height - margin - 70,
      size: 12,
      font: regularFont,
      color: PDFLib.rgb(0.3, 0.3, 0.3),
    });
    
    // Draw customer name
    page.drawText(`Attendee: ${data.customerName}`, {
      x: margin,
      y: height - margin - 90,
      size: 12,
      font: regularFont,
      color: PDFLib.rgb(0.3, 0.3, 0.3),
    });
    
    // Draw event date and time
    page.drawText(`Date: ${data.eventDate}`, {
      x: margin,
      y: height - margin - 110,
      size: 12,
      font: regularFont,
      color: PDFLib.rgb(0.3, 0.3, 0.3),
    });
    
    page.drawText(`Time: ${data.eventTime}`, {
      x: margin,
      y: height - margin - 130,
      size: 12,
      font: regularFont,
      color: PDFLib.rgb(0.3, 0.3, 0.3),
    });
    
    // Draw event location
    page.drawText(`Location: ${data.eventLocation}`, {
      x: margin,
      y: height - margin - 150,
      size: 12,
      font: regularFont,
      color: PDFLib.rgb(0.3, 0.3, 0.3),
      maxWidth: contentWidth,
    });
    
    // Draw transaction ID
    page.drawText(`Transaction ID: ${data.transactionId}`, {
      x: margin,
      y: margin + 40,
      size: 8,
      font: regularFont,
      color: PDFLib.rgb(0.5, 0.5, 0.5),
    });
    
    // Draw ticket issue date
    const issueDate = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    page.drawText(`Issued: ${issueDate}`, {
      x: margin,
      y: margin + 25,
      size: 8,
      font: regularFont,
      color: PDFLib.rgb(0.5, 0.5, 0.5),
    });
    
    // Generate QR code
    const qrCodeData = JSON.stringify({
      transactionId: data.transactionId,
      ticketNumber: i + 1,
      customerName: data.customerName,
      eventName: data.eventName,
      ticketType: data.ticketType,
    });
    
    const qrCodeCanvas = await generateQRCode(qrCodeData);
    const qrCodePng = await pdfDoc.embedPng(qrCodeCanvas.toBuffer());
    
    // Draw QR code
    const qrCodeSize = 100;
    page.drawImage(qrCodePng, {
      x: width - margin - qrCodeSize,
      y: height - margin - qrCodeSize - 30,
      width: qrCodeSize,
      height: qrCodeSize,
    });
    
    // Draw border
    const borderWidth = 1;
    const borderMargin = 15;
    
    page.drawRectangle({
      x: borderMargin,
      y: borderMargin,
      width: width - 2 * borderMargin,
      height: height - 2 * borderMargin,
      borderWidth,
      borderColor: PDFLib.rgb(0.8, 0.8, 0.8),
      borderOpacity: 0.5,
    });
    
    // Draw dashed line for tear-off
    const lineY = margin + 60;
    const dashLength = 5;
    const gapLength = 5;
    let currentX = borderMargin;
    
    while (currentX < width - borderMargin) {
      page.drawLine({
        start: { x: currentX, y: lineY },
        end: { x: currentX + dashLength, y: lineY },
        thickness: 1,
        color: PDFLib.rgb(0.7, 0.7, 0.7),
        opacity: 0.7,
      });
      
      currentX += dashLength + gapLength;
    }
    
    // Draw scissor icon
    page.drawText('✂', {
      x: borderMargin + 5,
      y: lineY + 5,
      size: 12,
      color: PDFLib.rgb(0.7, 0.7, 0.7),
    });
    
    // Draw footer text (manually centered)
    const footerText = 'Please present this ticket at the entrance. This ticket is non-transferable.';
    const footerTextWidth = regularFont.widthOfTextAtSize(footerText, 8);
    page.drawText(footerText, {
      x: width / 2 - footerTextWidth / 2,
      y: margin / 2,
      size: 8,
      font: regularFont,
      color: PDFLib.rgb(0.5, 0.5, 0.5),
    });
  }
  
  // Serialize the PDF to bytes
  const pdfBytes = await pdfDoc.save();
  
  // Convert to Buffer and return
  return Buffer.from(pdfBytes);
}

/**
 * Helper function to generate a QR code
 */
async function generateQRCode(data: string): Promise<any> {
  const canvas = createCanvas(200, 200);
  await QRCode.toCanvas(canvas, data, {
    errorCorrectionLevel: 'M',
    margin: 4,
    scale: 4,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });
  
  return canvas;
}

/**
 * Helper function to generate a unique ticket ID
 */
export function generateTicketId(transactionId: string, ticketNumber: number): string {
  return `${transactionId}-${ticketNumber.toString().padStart(3, '0')}`;
}