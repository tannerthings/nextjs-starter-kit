// emails/components/Layout.tsx
import React from 'react';
import { 
  Html, 
  Head, 
  Body, 
  Container, 
  Heading, 
  Text, 
  Preview 
} from '@react-email/components';

interface LayoutProps {
  previewText: string;
  heading: string;
  children: React.ReactNode;
}

export const Layout = ({ previewText, heading, children }: LayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{
        backgroundColor: '#f6f9fc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
      }}>
        <Container style={{
          backgroundColor: '#ffffff',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
          marginTop: '40px',
          marginBottom: '40px',
          padding: '20px 40px',
        }}>
          <Heading>{heading}</Heading>
          {children}
        </Container>
      </Body>
    </Html>
  );
};