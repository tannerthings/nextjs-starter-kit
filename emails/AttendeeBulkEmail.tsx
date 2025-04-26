// emails/AttendeeBulkEmail.tsx
import React from 'react';
import { 
  Text, 
  Section, 
  Button, 
  Hr,
  Link
} from '@react-email/components';
import { Layout } from './components/Layout';

interface AttendeeBulkEmailProps {
  firstName: string;
  lastName: string;
  eventName: string;
  eventDate: string;
  subject: string;
  messageHtml: string;
  ctaText?: string;
  ctaUrl?: string;
}

export const AttendeeBulkEmail = ({
  firstName,
  lastName,
  eventName,
  eventDate,
  subject,
  messageHtml,
  ctaText,
  ctaUrl
}: AttendeeBulkEmailProps) => {
  return (
    <Layout 
      previewText={subject}
      heading={subject}
    >
      <Text>Hello {firstName} {lastName},</Text>
      
      <Section style={{ marginTop: '20px' }}>
        <div dangerouslySetInnerHTML={{ __html: messageHtml }} />
      </Section>
      
      {ctaText && ctaUrl && (
        <>
          <Hr style={{ margin: '24px 0' }} />
          
          <Section style={{ textAlign: 'center' }}>
            <Button 
              href={ctaUrl}
              style={{
                backgroundColor: '#5046e5',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              {ctaText}
            </Button>
          </Section>
        </>
      )}
      
      <Text style={{ fontSize: '14px', color: '#666', marginTop: '20px', textAlign: 'center' }}>
        This email is regarding your registration for {eventName} on {eventDate}.<br />
        If you have any questions, please contact our support team at{' '}
        <Link href="mailto:support@yourevent.com">support@yourevent.com</Link>
      </Text>
    </Layout>
  );
};

export default AttendeeBulkEmail;