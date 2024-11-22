// TournamentChat.tsx
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { collection, query, orderBy, limit, addDoc, serverTimestamp, FirestoreDataConverter, DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { Send } from 'lucide-react';

interface Message {
  id?: string;
  text: string;
  uid: string;
  displayName: string;
  createdAt: Date | null;
}

const messageConverter: FirestoreDataConverter<Message> = {
  toFirestore(message: Message): DocumentData {
    return { 
      text: message.text,
      uid: message.uid,
      displayName: message.displayName,
      createdAt: serverTimestamp()
    };
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): Message {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      text: data.text,
      uid: data.uid,
      displayName: data.displayName,
      createdAt: data.createdAt ? data.createdAt.toDate() : null
    };
  },
};

export default function TournamentChat({ tournamentId }: { tournamentId: string }) {
  const [user] = useAuthState(auth);
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const messagesRef = useMemo(() => {
    return collection(db, `tournaments/${tournamentId}/messages`).withConverter(messageConverter);
  }, [tournamentId]);

  const messagesQuery = useMemo(() => {
    return query(
      messagesRef,
      orderBy('createdAt', 'asc'),
      limit(100)
    );
  }, [messagesRef]);

  const [messages] = useCollectionData(messagesQuery);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    try {
      await addDoc(messagesRef, {
        text: message.trim(),
        uid: user.uid,
        displayName: user.displayName || 'Anonymous',
        createdAt: serverTimestamp()
      });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-[400px]">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold">Tournament Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages?.map((msg: Message, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2 ${
              msg.uid === user?.uid ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <div
              className={`max-w-[70%] p-2 rounded-lg ${
                msg.uid === user?.uid
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <p className="text-xs text-gray-300 mb-1">
                {msg.displayName}
                {msg.createdAt && ` • ${msg.createdAt.toLocaleTimeString()}`}
              </p>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}