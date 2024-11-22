import React, { useState, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { doc, updateDoc, arrayUnion, onSnapshot } from 'firebase/firestore';
import { Send } from 'lucide-react';

interface Message {
  uid: string;
  text: string;
  timestamp: Date;
  username: string;
}

interface PrivateGameChatProps {
  gameId: string;
}

export default function PrivateGameChat({ gameId }: PrivateGameChatProps) {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'private_games', gameId),
      (doc) => {
        if (doc.exists()) {
          setMessages(doc.data().messages || []);
        }
      }
    );

    return () => unsubscribe();
  }, [gameId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    const message: Message = {
      uid: user.uid,
      text: newMessage.trim(),
      timestamp: new Date(),
      username: user.displayName || 'Anonymous',
    };

    try {
      await updateDoc(doc(db, 'private_games', gameId), {
        messages: arrayUnion(message),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg h-[400px] flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold">Game Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2 ${
              msg.uid === user?.uid ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.uid === user?.uid
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <p className="text-xs text-gray-300 mb-1">{msg.username}</p>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}