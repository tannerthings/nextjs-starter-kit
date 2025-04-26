// pages/attendees/index.tsx
import { RoleGuard } from '@/components/auth/RoleGuard';
import AttendeesPage from '@/components/attendees/AttendeesPage';

export default function AttendeesPageWrapper() {
  return (
    <RoleGuard allowedRoles={['admin', 'organizer']}>
      <AttendeesPage />
    </RoleGuard>
  );
}