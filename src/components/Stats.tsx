import React from 'react';

export default function Stats() {
  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Quick Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Rating</p>
          <p className="text-2xl font-bold">1200</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-400">Games Played</p>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}