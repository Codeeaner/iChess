import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { GiChessKing } from 'react-icons/gi';
import { FiLogIn, FiLogOut } from 'react-icons/fi';

export default function Navigation() {
  const [user] = useAuthState(auth);

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <GiChessKing className="w-8 h-8 text-blue-400" />
            <span className="ml-2 text-xl font-bold text-white">iChess</span>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="hidden md:flex items-center space-x-4">
                  <a href="/play" className="text-gray-300 hover:text-white px-3 py-2">
                    Play
                  </a>
                  <a href="/puzzles" className="text-gray-300 hover:text-white px-3 py-2">
                    Puzzles
                  </a>
                  <a href="/tournaments" className="text-gray-300 hover:text-white px-3 py-2">
                    Tournaments
                  </a>
                </div>
                <div className="flex items-center space-x-4">
                  <img
                    src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.uid}
                    alt="avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  <button
                    onClick={() => signOut(auth)}
                    className="flex items-center px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition-colors text-white"
                  >
                    <FiLogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="flex items-center px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors text-white"
              >
                <FiLogIn className="w-4 h-4 mr-2" />
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}