import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getAuthSession, type AuthSession } from '../data/hrStore';

interface ProtectedRouteProps {
  children?: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [session, setSession] = useState<AuthSession | null>(() => getAuthSession());

  useEffect(() => {
    const handleAuthChange = () => {
      setSession(getAuthSession());
    };

    window.addEventListener('neuracloud-hr-auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('neuracloud-hr-auth-change', handleAuthChange);
    };
  }, []);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
