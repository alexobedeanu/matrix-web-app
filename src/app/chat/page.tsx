'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';
import { redirect } from 'next/navigation';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  isSystem: boolean;
  isPrivate: boolean;
  channel: string;
}

interface Channel {
  id: string;
  name: string;
  type: 'global' | 'clan' | 'private';
  memberCount?: number;
  isActive: boolean;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [activeChannel, setActiveChannel] = useState('global');
  const [channels, setChannels] = useState<Channel[]>([
    { id: 'global', name: '#darknet_global', type: 'global', memberCount: 42, isActive: true },
    { id: 'newbies', name: '#script_kiddies', type: 'global', memberCount: 18, isActive: true },
    { id: 'elite', name: '#elite_hackers', type: 'global', memberCount: 7, isActive: true }
  ]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login');
    }
    
    if (session?.user) {
      initializeChat();
      // Simulate real-time messages
      const interval = setInterval(simulateMessage, 8000);
      return () => clearInterval(interval);
    }
  }, [session, status]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = () => {
    // Add welcome messages
    const welcomeMessages: ChatMessage[] = [
      {
        id: 'sys1',
        username: 'SYSTEM',
        message: '=== DARKNET TERMINAL v2.7.3 INITIALIZED ===',
        timestamp: new Date().toISOString(),
        isSystem: true,
        isPrivate: false,
        channel: 'global'
      },
      {
        id: 'sys2',
        username: 'SYSTEM',
        message: 'Connection established. Welcome to the underground.',
        timestamp: new Date().toISOString(),
        isSystem: true,
        isPrivate: false,
        channel: 'global'
      },
      {
        id: 'sys3',
        username: 'SYSTEM',
        message: 'Type /help for available commands. Stay anonymous.',
        timestamp: new Date().toISOString(),
        isSystem: true,
        isPrivate: false,
        channel: 'global'
      }
    ];

    setMessages(welcomeMessages);
    setOnlineUsers(['phantom_dev', 'cipher_queen', 'net_ghost', 'code_breaker_x', 'anon_1337']);
  };

  const simulateMessage = () => {
    const users = ['phantom_dev', 'cipher_queen', 'net_ghost', 'code_breaker_x', 'anon_1337', 'shadow_walker'];
    const messages = [
      'Anyone cracked the new RSA challenge yet?',
      'Found a zero-day in the mainframe... 👀',
      'The gibson is down again smh',
      'New puzzle dropped in sector 7',
      'Who else is getting weird signals on freq 1337?',
      'Just hit level 25! The grind is real',
      'That SQL injection sim was too easy',
      'Looking for clan members, ping me',
      'Matrix has you... escape while you can',
      'Decrypted: THE CAKE IS A LIE',
      'Anyone else notice the new security protocols?',
      'Meet at the usual IRC channel at midnight',
    ];

    if (Math.random() > 0.7) { // 30% chance of new message
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      
      const newMessage: ChatMessage = {
        id: `sim_${Date.now()}`,
        username: randomUser,
        message: randomMessage,
        timestamp: new Date().toISOString(),
        isSystem: false,
        isPrivate: false,
        channel: activeChannel
      };

      setMessages(prev => [...prev, newMessage].slice(-100)); // Keep last 100 messages
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim() || !session?.user) return;

    const message = currentMessage.trim();
    
    // Add to command history
    if (message.startsWith('/')) {
      setCommandHistory(prev => [message, ...prev.slice(0, 19)]); // Keep last 20 commands
    }
    setHistoryIndex(-1);

    // Handle commands
    if (message.startsWith('/')) {
      handleCommand(message);
    } else {
      // Regular message
      const newMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        username: session.user.name || 'anonymous',
        message,
        timestamp: new Date().toISOString(),
        isSystem: false,
        isPrivate: false,
        channel: activeChannel
      };

      setMessages(prev => [...prev, newMessage]);
    }

    setCurrentMessage('');
  };

  const handleCommand = (command: string) => {
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    const systemResponse = (msg: string) => {
      const response: ChatMessage = {
        id: `cmd_${Date.now()}`,
        username: 'SYSTEM',
        message: msg,
        timestamp: new Date().toISOString(),
        isSystem: true,
        isPrivate: false,
        channel: activeChannel
      };
      setMessages(prev => [...prev, response]);
    };

    switch (cmd) {
      case '/help':
        systemResponse(`Available commands:
/help - Show this help
/who - List online users
/join <channel> - Join channel
/channels - List available channels
/clear - Clear chat history
/time - Show current time
/status - Show connection status
/whisper <user> <message> - Send private message
/quit - Disconnect from chat`);
        break;

      case '/who':
        systemResponse(`Online users (${onlineUsers.length}): ${onlineUsers.join(', ')}`);
        break;

      case '/channels':
        systemResponse(`Available channels:
${channels.map(ch => `${ch.name} (${ch.memberCount || 0} users)`).join('\n')}`);
        break;

      case '/join':
        if (args.length > 0) {
          const channelName = args[0].replace('#', '');
          const channel = channels.find(ch => ch.name.includes(channelName));
          if (channel) {
            setActiveChannel(channel.id);
            systemResponse(`Joined ${channel.name}`);
          } else {
            systemResponse(`Channel not found: ${args[0]}`);
          }
        } else {
          systemResponse('Usage: /join <channel>');
        }
        break;

      case '/clear':
        setMessages([]);
        systemResponse('Chat history cleared.');
        break;

      case '/time':
        systemResponse(`Current time: ${new Date().toLocaleString()}`);
        break;

      case '/status':
        systemResponse(`Status: CONNECTED | Channel: ${channels.find(ch => ch.id === activeChannel)?.name} | Ping: 42ms`);
        break;

      case '/whisper':
        if (args.length >= 2) {
          const targetUser = args[0];
          const privateMessage = args.slice(1).join(' ');
          systemResponse(`[WHISPER to ${targetUser}]: ${privateMessage}`);
        } else {
          systemResponse('Usage: /whisper <user> <message>');
        }
        break;

      case '/quit':
        systemResponse('Connection terminated. Goodbye.');
        setTimeout(() => redirect('/'), 2000);
        break;

      default:
        systemResponse(`Unknown command: ${cmd}. Type /help for available commands.`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentMessage(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentMessage(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentMessage('');
      }
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black text-green-400 p-8">
        <div className="text-center">
          <div className="text-3xl font-mono animate-pulse">CONNECTING...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <div className="flex h-screen">
        {/* Sidebar - Channels & Users */}
        <div className="w-64 border-r border-green-400/30 bg-black/50 p-4">
          {/* Channels */}
          <div className="mb-6">
            <h3 className="text-sm font-bold text-green-400 mb-3">CHANNELS</h3>
            {channels.map(channel => (
              <div
                key={channel.id}
                onClick={() => setActiveChannel(channel.id)}
                className={`cursor-pointer p-2 rounded text-sm transition-colors ${
                  activeChannel === channel.id 
                    ? 'bg-green-400 text-black' 
                    : 'hover:bg-green-400/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{channel.name}</span>
                  <span className="text-xs opacity-70">{channel.memberCount}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Online Users */}
          <div>
            <h3 className="text-sm font-bold text-green-400 mb-3">ONLINE ({onlineUsers.length})</h3>
            <div className="space-y-1">
              {onlineUsers.map(user => (
                <div key={user} className="text-xs text-green-300 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  {user}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="border-b border-green-400/30 p-4 bg-black/50">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">
                {channels.find(ch => ch.id === activeChannel)?.name || '#darknet_global'}
              </h1>
              <div className="text-sm text-green-300">
                <span className="animate-pulse">●</span> SECURE CONNECTION
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages
              .filter(msg => msg.channel === activeChannel || msg.isSystem)
              .map(message => (
              <div key={message.id} className="flex gap-3">
                <span className="text-green-300 text-xs mt-1 w-12 flex-shrink-0">
                  {formatTimestamp(message.timestamp)}
                </span>
                <div className="flex-1 min-w-0">
                  <span className={`font-bold ${
                    message.isSystem 
                      ? 'text-yellow-400' 
                      : message.username === session?.user?.name 
                        ? 'text-cyan-400' 
                        : 'text-green-400'
                  }`}>
                    {message.isSystem ? '[SYSTEM]' : `<${message.username}>`}
                  </span>
                  <span className="ml-2 text-green-300 break-words whitespace-pre-wrap">
                    {message.message}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-green-400/30 p-4 bg-black/50">
            <div className="flex gap-3 items-center">
              <span className="text-green-400">{'>'}</span>
              <input
                ref={inputRef}
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type message or /help for commands..."
                className="flex-1 bg-transparent border-none outline-none text-green-400 placeholder-green-600"
                autoFocus
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-2 bg-green-400 text-black font-bold hover:bg-green-500 transition-colors"
              >
                SEND
              </button>
            </div>
            <div className="text-xs text-green-600 mt-2">
              Use arrow keys to navigate command history. Type /quit to disconnect.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}