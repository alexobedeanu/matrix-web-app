'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { redirect, useParams, useRouter } from 'next/navigation';
import { use } from 'react';

interface Puzzle {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  content: any;
  solution: any;
  hints: string[];
  xpReward: number;
  coinReward: number;
  solved?: boolean;
}

interface PuzzleComponentProps {
  puzzle: Puzzle;
  onSolve: (answer: string, timeSpent: number, hintsUsed: number) => void;
}

// Caesar Cipher Component
function CaesarCipherPuzzle({ puzzle, onSolve }: PuzzleComponentProps) {
  const [answer, setAnswer] = useState('');
  const [currentHint, setCurrentHint] = useState(0);
  const [startTime] = useState(Date.now());

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onSolve(answer.toUpperCase(), timeSpent, currentHint);
  };

  const showHint = () => {
    if (currentHint < puzzle.hints.length) {
      setCurrentHint(currentHint + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border border-green-400 p-6 rounded bg-black/30">
        <h3 className="text-xl font-mono text-green-400 mb-4">ENCRYPTED_MESSAGE:</h3>
        <div className="text-2xl font-mono text-center py-8 bg-black border border-green-400/50 rounded">
          {puzzle.content.message}
        </div>
      </div>

      {currentHint > 0 && (
        <div className="border border-yellow-400 p-4 rounded bg-yellow-400/10">
          <h4 className="font-mono text-yellow-400 mb-2">HINT_{currentHint}:</h4>
          <p className="font-mono text-yellow-300">{puzzle.hints[currentHint - 1]}</p>
        </div>
      )}

      <div className="space-y-4">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter decrypted message..."
          className="w-full p-3 bg-black border border-green-400 text-green-400 font-mono focus:outline-none focus:ring-1 focus:ring-green-400"
        />
        
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-green-400 text-black font-mono font-bold hover:bg-green-500 transition-colors"
          >
            SUBMIT_SOLUTION
          </button>
          {currentHint < puzzle.hints.length && (
            <button
              onClick={showHint}
              className="px-6 py-3 border border-yellow-400 text-yellow-400 font-mono font-bold hover:bg-yellow-400 hover:text-black transition-colors"
            >
              REQUEST_HINT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// SQL Injection Component
function SQLInjectionPuzzle({ puzzle, onSolve }: PuzzleComponentProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');
  const [currentHint, setCurrentHint] = useState(0);
  const [startTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);

  const testInjection = () => {
    setAttempts(attempts + 1);
    
    // Simulate SQL injection
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    
    // Check various injection patterns
    const isInjectionSuccessful = 
      username.includes("' OR '1'='1'") ||
      username.includes("' OR 1=1") ||
      username.includes("admin' --") ||
      password.includes("' OR '1'='1'") ||
      (username.includes("admin") && password.includes("' OR '1'='1'"));

    if (isInjectionSuccessful) {
      setResult('SUCCESS: Authentication bypassed! You have admin access.');
      setTimeout(() => {
        const timeSpent = Math.floor((Date.now() - startTime) / 1000);
        onSolve('successful_injection', timeSpent, currentHint);
      }, 2000);
    } else {
      setResult(`ERROR: Invalid credentials. Query executed: ${query}`);
    }
  };

  const showHint = () => {
    if (currentHint < puzzle.hints.length) {
      setCurrentHint(currentHint + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border border-green-400 p-6 rounded bg-black/30">
        <h3 className="text-xl font-mono text-green-400 mb-4">LOGIN_SYSTEM:</h3>
        <div className="text-sm font-mono text-green-300 mb-4">
          Goal: Bypass authentication without knowing valid credentials
        </div>
        <div className="bg-black border border-green-400/50 p-4 rounded font-mono text-xs text-green-300">
          Current Query Template:<br/>
          <span className="text-yellow-400">SELECT * FROM users WHERE username = '{`{username}`}' AND password = '{`{password}`}'</span>
        </div>
      </div>

      {currentHint > 0 && (
        <div className="border border-yellow-400 p-4 rounded bg-yellow-400/10">
          <h4 className="font-mono text-yellow-400 mb-2">HINT_{currentHint}:</h4>
          <p className="font-mono text-yellow-300">{puzzle.hints[currentHint - 1]}</p>
        </div>
      )}

      <div className="space-y-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full p-3 bg-black border border-green-400 text-green-400 font-mono focus:outline-none focus:ring-1 focus:ring-green-400"
        />
        
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-3 bg-black border border-green-400 text-green-400 font-mono focus:outline-none focus:ring-1 focus:ring-green-400"
        />

        <div className="flex gap-4">
          <button
            onClick={testInjection}
            className="flex-1 py-3 bg-green-400 text-black font-mono font-bold hover:bg-green-500 transition-colors"
          >
            ATTEMPT_LOGIN
          </button>
          {currentHint < puzzle.hints.length && (
            <button
              onClick={showHint}
              className="px-6 py-3 border border-yellow-400 text-yellow-400 font-mono font-bold hover:bg-yellow-400 hover:text-black transition-colors"
            >
              REQUEST_HINT
            </button>
          )}
        </div>

        {result && (
          <div className={`border p-4 rounded font-mono ${
            result.includes('SUCCESS') 
              ? 'border-green-400 bg-green-400/10 text-green-400' 
              : 'border-red-400 bg-red-400/10 text-red-400'
          }`}>
            <div className="text-sm mb-2">Attempts: {attempts}</div>
            <div>{result}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Network Packet Analysis Component
function NetworkAnalysisPuzzle({ puzzle, onSolve }: PuzzleComponentProps) {
  const [answer, setAnswer] = useState('');
  const [currentHint, setCurrentHint] = useState(0);
  const [startTime] = useState(Date.now());

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onSolve(answer, timeSpent, currentHint);
  };

  const showHint = () => {
    if (currentHint < puzzle.hints.length) {
      setCurrentHint(currentHint + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border border-green-400 p-6 rounded bg-black/30">
        <h3 className="text-xl font-mono text-green-400 mb-4">NETWORK_TRAFFIC_ANALYSIS:</h3>
        <div className="bg-black border border-green-400/50 p-4 rounded">
          <div className="font-mono text-sm text-green-300 mb-4">
            Captured network packets - find the suspicious pattern:
          </div>
          {puzzle.content.traffic.map((packet: string, index: number) => (
            <div key={index} className="font-mono text-xs text-green-400 mb-1">
              [{String(index + 1).padStart(2, '0')}] {packet}
            </div>
          ))}
        </div>
        <div className="text-yellow-400 font-mono mt-4">
          Question: {puzzle.content.question}
        </div>
      </div>

      {currentHint > 0 && (
        <div className="border border-yellow-400 p-4 rounded bg-yellow-400/10">
          <h4 className="font-mono text-yellow-400 mb-2">HINT_{currentHint}:</h4>
          <p className="font-mono text-yellow-300">{puzzle.hints[currentHint - 1]}</p>
        </div>
      )}

      <div className="space-y-4">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter the suspicious IP address..."
          className="w-full p-3 bg-black border border-green-400 text-green-400 font-mono focus:outline-none focus:ring-1 focus:ring-green-400"
        />
        
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-green-400 text-black font-mono font-bold hover:bg-green-500 transition-colors"
          >
            SUBMIT_ANALYSIS
          </button>
          {currentHint < puzzle.hints.length && (
            <button
              onClick={showHint}
              className="px-6 py-3 border border-yellow-400 text-yellow-400 font-mono font-bold hover:bg-yellow-400 hover:text-black transition-colors"
            >
              REQUEST_HINT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Binary Decoder Component
function BinaryDecoderPuzzle({ puzzle, onSolve }: PuzzleComponentProps) {
  const [answer, setAnswer] = useState('');
  const [currentHint, setCurrentHint] = useState(0);
  const [startTime] = useState(Date.now());
  const [decodedPreview, setDecodedPreview] = useState('');

  useEffect(() => {
    // Auto-decode as user types for immediate feedback
    try {
      const binaryGroups = answer.split(' ').filter(group => group.length > 0);
      const decoded = binaryGroups.map(group => {
        if (group.length === 8 && /^[01]+$/.test(group)) {
          return String.fromCharCode(parseInt(group, 2));
        }
        return '?';
      }).join('');
      setDecodedPreview(decoded);
    } catch (e) {
      setDecodedPreview('Invalid binary');
    }
  }, [answer]);

  const handleSubmit = () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    onSolve(decodedPreview.toUpperCase(), timeSpent, currentHint);
  };

  const showHint = () => {
    if (currentHint < puzzle.hints.length) {
      setCurrentHint(currentHint + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border border-green-400 p-6 rounded bg-black/30">
        <h3 className="text-xl font-mono text-green-400 mb-4">BINARY_MESSAGE:</h3>
        <div className="text-xl font-mono text-center py-8 bg-black border border-green-400/50 rounded">
          {puzzle.content.message}
        </div>
      </div>

      {currentHint > 0 && (
        <div className="border border-yellow-400 p-4 rounded bg-yellow-400/10">
          <h4 className="font-mono text-yellow-400 mb-2">HINT_{currentHint}:</h4>
          <p className="font-mono text-yellow-300">{puzzle.hints[currentHint - 1]}</p>
        </div>
      )}

      <div className="space-y-4">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter the binary message (copy from above)..."
          rows={3}
          className="w-full p-3 bg-black border border-green-400 text-green-400 font-mono focus:outline-none focus:ring-1 focus:ring-green-400"
        />

        {decodedPreview && (
          <div className="border border-cyan-400/50 p-3 rounded bg-cyan-400/10">
            <div className="text-cyan-400 font-mono text-sm mb-1">DECODED_PREVIEW:</div>
            <div className="text-cyan-300 font-mono text-lg">{decodedPreview}</div>
          </div>
        )}
        
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-green-400 text-black font-mono font-bold hover:bg-green-500 transition-colors"
          >
            SUBMIT_DECODED_MESSAGE
          </button>
          {currentHint < puzzle.hints.length && (
            <button
              onClick={showHint}
              className="px-6 py-3 border border-yellow-400 text-yellow-400 font-mono font-bold hover:bg-yellow-400 hover:text-black transition-colors"
            >
              REQUEST_HINT
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PuzzlePage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [solving, setSolving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
    
    if (session?.user && params.id) {
      fetchPuzzle();
    }
  }, [session, status, params.id]);

  const fetchPuzzle = async () => {
    try {
      const response = await fetch(`/api/puzzles/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setPuzzle(data);
      } else {
        router.push('/puzzles');
      }
    } catch (error) {
      console.error('Failed to fetch puzzle:', error);
      router.push('/puzzles');
    } finally {
      setLoading(false);
    }
  };

  const handleSolve = async (answer: string, timeSpent: number, hintsUsed: number) => {
    if (!puzzle || solving) return;
    
    setSolving(true);
    try {
      const response = await fetch(`/api/puzzles/${params.id}/solve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, timeSpent, hintsUsed })
      });

      const result = await response.json();
      
      if (result.correct) {
        alert(`🎉 Correct! You earned ${result.xpGained} XP and ${result.coinsGained} coins!`);
        
        // Check for achievements
        const achResponse = await fetch('/api/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ trigger: 'puzzle_solved', data: { puzzleId: puzzle.id } })
        });
        
        if (achResponse.ok) {
          const achResult = await achResponse.json();
          if (achResult.newAchievements.length > 0) {
            setTimeout(() => {
              alert(`🏆 Achievement unlocked: ${achResult.newAchievements.map((a: any) => a.name).join(', ')}!`);
            }, 1000);
          }
        }
        
        setTimeout(() => {
          router.push('/puzzles');
        }, 2000);
      } else {
        alert('❌ Incorrect answer. Try again!');
      }
    } catch (error) {
      console.error('Failed to submit solution:', error);
      alert('Error submitting solution. Please try again.');
    } finally {
      setSolving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8">
        <div className="text-center">
          <div className="text-3xl font-mono animate-pulse">LOADING_PUZZLE.exe</div>
        </div>
      </div>
    );
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8">
        <div className="text-center">Puzzle not found.</div>
      </div>
    );
  }

  const renderPuzzle = () => {
    switch (puzzle.content.type) {
      case 'caesar':
        return <CaesarCipherPuzzle puzzle={puzzle} onSolve={handleSolve} />;
      case 'sql_injection':
        return <SQLInjectionPuzzle puzzle={puzzle} onSolve={handleSolve} />;
      case 'pattern':
        return <NetworkAnalysisPuzzle puzzle={puzzle} onSolve={handleSolve} />;
      case 'binary':
        return <BinaryDecoderPuzzle puzzle={puzzle} onSolve={handleSolve} />;
      default:
        return <div className="text-red-400 font-mono">Unsupported puzzle type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="border border-green-400 rounded-lg p-6 bg-black/50 backdrop-blur mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-mono font-bold text-green-400">
              {'>'} {puzzle.title}
            </h1>
            <button
              onClick={() => router.push('/puzzles')}
              className="px-4 py-2 border border-red-400 text-red-400 hover:bg-red-400 hover:text-black transition-colors font-mono"
            >
              EXIT
            </button>
          </div>
          
          <p className="font-mono text-green-300 mb-4">{puzzle.description}</p>
          
          <div className="flex items-center gap-6 text-sm font-mono">
            <span className="text-green-400">Difficulty: {puzzle.difficulty}</span>
            <span className="text-green-400">Category: {puzzle.category}</span>
            <span className="text-green-400">Reward: +{puzzle.xpReward} XP, +{puzzle.coinReward} coins</span>
          </div>
        </div>

        {/* Puzzle Content */}
        <div className="border border-green-400 rounded-lg p-8 bg-black/50 backdrop-blur">
          {renderPuzzle()}
        </div>
      </div>
    </div>
  );
}