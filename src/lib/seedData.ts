import { prisma } from './prisma';

export async function seedPuzzles() {
  const puzzles = [
    {
      title: 'SQL Injection Basics',
      description: 'Learn to identify and exploit SQL injection vulnerabilities',
      category: 'WEB_SECURITY',
      difficulty: 'EASY',
      content: JSON.stringify({
        type: 'sql_injection',
        scenario: 'Login bypass challenge',
        target_url: '/vulnerable/login',
        hints: ['Try using common SQL injection payloads', 'Look for ways to bypass authentication']
      }),
      solution: JSON.stringify({
        answer: "' OR '1'='1",
        explanation: 'Classic SQL injection to bypass login authentication'
      }),
      hints: JSON.stringify([
        'Look at the login form',
        'Try entering special characters',
        'Think about how SQL queries work'
      ]),
      xpReward: 100,
      coinReward: 25,
      isActive: true
    },
    {
      title: 'Network Packet Analysis',
      description: 'Analyze network traffic to find hidden data',
      category: 'NETWORK',
      difficulty: 'MEDIUM',
      content: JSON.stringify({
        type: 'packet_analysis',
        scenario: 'Capture the flag in network traffic',
        pcap_data: 'sample_traffic.pcap',
        hints: ['Use Wireshark-like tools', 'Look for unusual protocols']
      }),
      solution: JSON.stringify({
        answer: 'FLAG{network_analysis_master}',
        explanation: 'Found in HTTP POST request body'
      }),
      hints: JSON.stringify([
        'Examine HTTP traffic carefully',
        'Check request/response bodies',
        'Look for base64 encoded data'
      ]),
      xpReward: 150,
      coinReward: 40,
      isActive: true
    },
    {
      title: 'Cryptography Challenge',
      description: 'Decrypt the encrypted message using cryptanalysis',
      category: 'CRYPTOGRAPHY',
      difficulty: 'HARD',
      content: JSON.stringify({
        type: 'crypto_challenge',
        scenario: 'Caesar cipher with unknown key',
        encrypted_text: 'KHOOR ZRUOG',
        hints: ['Try different shift values', 'Common cipher types']
      }),
      solution: JSON.stringify({
        answer: 'HELLO WORLD',
        explanation: 'Caesar cipher with shift of 3'
      }),
      hints: JSON.stringify([
        'This is a substitution cipher',
        'Try shifting letters by different amounts',
        'The key might be small'
      ]),
      xpReward: 200,
      coinReward: 60,
      isActive: true
    },
    {
      title: 'Buffer Overflow Exploitation',
      description: 'Exploit a simple buffer overflow vulnerability',
      category: 'BINARY_EXPLOITATION',
      difficulty: 'HARD',
      content: JSON.stringify({
        type: 'buffer_overflow',
        scenario: 'Stack-based buffer overflow',
        vulnerable_function: 'strcpy',
        hints: ['Find the exact offset', 'Control EIP register']
      }),
      solution: JSON.stringify({
        answer: 'AAAA' + 'BBBB'.repeat(16) + '\\x41\\x42\\x43\\x44',
        explanation: 'Overwrite return address with shellcode location'
      }),
      hints: JSON.stringify([
        'Calculate the buffer size',
        'Find the return address offset',
        'Use pattern matching to find EIP control'
      ]),
      xpReward: 250,
      coinReward: 80,
      isActive: true
    },
    {
      title: 'Web Shell Upload',
      description: 'Bypass file upload restrictions to upload a web shell',
      category: 'WEB_SECURITY',
      difficulty: 'MEDIUM',
      content: JSON.stringify({
        type: 'file_upload',
        scenario: 'Unrestricted file upload vulnerability',
        target_endpoint: '/upload',
        hints: ['Try different file extensions', 'Use HTTP interception']
      }),
      solution: JSON.stringify({
        answer: 'shell.php.jpg',
        explanation: 'Double extension bypass technique'
      }),
      hints: JSON.stringify([
        'The filter might only check the last extension',
        'Try null byte injection',
        'Consider MIME type spoofing'
      ]),
      xpReward: 175,
      coinReward: 45,
      isActive: true
    }
  ];

  for (const puzzle of puzzles) {
    const existing = await prisma.puzzle.findFirst({
      where: { title: puzzle.title }
    });
    
    if (!existing) {
      await prisma.puzzle.create({
        data: puzzle
      });
    }
  }

  console.log('Puzzles seeded successfully');
}

export async function seedAchievements() {
  const achievements = [
    {
      name: 'First Steps',
      description: 'Complete your first puzzle',
      category: 'PUZZLE',
      requirement: JSON.stringify({ type: 'puzzles_solved', target: 1 }),
      xpReward: 50,
      coinReward: 10,
      icon: '🎯',
      rarity: 'COMMON',
      isActive: true
    },
    {
      name: 'Speed Demon',
      description: 'Solve a puzzle in under 60 seconds',
      category: 'SPEED',
      requirement: JSON.stringify({ type: 'speed_solve', target: 60 }),
      xpReward: 100,
      coinReward: 25,
      icon: '⚡',
      rarity: 'UNCOMMON',
      isActive: true
    },
    {
      name: 'Perfect Solver',
      description: 'Solve 5 puzzles without using hints',
      category: 'PERFECTION',
      requirement: JSON.stringify({ type: 'perfect_solves', target: 5 }),
      xpReward: 200,
      coinReward: 50,
      icon: '💎',
      rarity: 'RARE',
      isActive: true
    }
  ];

  for (const achievement of achievements) {
    const existing = await prisma.achievement.findFirst({
      where: { name: achievement.name }
    });
    
    if (!existing) {
      await prisma.achievement.create({
        data: achievement
      });
    }
  }

  console.log('Achievements seeded successfully');
}