'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';

interface Puzzle {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  xpReward: number;
  coinReward: number;
  isActive: boolean;
  solved?: boolean;
  timeToSolve?: number;
}

const DIFFICULTY_COLORS = {
  EASY: 'text-green-400 border-green-400',
  MEDIUM: 'text-yellow-400 border-yellow-400',
  HARD: 'text-orange-400 border-orange-400',
  EXPERT: 'text-red-400 border-red-400',
  LEGENDARY: 'text-purple-400 border-purple-400'
};

const CATEGORY_ICONS = {
  CRYPTOGRAPHY: '🔐',
  REVERSE_ENGINEERING: '🔧',
  WEB_SECURITY: '🌐',
  NETWORK: '📡',
  FORENSICS: '🔍',
  PROGRAMMING: '💻',
  LOGIC: '🧩'
};

export default function PuzzlesPage() {
  const { data: session, status } = useSession();
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
    
    if (session?.user) {
      fetchPuzzles();
    }
  }, [session, status]);

  const fetchPuzzles = async () => {
    try {
      const response = await fetch('/api/puzzles');
      if (response.ok) {
        const data = await response.json();
        setPuzzles(data);
      }
    } catch (error) {
      console.error('Failed to fetch puzzles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPuzzles = puzzles.filter(puzzle => {
    const categoryMatch = selectedCategory === 'ALL' || puzzle.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'ALL' || puzzle.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch && puzzle.isActive;
  });

  const categories = ['ALL', ...Object.keys(CATEGORY_ICONS)];
  const difficulties = ['ALL', ...Object.keys(DIFFICULTY_COLORS)];

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8">
        <div className="text-center">
          <div className="text-3xl font-mono animate-pulse">LOADING_PUZZLES.exe</div>
          <div className="mt-4 text-lg font-mono text-green-300">Accessing neural network...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="border border-green-400 rounded-lg p-6 bg-black/50 backdrop-blur mb-8">
          <h1 className="text-4xl font-mono font-bold text-green-400 mb-4">
            {'>'} NEURAL_PUZZLES.sys
          </h1>
          <p className="font-mono text-green-300">
            Challenge your mind with cyberpunk-themed puzzles. Earn XP, coins, and unlock achievements.
          </p>
        </div>

        {/* Filters */}
        <div className="border border-green-400 rounded-lg p-6 bg-black/50 backdrop-blur mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Filter */}
            <div>
              <h3 className="font-mono text-lg text-green-400 mb-4">FILTER_BY_CATEGORY:</h3>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`p-2 border font-mono text-sm transition-colors ${
                      selectedCategory === category
                        ? 'bg-green-400 text-black border-green-400'
                        : 'text-green-400 border-green-400/50 hover:border-green-400'
                    }`}
                  >
                    {category === 'ALL' ? 'ALL' : `${CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]} ${category}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <h3 className="font-mono text-lg text-green-400 mb-4">FILTER_BY_DIFFICULTY:</h3>
              <div className="grid grid-cols-2 gap-2">
                {difficulties.map(difficulty => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`p-2 border font-mono text-sm transition-colors ${
                      selectedDifficulty === difficulty
                        ? difficulty === 'ALL'
                          ? 'bg-green-400 text-black border-green-400'
                          : `bg-current text-black ${DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS]}`
                        : difficulty === 'ALL'
                          ? 'text-green-400 border-green-400/50 hover:border-green-400'
                          : `${DIFFICULTY_COLORS[difficulty as keyof typeof DIFFICULTY_COLORS]} hover:bg-current hover:text-black`
                    }`}
                  >
                    {difficulty}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Puzzles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPuzzles.map(puzzle => (
            <div
              key={puzzle.id}
              className={`border rounded-lg p-6 bg-black/50 backdrop-blur transition-all hover:bg-black/70 ${
                puzzle.solved 
                  ? 'border-cyan-400' 
                  : DIFFICULTY_COLORS[puzzle.difficulty as keyof typeof DIFFICULTY_COLORS]
              } ${puzzle.solved ? 'opacity-75' : 'hover:scale-105'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl">
                  {CATEGORY_ICONS[puzzle.category as keyof typeof CATEGORY_ICONS]}
                </div>
                <div className={`px-2 py-1 border text-xs font-mono ${
                  DIFFICULTY_COLORS[puzzle.difficulty as keyof typeof DIFFICULTY_COLORS]
                }`}>
                  {puzzle.difficulty}
                </div>
              </div>

              <h3 className="text-xl font-mono font-bold text-green-400 mb-3">
                {puzzle.title}
              </h3>

              <p className="text-green-300 font-mono text-sm mb-4 leading-relaxed">
                {puzzle.description}
              </p>

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4 text-sm font-mono">
                  <span className="text-green-400">+{puzzle.xpReward} XP</span>
                  <span className="text-yellow-400">+{puzzle.coinReward} coins</span>
                </div>
              </div>

              {puzzle.solved ? (
                <div className="text-center">
                  <div className="text-cyan-400 font-mono text-sm mb-2">✓ SOLVED</div>
                  {puzzle.timeToSolve && (
                    <div className="text-cyan-300 font-mono text-xs">
                      Time: {Math.floor(puzzle.timeToSolve / 60)}:{(puzzle.timeToSolve % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="w-full py-3 bg-green-400 text-black font-mono font-bold hover:bg-green-500 transition-colors"
                  onClick={() => window.location.href = `/puzzles/${puzzle.id}`}
                >
                  HACK_NOW
                </button>
              )}
            </div>
          ))}
        </div>

        {filteredPuzzles.length === 0 && (
          <div className="text-center text-green-300 font-mono text-lg">
            No puzzles found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}