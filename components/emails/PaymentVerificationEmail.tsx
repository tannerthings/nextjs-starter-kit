// components/emails/PaymentVerificationEmail.tsx
import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
  Section,
  Row,
  Column,
  Hr,
  Button,
} from '@react-email/components';

interface PaymentVerificationEmailProps {
  registration: {
    firstName: string;
    lastName: string;
    email: string;
    ticketTypeId: string;
    event?: {
      name: string;
      venue: string;
      startDate: string;
      endDate: string;
    };
    paymentAmount: number;
    paymentMethod: string;
    paymentConfirmation: string;
    verificationDate?: string;
    verifiedBy?: string;
  };
}

export const PaymentVerificationEmail: React.FC<PaymentVerificationEmailProps> = ({
  registration,
}) => {
  const {
    firstName,
    lastName,
    ticketTypeId,
    event,
    paymentAmount,
    paymentMethod,
    paymentConfirmation,
    verificationDate,
    verifiedBy,
  } = registration;

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formattedVerificationDate = verificationDate 
    ? new Date(verificationDate).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'N/A';

  const formattedStartDate = event?.startDate ? formatDate(event.startDate) : 'TBD';
  
  // Format payment method
  const paymentMethodMap = {
    'paypal': 'PayPal (Friends & Family)',
    'zelle': 'Zelle',
  };
  
  const paymentMethodDisplay = paymentMethodMap[paymentMethod as keyof typeof paymentMethodMap] || paymentMethod;

  // Preview text
  const previewText = `Your payment for ${event?.name || 'our event'} has been verified!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Img
              src="https://yourdomain.com/logo.png"
              alt="Event Logo"
              width="150"
              height="50"
            />
          </Section>
          
          <Section style={content}>
            <Heading style={heading}>Payment Verified</Heading>
            
            <Section style={successBox}>
              <Img
                src="https://yourdomain.com/check-circle.png"
                alt="Success"
                width="48"
                height="48"
                style={successIcon}
              />
              <Text style={successText}>
                Your payment has been verified successfully
              </Text>
            </Section>
            
            <Text style={paragraph}>
              Hello {firstName} {lastName},
            </Text>
            
            <Text style={paragraph}>
              Great news! Your payment for {event?.name || 'our event'} has been verified and your registration is now complete. We&aposre excited to have you join us!
            </Text>
            
            <Section style={eventDetails}>
              <Heading as="h2" style={subheading}>
                Event Details
              </Heading>
              
              <Row>
                <Column>
                  <Text style={label}>Event:</Text>
                </Column>
                <Column>
                  <Text style={value}>{event?.name || 'TBD'}</Text>
                </Column>
              </Row>
              
              <Row>
                <Column>
                  <Text style={label}>Date:</Text>
                </Column>
                <Column>
                  <Text style={value}>{formattedStartDate}</Text>
                </Column>
              </Row>
              
              <Row>
                <Column>
                  <Text style={label}>Location:</Text>
                </Column>
                <Column>
                  <Text style={value}>{event?.venue || 'TBD'}</Text>
                </Column>
              </Row>
              
              <Row>
                <Column>
                  <Text style={label}>Ticket Type:</Text>
                </Column>
                <Column>
                  <Text style={value}>{ticketTypeId}</Text>
                </Column>
              </Row>
            </Section>
            
            <Hr style={divider} />
            
            <Section style={paymentDetails}>
              <Heading as="h2" style={subheading}>
                Payment Details
              </Heading>
              
              <Row>
                <Column>
                  <Text style={label}>Amount:</Text>
                </Column>
                <Column>
                  <Text style={value}>${paymentAmount.toFixed(2)}</Text>
                </Column>
              </Row>
              
              <Row>
                <Column>
                  <Text style={label}>Payment Method:</Text>
                </Column>
                <Column>
                  <Text style={value}>{paymentMethodDisplay}</Text>
                </Column>
              </Row>
              
              <Row>
                <Column>
                  <Text style={label}>Confirmation ID:</Text>
                </Column>
                <Column>
                  <Text style={value}>{paymentConfirmation}</Text>
                </Column>
              </Row>
              
              <Row>
                <Column>
                  <Text style={label}>Verified On:</Text>
                </Column>
                <Column>
                  <Text style={value}>{formattedVerificationDate}</Text>
                </Column>
              </Row>
              
              {verifiedBy && (
                <Row>
                  <Column>
                    <Text style={label}>Verified By:</Text>
                  </Column>
                  <Column>
                    <Text style={value}>{verifiedBy}</Text>
                  </Column>
                </Row>
              )}
            </Section>
            
            <Hr style={divider} />
            
            <Section style={ctaSection}>
              <Button
                href="https://yourdomain.com/event-portal/ticket"
                style={button}
              >
                View Your Ticket
              </Button>
              
              <Button
                href="https://yourdomain.com/event-portal/details"
                style={{
                  ...button,
                  backgroundColor: '#ffffff',
                  color: '#2563EB',
                  border: '1px solid #2563EB',
                }}
              >
                Event Details
              </Button>
            </Section>
            
            <Text style={paragraph}>
              If you have any questions or need assistance, please contact our support team at{' '}
              <Link href="mailto:support@yourdomain.com" style={link}>
                support@yourdomain.com
              </Link>
              .
            </Text>
            
            <Text style={paragraph}>
              We look forward to seeing you at the event!
            </Text>
            
            <Text style={signature}>
              Best regards,
              <br />
              The Event Team
            </Text>
          </Section>
          
          <Hr style={divider} />
          
          <Section style={footer}>
            <Text style={footerText}>
              © 2025 Your Organization. All rights reserved.
            </Text>
            <Text style={footerText}>
              123 Event Street, Suite 100, Arlington, MA 02474
            </Text>
            <Text style={footerLinks}>
              <Link href="https://yourdomain.com/privacy" style={link}>Privacy Policy</Link> •{' '}
              <Link href="https://yourdomain.com/terms" style={link}>Terms of Service</Link> •{' '}
              <Link href="https://yourdomain.com/unsubscribe" style={link}>Unsubscribe</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Email styles
const main = {
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const logo = {
  padding: '20px 0',
  textAlign: 'center' as const,
};

const content = {
  backgroundColor: '#ffffff',
  padding: '40px',
  borderRadius: '5px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#111827',
  textAlign: 'center' as const,
  margin: '0 0 30px',
};

const subheading = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#374151',
  margin: '0 0 15px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#6B7280',
  margin: '0 0 20px',
};

const successBox = {
  backgroundColor: '#ecfdf5',
  padding: '16px',
  borderRadius: '6px',
  textAlign: 'center' as const,
  margin: '0 0 30px',
};

const successIcon = {
  margin: '0 auto 10px',
  display: 'block',
};

const successText = {
  fontSize: '16px',
  color: '#047857',
  fontWeight: 'bold',
  margin: '0',
};

const eventDetails = {
  marginBottom: '30px',
};

const paymentDetails = {
  marginBottom: '30px',
};

const label = {
  fontSize: '14px',
  color: '#6B7280',
  marginBottom: '8px',
  padding: '5px 0',
};

const value = {
  fontSize: '14px',
  color: '#111827',
  fontWeight: 'medium',
  marginBottom: '8px',
  padding: '5px 0',
};

const divider = {
  borderColor: '#E5E7EB',
  margin: '20px 0',
};

const ctaSection = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#2563EB',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '12px 20px',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '0 10px 10px 0',
};

const link = {
  color: '#2563EB',
  textDecoration: 'underline',
};

const signature = {
  fontSize: '16px',
  color: '#6B7280',
  margin: '30px 0 0',
};

const footer = {
  padding: '20px 0',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '12px',
  color: '#9CA3AF',
  margin: '5px 0',
};

const footerLinks = {
  fontSize: '12px',
  color: '#9CA3AF',
  margin: '15px 0 0',
};

export default PaymentVerificationEmail;