import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import Navigation from './components/Navigation';
import GameBoard from './components/GameBoard';
import Stats from './components/Stats';
import GameLobby from './components/GameLobby';
import TournamentList from './components/TournamentList';
import Chat from './components/Chat';
import PrivateGame from './components/PrivateGame';
import TournamentLobby from './components/TournamentLobby';

interface TournamentLobbyProps {
  tournamentId: string;
}

interface PrivateGameProps {
  gameId: string;
}

const GameRoute: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  return <PrivateGame gameId={gameId!} />;
};

const TournamentRoute: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  return <TournamentLobby tournamentId={tournamentId!} />;
};

function App() {
  const [user] = useAuthState(auth);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/game/:gameId" element={<GameRoute />} />
            <Route path="/tournament/:tournamentId" element={<TournamentRoute />} />
            <Route path="/tournaments" element={<TournamentList />} />
            <Route path="/" element={
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {!user ? (
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                      <h2 className="text-2xl font-bold mb-4">Welcome to iChess</h2>
                      <p className="text-gray-300">
                        Play chess online, improve your skills, and join our community of chess enthusiasts.
                      </p>
                    </div>
                  ) : (
                    <>
                      <GameLobby />
                      <Stats />
                      <TournamentList />
                    </>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <GameBoard mode={null} />
                  </div>
                  {user && <Chat />}
                </div>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;