import { useAuth } from '@/contexts/auth';
import { type ReactNode } from 'react';

const ProtectedRoutes = ({children}: {children: ReactNode}) => {

  const {userData, setUserData} = useAuth();
  
  return (
    <div>
      {children}
    </div>
  )
}

export default ProtectedRoutes