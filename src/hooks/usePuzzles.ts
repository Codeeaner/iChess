import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, limit, getDocs, doc, updateDoc, increment } from 'firebase/firestore';
import { Chess } from 'chess.js';

interface Puzzle {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  theme: string;
}

export function usePuzzles(userId: string) {
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [moveIndex, setMoveIndex] = useState(0);

  const fetchRandomPuzzle = async () => {
    setLoading(true);
    try {
      const puzzlesRef = collection(db, 'puzzles');
      const q = query(puzzlesRef, limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const puzzleData = snapshot.docs[0].data() as Puzzle;
        setCurrentPuzzle({ ...puzzleData, id: snapshot.docs[0].id });
        setMoveIndex(0);
      }
    } catch (error) {
      console.error('Error fetching puzzle:', error);
    }
    setLoading(false);
  };

  const checkMove = (move: string): boolean => {
    if (!currentPuzzle || moveIndex >= currentPuzzle.moves.length) return false;
    
    const isCorrect = move === currentPuzzle.moves[moveIndex];
    if (isCorrect) {
      setMoveIndex(moveIndex + 1);
      if (moveIndex + 1 === currentPuzzle.moves.length) {
        handlePuzzleComplete();
      }
    }
    return isCorrect;
  };

  const handlePuzzleComplete = async () => {
    if (!currentPuzzle) return;
    
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      puzzlesSolved: increment(1),
      rating: increment(10),
    });
  };

  useEffect(() => {
    fetchRandomPuzzle();
  }, []);

  return {
    puzzle: currentPuzzle,
    loading,
    moveIndex,
    checkMove,
    nextPuzzle: fetchRandomPuzzle,
  };
}