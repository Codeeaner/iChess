import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { Loader2 } from 'lucide-react';

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in</h2>
          <p className="text-gray-600">You must be signed in to access this feature.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}