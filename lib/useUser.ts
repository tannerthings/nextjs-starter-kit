import { useUser as useClerkUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function useUser() {
  const { user, isLoaded, isSignedIn } = useClerkUser();
  const [roles, setRoles] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          // Fetch user roles from your backend
          // You can use user metadata or a separate API
          const response = await fetch('/api/user/roles', {
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setRoles(data.roles || []);
            setIsAdmin(data.roles.includes('admin'));
            setIsOrganizer(data.roles.includes('organizer'));
          }
        } catch (error) {
          console.error('Error fetching user roles:', error);
        }
      }
    };

    fetchUserRoles();
  }, [isLoaded, isSignedIn, user]);

  return {
    user,
    isLoaded,
    isSignedIn,
    roles,
    isAdmin,
    isOrganizer,
  };
}