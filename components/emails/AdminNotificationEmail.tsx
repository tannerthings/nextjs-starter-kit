// components/emails/AdminNotificationEmail.tsx
import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
  Row,
  Column,
  Hr,
  Button,
} from '@react-email/components';

interface AdminNotificationEmailProps {
  registration: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
    ticketTypeId: string;
    dietaryRestrictions?: string;
    paymentMethod: string;
    paymentEmail?: string;
    paymentPhone?: string;
    paymentConfirmation: string;
    paymentAmount: number;
    registrationDate: string;
    paymentStatus: string;
    paymentVerified?: boolean;
    event?: {
      name: string;
    };
  };
}

export const AdminNotificationEmail: React.FC<AdminNotificationEmailProps> = ({
  registration,
}) => {
  const {
    _id,
    firstName,
    lastName,
    email,
    phone,
    company,
    ticketTypeId,
    dietaryRestrictions,
    paymentMethod,
    paymentEmail,
    paymentPhone,
    paymentConfirmation,
    paymentAmount,
    registrationDate,
    paymentStatus,
    event,
  } = registration;

  // Format registration date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format payment details based on method
  const paymentMethodMap = {
    'paypal': 'PayPal (Friends & Family)',
    'zelle': 'Zelle',
  };
  
  const paymentMethodDisplay = paymentMethodMap[paymentMethod as keyof typeof paymentMethodMap] || paymentMethod;
  
  let paymentDetails = '';
  if (paymentMethod === 'paypal') {
    paymentDetails = `PayPal Email: ${paymentEmail || 'N/A'}`;
  } else if (paymentMethod === 'zelle') {
    paymentDetails = `Zelle Phone: ${paymentPhone || 'N/A'}`;
  }

  // Preview text
  const previewText = `New Registration: ${firstName} ${lastName} for ${event?.name || 'event'}`;

  // Admin dashboard link
  const adminDashboardUrl = `https://yourdomain.com/admin/registrations/${_id}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={contentBox}>
            <Heading style={heading}>New Registration Alert</Heading>
            
            <Text style={paragraph}>
              A new registration has been received for {event?.name || 'your event'}.
            </Text>
            
            <Section style={alertBox}>
              <Text style={alertText}>
                Action Required: Payment verification needed
              </Text>
            </Section>
            
            <Section style={detailsSection}>
              <Heading as="h2" style={subheading}>
                Attendee Details
              </Heading>
              
              <Row>
                <Column>
                  <Text style={label}>Name:</Text>
                </Column>
                <Column>
                  <Text style={value}>{firstName} {lastName}</Text>
                </Column>
              </Row>
              
              <Row>
                <Column>
                  <Text style={label}>Email:</Text>
                </Column>
                <Column>
                  <Text style={value}>{email}</Text>
                </Column>
              </Row>
              
              <Row>
                <Column>
                  <Text style={label}>Phone:</Text>
                </Column>
                <Column>
                  <Text style={value}>{phone}</Text>
                </Column>
              </Row>
              
              {company && (
                <Row>
                  <Column>
                    <Text style={label}>Company:</Text>
                  </Column>
                  <Column>
                    <Text style={value}>{company}</Text>
                  </Column>
                </Row>
              )}
              
              <Row>
                <Column>
                  <Text style={label}>Ticket Type:</Text>
                </Column>
                <Column>
                  <Text style={value}>{ticketTypeId}</Text>
                </Column>
              </Row>
              
              {dietaryRestrictions && (
                <Row>
                  <Column>
                    <Text style={label}>Dietary Restrictions:</Text>
                  </Column>
                  <Column>
                    <Text style={value}>{dietaryRestrictions}</Text>
                  </Column>
                </Row>
              )}
              
              <Row>
                <Column>
                  <Text style={label}>Registration Date:</Text>
                </Column>
                <Column>
                  <Text style={value}>{formatDate(registrationDate)}</Text>
                </Column>
              </Row>
            </Section>
            
            <Hr style={divider} />
            
            <Section style={detailsSection}>
              <Heading as="h2" style={subheading}>
                Payment Information
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
                  <Text style={label}>{paymentDetails.split(':')[0]}:</Text>
                </Column>
                <Column>
                  <Text style={value}>{paymentDetails.split(':')[1]}</Text>
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
              
              <Row>
                <Column>
                  <Text style={label}>Status:</Text>
                </Column>
                <Column>
                  <Text style={value}>{paymentStatus}</Text>
                </Column>
              </Row>
            </Section>
            
            <Section style={ctaContainer}>
              <Button
                href={adminDashboardUrl}
                style={button}
              >
                Verify Payment
              </Button>
            </Section>
            
            <Text style={footerText}>
              You&aposre receiving this email because you&aposre an administrator of the event registration system.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AdminNotificationEmail;

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

const contentBox = {
  backgroundColor: '#ffffff',
  borderRadius: '5px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
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
  marginBottom: '20px',
};

const alertBox = {
  backgroundColor: '#fff4e5',
  borderLeft: '4px solid #ff9800',
  padding: '10px 15px',
  marginBottom: '20px',
};

const alertText = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#b45309',
  margin: '0',
};

const detailsSection = {
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

const footerText = {
  fontSize: '14px',
  lineHeight: '20px',
  color: '#6b7280',
  marginTop: '20px',
  textAlign: 'center' as const,
};