export interface AIGeneratedPuzzle {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  content: any;
  solution: any;
  hints: string[];
  xpReward: number;
  coinReward: number;
}

export interface UserHistory {
  solvedCategories: string[];
  solvedDifficulties: string[];
  averageSolveTime: number;
  currentLevel: number;
  preferredCategories: string[];
  successRate: number;
}

// Puzzle templates for AI generation
const PUZZLE_TEMPLATES = {
  CRYPTOGRAPHY: [
    {
      type: 'substitution_cipher',
      generateContent: (difficulty: string) => generateSubstitutionCipher(difficulty),
      baseXP: { EASY: 25, MEDIUM: 50, HARD: 100, EXPERT: 200, LEGENDARY: 500 }
    },
    {
      type: 'vigenere',
      generateContent: (difficulty: string) => generateVigenereCipher(difficulty),
      baseXP: { EASY: 35, MEDIUM: 70, HARD: 140, EXPERT: 280, LEGENDARY: 700 }
    },
    {
      type: 'base64_multilayer',
      generateContent: (difficulty: string) => generateBase64Puzzle(difficulty),
      baseXP: { EASY: 20, MEDIUM: 40, HARD: 80, EXPERT: 160, LEGENDARY: 400 }
    }
  ],
  WEB_SECURITY: [
    {
      type: 'xss_detection',
      generateContent: (difficulty: string) => generateXSSPuzzle(difficulty),
      baseXP: { EASY: 30, MEDIUM: 60, HARD: 120, EXPERT: 240, LEGENDARY: 600 }
    },
    {
      type: 'path_traversal',
      generateContent: (difficulty: string) => generatePathTraversalPuzzle(difficulty),
      baseXP: { EASY: 35, MEDIUM: 70, HARD: 140, EXPERT: 280, LEGENDARY: 700 }
    }
  ],
  NETWORK: [
    {
      type: 'packet_analysis',
      generateContent: (difficulty: string) => generatePacketAnalysis(difficulty),
      baseXP: { EASY: 40, MEDIUM: 80, HARD: 160, EXPERT: 320, LEGENDARY: 800 }
    },
    {
      type: 'port_scan_analysis',
      generateContent: (difficulty: string) => generatePortScanPuzzle(difficulty),
      baseXP: { EASY: 30, MEDIUM: 60, HARD: 120, EXPERT: 240, LEGENDARY: 600 }
    }
  ],
  PROGRAMMING: [
    {
      type: 'algorithm_reverse',
      generateContent: (difficulty: string) => generateAlgorithmPuzzle(difficulty),
      baseXP: { EASY: 45, MEDIUM: 90, HARD: 180, EXPERT: 360, LEGENDARY: 900 }
    },
    {
      type: 'code_obfuscation',
      generateContent: (difficulty: string) => generateObfuscatedCode(difficulty),
      baseXP: { EASY: 50, MEDIUM: 100, HARD: 200, EXPERT: 400, LEGENDARY: 1000 }
    }
  ],
  FORENSICS: [
    {
      type: 'file_analysis',
      generateContent: (difficulty: string) => generateFileAnalysisPuzzle(difficulty),
      baseXP: { EASY: 35, MEDIUM: 70, HARD: 140, EXPERT: 280, LEGENDARY: 700 }
    },
    {
      type: 'metadata_extraction',
      generateContent: (difficulty: string) => generateMetadataPuzzle(difficulty),
      baseXP: { EASY: 25, MEDIUM: 50, HARD: 100, EXPERT: 200, LEGENDARY: 500 }
    }
  ]
};

// Cyberpunk-themed words and phrases for generation
const CYBERPUNK_WORDS = [
  'matrix', 'cyber', 'neural', 'digital', 'virtual', 'quantum', 'nexus', 'protocol',
  'encryption', 'firewall', 'mainframe', 'terminal', 'interface', 'algorithm', 'binary',
  'hacker', 'ghost', 'phantom', 'shadow', 'neon', 'chrome', 'steel', 'wire'
];

const SECRET_MESSAGES = [
  'THE MATRIX HAS YOU', 'FOLLOW THE WHITE RABBIT', 'WAKE UP NEO',
  'REALITY IS AN ILLUSION', 'BREAK THE CODE', 'ESCAPE THE SYSTEM',
  'DIGITAL REVOLUTION', 'HACK THE PLANET', 'INFORMATION WANTS TO BE FREE',
  'THE FUTURE IS NOW', 'CYBER LIBERATION', 'NEURAL NETWORKS ACTIVATED'
];

/**
 * Main AI puzzle generator function
 */
export function generateAIPuzzle(
  userHistory: UserHistory,
  requestedCategory?: string,
  requestedDifficulty?: string
): AIGeneratedPuzzle {
  // Analyze user preferences and skill level
  const recommendedCategory = requestedCategory || selectOptimalCategory(userHistory);
  const recommendedDifficulty = requestedDifficulty || selectOptimalDifficulty(userHistory);
  
  // Get available templates for the category
  const categoryTemplates = PUZZLE_TEMPLATES[recommendedCategory as keyof typeof PUZZLE_TEMPLATES];
  if (!categoryTemplates) {
    throw new Error(`No templates available for category: ${recommendedCategory}`);
  }
  
  // Select random template
  const template = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
  
  // Generate puzzle content
  const puzzleData = template.generateContent(recommendedDifficulty);
  const baseXP = template.baseXP[recommendedDifficulty as keyof typeof template.baseXP];
  
  return {
    title: puzzleData.title,
    description: puzzleData.description,
    category: recommendedCategory,
    difficulty: recommendedDifficulty,
    content: puzzleData.content,
    solution: puzzleData.solution,
    hints: puzzleData.hints,
    xpReward: baseXP,
    coinReward: Math.floor(baseXP * 0.6)
  };
}

function selectOptimalCategory(userHistory: UserHistory): string {
  // If user has preferred categories, use those 70% of the time
  if (userHistory.preferredCategories.length > 0 && Math.random() < 0.7) {
    return userHistory.preferredCategories[Math.floor(Math.random() * userHistory.preferredCategories.length)];
  }
  
  // Otherwise, suggest categories they haven't tried much
  const allCategories = Object.keys(PUZZLE_TEMPLATES);
  const leastTriedCategories = allCategories.filter(cat => 
    !userHistory.solvedCategories.includes(cat) || 
    userHistory.solvedCategories.filter(c => c === cat).length < 3
  );
  
  if (leastTriedCategories.length > 0) {
    return leastTriedCategories[Math.floor(Math.random() * leastTriedCategories.length)];
  }
  
  // Fallback to random
  return allCategories[Math.floor(Math.random() * allCategories.length)];
}

function selectOptimalDifficulty(userHistory: UserHistory): string {
  const { currentLevel, successRate, averageSolveTime } = userHistory;
  
  // Adaptive difficulty based on user performance
  if (currentLevel < 5 || successRate < 0.6) {
    return Math.random() < 0.7 ? 'EASY' : 'MEDIUM';
  } else if (currentLevel < 10 || successRate < 0.8) {
    return Math.random() < 0.5 ? 'MEDIUM' : 'HARD';
  } else if (currentLevel < 20) {
    return Math.random() < 0.4 ? 'HARD' : 'EXPERT';
  } else {
    return Math.random() < 0.3 ? 'EXPERT' : 'LEGENDARY';
  }
}

// Puzzle generation functions

function generateSubstitutionCipher(difficulty: string) {
  const message = SECRET_MESSAGES[Math.floor(Math.random() * SECRET_MESSAGES.length)];
  const shift = difficulty === 'EASY' ? 3 : Math.floor(Math.random() * 25) + 1;
  
  const encrypted = message.split('').map(char => {
    if (char.match(/[A-Z]/)) {
      return String.fromCharCode(((char.charCodeAt(0) - 65 + shift) % 26) + 65);
    }
    return char;
  }).join('');
  
  return {
    title: `Caesar Cipher Level ${difficulty}`,
    description: 'Decrypt this intercepted message from the resistance.',
    content: {
      type: 'caesar',
      message: encrypted,
      hint: difficulty === 'EASY' ? 'Try shifting by 3' : 'Find the shift value'
    },
    solution: { answer: message, shift },
    hints: [
      'This is a Caesar cipher substitution',
      'Each letter is shifted by the same amount',
      difficulty === 'EASY' ? 'The shift value is 3' : 'Try different shift values systematically'
    ]
  };
}

function generateVigenereCipher(difficulty: string) {
  const message = SECRET_MESSAGES[Math.floor(Math.random() * SECRET_MESSAGES.length)];
  const keys = difficulty === 'EASY' ? ['KEY', 'CODE'] : ['MATRIX', 'CIPHER', 'QUANTUM', 'NEURAL'];
  const key = keys[Math.floor(Math.random() * keys.length)];
  
  const encrypted = vigenereEncrypt(message, key);
  
  return {
    title: `Vigenère Cipher Challenge`,
    description: 'A more sophisticated encryption method. Find the key and decrypt the message.',
    content: {
      type: 'vigenere',
      message: encrypted,
      keyLength: key.length
    },
    solution: { answer: message, key },
    hints: [
      'This uses a Vigenère cipher',
      `The key length is ${key.length} characters`,
      difficulty === 'EASY' ? 'Try common short words as the key' : 'Analyze letter frequency patterns'
    ]
  };
}

function generateBase64Puzzle(difficulty: string) {
  const message = CYBERPUNK_WORDS[Math.floor(Math.random() * CYBERPUNK_WORDS.length)].toUpperCase();
  let encoded = btoa(message);
  
  if (difficulty !== 'EASY') {
    // Multiple layers of encoding for harder difficulties
    for (let i = 1; i < (difficulty === 'LEGENDARY' ? 4 : 2); i++) {
      encoded = btoa(encoded);
    }
  }
  
  return {
    title: `Base64 Decryption ${difficulty}`,
    description: 'Decode this base64 encoded message. May have multiple layers.',
    content: {
      type: 'base64',
      message: encoded,
      layers: difficulty === 'EASY' ? 1 : difficulty === 'LEGENDARY' ? 4 : 2
    },
    solution: { answer: message },
    hints: [
      'This message is base64 encoded',
      difficulty !== 'EASY' ? 'There may be multiple layers of encoding' : 'Single layer encoding',
      'Use online base64 decoder or built-in functions'
    ]
  };
}

function generateXSSPuzzle(difficulty: string) {
  const vulnerableInputs = [
    'search query',
    'username field',
    'comment section',
    'profile description'
  ];
  
  const input = vulnerableInputs[Math.floor(Math.random() * vulnerableInputs.length)];
  const payload = difficulty === 'EASY' ? '<script>alert("XSS")</script>' : '<img src=x onerror=alert("XSS")>';
  
  return {
    title: `XSS Vulnerability Detection`,
    description: `Find the XSS payload that works in the ${input}.`,
    content: {
      type: 'xss',
      vulnerable_input: input,
      filters: difficulty === 'EASY' ? 'none' : 'basic script tag filtering',
      goal: 'Execute JavaScript alert'
    },
    solution: { payload, method: 'Cross-Site Scripting' },
    hints: [
      'Look for ways to inject JavaScript',
      difficulty === 'EASY' ? 'Simple script tags work' : 'Try alternative HTML tags with event handlers',
      'The goal is to execute an alert() function'
    ]
  };
}

function generatePathTraversalPuzzle(difficulty: string) {
  const files = ['config.txt', 'passwords.txt', 'admin.log', 'secrets.env'];
  const targetFile = files[Math.floor(Math.random() * files.length)];
  const payload = difficulty === 'EASY' ? '../../../etc/passwd' : '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts';
  
  return {
    title: `Path Traversal Exploit`,
    description: `Access the restricted file: ${targetFile}`,
    content: {
      type: 'path_traversal',
      target_file: targetFile,
      current_directory: '/var/www/uploads/',
      protection: difficulty === 'EASY' ? 'none' : 'basic filtering'
    },
    solution: { payload, explanation: 'Directory traversal using ../../../' },
    hints: [
      'Use directory traversal sequences',
      'Try ../ to go up directories',
      difficulty !== 'EASY' ? 'May need to bypass basic filtering' : 'Simple traversal should work'
    ]
  };
}

function generatePacketAnalysis(difficulty: string) {
  const protocols = ['HTTP', 'FTP', 'SMTP', 'TCP'];
  const protocol = protocols[Math.floor(Math.random() * protocols.length)];
  const suspiciousIPs = ['192.168.1.100', '10.0.0.50', '172.16.0.25'];
  const normalIPs = ['192.168.1.1', '8.8.8.8', '1.1.1.1'];
  
  const suspicious = suspiciousIPs[Math.floor(Math.random() * suspiciousIPs.length)];
  
  return {
    title: `${protocol} Traffic Analysis`,
    description: 'Analyze this network capture and find the suspicious activity.',
    content: {
      type: 'packet_analysis',
      protocol,
      packets: [
        `${normalIPs[0]} -> ${normalIPs[1]}: Normal traffic`,
        `${suspicious} -> ${normalIPs[2]}: Unusual payload detected`,
        `${normalIPs[2]} -> ${normalIPs[0]}: Response packet`,
        `${suspicious} -> Multiple IPs: Port scanning detected`
      ],
      question: 'Which IP address is showing suspicious behavior?'
    },
    solution: { answer: suspicious, reason: 'Port scanning and unusual payload' },
    hints: [
      'Look for unusual traffic patterns',
      'Check for connections to multiple IPs',
      'Suspicious activities include port scanning and unusual payloads'
    ]
  };
}

function generatePortScanPuzzle(difficulty: string) {
  const targetIP = '192.168.1.100';
  const openPorts = difficulty === 'EASY' ? [80, 22, 443] : [22, 80, 443, 8080, 3389, 1337];
  const closedPorts = [21, 25, 53, 110, 995, 993];
  
  return {
    title: `Port Scan Analysis`,
    description: 'Analyze the port scan results and identify the services.',
    content: {
      type: 'port_scan',
      target: targetIP,
      results: [
        ...openPorts.map(port => ({ port, status: 'open', service: getServiceForPort(port) })),
        ...closedPorts.slice(0, 3).map(port => ({ port, status: 'closed', service: null }))
      ].sort(() => Math.random() - 0.5)
    },
    solution: { 
      openPorts, 
      services: openPorts.map(port => getServiceForPort(port)),
      vulnerability: 'Multiple services exposed'
    },
    hints: [
      'Identify which ports are open',
      'Match ports to their common services',
      'Consider which services might be vulnerable'
    ]
  };
}

function generateAlgorithmPuzzle(difficulty: string) {
  const algorithms = {
    EASY: { input: 'hello', output: 5, hint: 'String length' },
    MEDIUM: { input: [1,2,3,4,5], output: 15, hint: 'Sum of array' },
    HARD: { input: 'abccba', output: true, hint: 'Palindrome check' },
    EXPERT: { input: [3,1,4,1,5], output: [1,1,3,4,5], hint: 'Sorting algorithm' },
    LEGENDARY: { input: 'racecar', output: { 'r':2, 'a':2, 'c':2, 'e':1 }, hint: 'Character frequency' }
  };
  
  const algo = algorithms[difficulty as keyof typeof algorithms];
  
  return {
    title: `Algorithm Reverse Engineering`,
    description: 'Figure out what this algorithm does based on input/output examples.',
    content: {
      type: 'algorithm',
      examples: [
        { input: algo.input, output: algo.output },
        // Add more examples based on difficulty
      ],
      question: 'What does this algorithm do?'
    },
    solution: { answer: algo.hint, algorithm_type: 'pattern_recognition' },
    hints: [
      'Analyze the relationship between input and output',
      'Look for mathematical or logical patterns',
      algo.hint
    ]
  };
}

function generateObfuscatedCode(difficulty: string) {
  const codes = {
    EASY: { 
      code: 'print("Hello World")',
      obfuscated: 'eval(compile("cHJpbnQoIkhlbGxvIFdvcmxkIik=".decode("base64"), "<string>", "exec"))'
    },
    MEDIUM: {
      code: 'for i in range(10): print(i)',
      obfuscated: '__import__("sys").stdout.write(str([i for i in range(10)]))'
    }
  };
  
  const code = codes[difficulty as keyof typeof codes] || codes.EASY;
  
  return {
    title: `Code Deobfuscation Challenge`,
    description: 'This code has been obfuscated. What does it actually do?',
    content: {
      type: 'code_deobfuscation',
      obfuscated_code: code.obfuscated,
      language: 'python'
    },
    solution: { original_code: code.code, functionality: 'Basic output operation' },
    hints: [
      'Look for base64 encoding',
      'Trace the execution flow',
      'Consider what the end result would be'
    ]
  };
}

function generateFileAnalysisPuzzle(difficulty: string) {
  const fileTypes = ['image', 'document', 'executable', 'archive'];
  const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
  const hiddenData = CYBERPUNK_WORDS[Math.floor(Math.random() * CYBERPUNK_WORDS.length)];
  
  return {
    title: `Digital Forensics: ${fileType} Analysis`,
    description: `Analyze this ${fileType} file for hidden data.`,
    content: {
      type: 'file_analysis',
      file_type: fileType,
      file_size: '2.4 MB',
      hidden_data_location: difficulty === 'EASY' ? 'metadata' : 'steganography',
      hex_preview: '89 50 4E 47 0D 0A 1A 0A'
    },
    solution: { 
      hidden_data: hiddenData,
      method: difficulty === 'EASY' ? 'EXIF metadata' : 'LSB steganography'
    },
    hints: [
      'Check file metadata first',
      difficulty === 'EASY' ? 'Look in EXIF data' : 'Consider steganographic techniques',
      'Use forensics tools to analyze the file structure'
    ]
  };
}

function generateMetadataPuzzle(difficulty: string) {
  const metadata = {
    filename: 'secret_document.pdf',
    created_by: 'admin',
    creation_date: '2024-01-15 14:30:22',
    last_modified: '2024-01-16 09:45:11',
    hidden_field: btoa(CYBERPUNK_WORDS[Math.floor(Math.random() * CYBERPUNK_WORDS.length)])
  };
  
  return {
    title: `Metadata Extraction Challenge`,
    description: 'Extract the hidden information from this file\'s metadata.',
    content: {
      type: 'metadata',
      file_info: metadata,
      question: 'What is hidden in the metadata?'
    },
    solution: { 
      answer: atob(metadata.hidden_field),
      location: 'base64 encoded in custom field'
    },
    hints: [
      'Look for unusual or custom metadata fields',
      'Check for encoded data',
      'Try base64 decoding suspicious strings'
    ]
  };
}

// Helper functions
function vigenereEncrypt(text: string, key: string): string {
  return text.split('').map((char, i) => {
    if (char.match(/[A-Z]/)) {
      const keyChar = key[i % key.length];
      const shift = keyChar.charCodeAt(0) - 65;
      return String.fromCharCode(((char.charCodeAt(0) - 65 + shift) % 26) + 65);
    }
    return char;
  }).join('');
}

function getServiceForPort(port: number): string {
  const services: Record<number, string> = {
    22: 'SSH',
    80: 'HTTP',
    443: 'HTTPS',
    21: 'FTP',
    25: 'SMTP',
    53: 'DNS',
    110: 'POP3',
    993: 'IMAPS',
    995: 'POP3S',
    3389: 'RDP',
    8080: 'HTTP-Alt',
    1337: 'Elite/Custom'
  };
  
  return services[port] || 'Unknown';
}

function atob(str: string): string {
  try {
    return Buffer.from(str, 'base64').toString('ascii');
  } catch {
    return str;
  }
}

function btoa(str: string): string {
  return Buffer.from(str, 'ascii').toString('base64');
}