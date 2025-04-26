// components/emails/RegistrationConfirmationEmail.tsx
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
  Column,
  Row,
  Hr,
  Button,
} from '@react-email/components';

interface RegistrationConfirmationEmailProps {
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
  };
}

export const RegistrationConfirmationEmail: React.FC<RegistrationConfirmationEmailProps> = ({
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

  const formattedStartDate = event?.startDate ? formatDate(event.startDate) : 'TBD';
  const formattedEndDate = event?.endDate ? formatDate(event.endDate) : 'TBD';
  
  // Format payment method
  const paymentMethodMap = {
    'paypal': 'PayPal (Friends & Family)',
    'zelle': 'Zelle',
  };
  
  const paymentMethodDisplay = paymentMethodMap[paymentMethod as keyof typeof paymentMethodMap] || paymentMethod;

  // Preview text
  const previewText = `Your registration for ${event?.name || 'our event'} has been confirmed!`;

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
            <Heading style={heading}>Registration Confirmed!</Heading>
            
            <Text style={paragraph}>
              Hello {firstName} {lastName},
            </Text>
            
            <Text style={paragraph}>
              Thank you for registering for {event?.name || 'our event'}. Your registration has been confirmed, and we&aposre excited to see you there!
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
                  <Text style={value}>
                    {formattedStartDate}
                    {event?.endDate !== event?.startDate && ` to ${formattedEndDate}`}
                  </Text>
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
                Payment Information
              </Heading>
              
              <Row>
                <Column>
                  <Text style={label}>Amount Paid:</Text>
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
                  <Text style={label}>Transaction ID:</Text>
                </Column>
                <Column>
                  <Text style={value}>{paymentConfirmation}</Text>
                </Column>
              </Row>
            </Section>
            
            <Section style={ctaContainer}>
              <Button
                href="https://yourdomain.com/my-tickets"
                style={button}
              >
                View My Tickets
              </Button>
            </Section>
            
            <Hr style={divider} />
            
            <Text style={footerText}>
              If you have any questions or need to make changes to your registration, 
              please contact us at <Link href="mailto:support@yourdomain.com">support@yourdomain.com</Link>.
            </Text>
            
            <Text style={footerText}>
              We look forward to seeing you at the event!
            </Text>
          </Section>
          
          <Section style={footer}>
            <Text style={footerText}>
              © 2025 Your Event Name. All rights reserved.
            </Text>
            <Text style={footerText}>
              123 Event Street, City, State 12345
            </Text>
            <Text style={footerSmall}>
              You&aposre receiving this email because you registered for {event?.name || 'our event'}.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default RegistrationConfirmationEmail;

// Styles
const main = {
  backgroundColor: '#f9f9f9',
  fontFamily: 'Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  width: '100%',
  maxWidth: '600px',
};

const logo = {
  padding: '20px 0',
  textAlign: 'center' as const,
};

const content = {
  backgroundColor: '#ffffff',
  borderRadius: '5px',
  padding: '20px',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '20px',
  textAlign: 'center' as const,
};

const subheading = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '15px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#4a4a4a',
  marginBottom: '10px',
};

const eventDetails = {
  marginTop: '20px',
  marginBottom: '20px',
};

const paymentDetails = {
  marginTop: '20px',
  marginBottom: '20px',
};

const label = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#4a4a4a',
  paddingBottom: '8px',
};

const value = {
  fontSize: '16px',
  color: '#4a4a4a',
  paddingBottom: '8px',
};

const divider = {
  borderColor: '#eaeaea',
  margin: '20px 0',
};

const ctaContainer = {
  textAlign: 'center' as const,
  marginTop: '30px',
  marginBottom: '30px',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
};

const footer = {
  textAlign: 'center' as const,
  marginTop: '20px',
  padding: '0 20px',
};

const footerText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#6b7280',
  marginBottom: '10px',
};

const footerSmall = {
  fontSize: '12px',
  lineHeight: '18px',
  color: '#9ca3af',
};