import React, { useState, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { collection, query, orderBy, limit, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { FiSend } from 'react-icons/fi';

interface Message {
  text: string;
  uid: string;
  photoURL: string;
  displayName: string;
  createdAt: Date;
}

export default function Chat() {
  const [user] = useAuthState(auth);
  const messagesRef = collection(db, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(50));
  const [messages] = useCollectionData(q);
  const [formValue, setFormValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValue.trim() || !user) return;

    await addDoc(messagesRef, {
      text: formValue,
      uid: user.uid,
      photoURL: user.photoURL,
      displayName: user.displayName,
      createdAt: serverTimestamp(),
    });

    setFormValue('');
  };

  return (
    <div className="flex flex-col h-[400px] bg-gray-800 rounded-lg shadow-lg">
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold">Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2 ${
              msg.uid === user?.uid ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            <img
              src={msg.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.uid}`}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />
            <div
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.uid === user?.uid
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-100'
              }`}
            >
              <p className="text-xs text-gray-300 mb-1">{msg.displayName}</p>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t border-gray-700">
        <div className="flex space-x-2">
          <input
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!formValue.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}