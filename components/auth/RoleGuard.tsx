// components/auth/RoleGuard.tsx
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useUser } from '@/lib/useUser';

type RoleGuardProps = {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackUrl?: string;
};

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallbackUrl = '/unauthorized' 
}: RoleGuardProps) {
  const router = useRouter();
  const { isLoaded, isSignedIn, roles } = useUser();
  
  useEffect(() => {
    if (isLoaded) {
      // If not signed in, redirect to sign-in
      if (!isSignedIn) {
        router.push('/sign-in');
        return;
      }
      
      // If signed in but doesn't have required roles, redirect to fallback
      const hasRequiredRole = roles.some(role => allowedRoles.includes(role));
      if (!hasRequiredRole) {
        router.push(fallbackUrl);
      }
    }
  }, [isLoaded, isSignedIn, roles, allowedRoles, router, fallbackUrl]);
  
  // Show loading state while checking
  if (!isLoaded || !isSignedIn) {
    return (
      
        <div>Loading......</div>
      
    );
  }
  
  // Check if user has required role
  const hasRequiredRole = roles.some(role => allowedRoles.includes(role));
  if (!hasRequiredRole) return null;
  
  // If all checks pass, render children
  return <>{children}</>;
}