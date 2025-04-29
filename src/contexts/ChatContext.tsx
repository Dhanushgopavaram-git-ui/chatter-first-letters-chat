
import React, { createContext, useContext, useState, useEffect } from 'react';
import { nanoid } from 'nanoid';

// Types
export type UserRole = 'host' | 'participant';

export interface User {
  id: string;
  name: string;
  displayChar: string;
  role: UserRole;
}

export interface Message {
  id: string;
  senderId: string;
  senderDisplayChar: string;
  content: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  createdAt: number;
  endedAt?: number;
  hostId: string;
  participants: User[];
  messages: Message[];
  code: string;
}

interface ChatContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  activeRoom: ChatRoom | null;
  savedRooms: ChatRoom[];
  createRoom: (name: string, hostName: string) => ChatRoom;
  joinRoom: (code: string, userName: string) => boolean;
  sendMessage: (content: string) => void;
  endRoom: () => void;
  getDisplayChar: (name: string, participants: User[]) => string;
  leaveRoom: () => void;
}

// Create context
const ChatContext = createContext<ChatContextType | null>(null);

// Hook to use the context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Generate a random 6-character room code
const generateRoomCode = (): string => {
  return Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();
};

// Provider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [savedRooms, setSavedRooms] = useState<ChatRoom[]>([]);

  // Load saved rooms from localStorage on mount
  useEffect(() => {
    const savedRoomsFromStorage = localStorage.getItem('savedRooms');
    if (savedRoomsFromStorage) {
      try {
        setSavedRooms(JSON.parse(savedRoomsFromStorage));
      } catch (e) {
        console.error('Failed to parse saved rooms from localStorage', e);
      }
    }
  }, []);

  // Save rooms to localStorage whenever they change
  useEffect(() => {
    if (savedRooms.length > 0) {
      localStorage.setItem('savedRooms', JSON.stringify(savedRooms));
    }
  }, [savedRooms]);

  // Generate a display character from a name
  const getDisplayChar = (name: string, participants: User[]): string => {
    if (!name || name.length === 0) return 'A'; // Default if no name provided
    
    const firstLetter = name.charAt(0).toUpperCase();
    
    // Count how many participants already have this first letter
    const sameLetterCount = participants.filter(
      p => p.displayChar.charAt(0) === firstLetter
    ).length;
    
    // If there are others with the same letter, add a number
    return sameLetterCount > 0 ? `${firstLetter}${sameLetterCount + 1}` : firstLetter;
  };

  // Create a new room
  const createRoom = (name: string, hostName: string): ChatRoom => {
    const hostId = nanoid();
    const roomId = nanoid();
    const roomCode = generateRoomCode();
    
    const host: User = {
      id: hostId,
      name: hostName,
      displayChar: 'H', // Host is always 'H'
      role: 'host',
    };
    
    const newRoom: ChatRoom = {
      id: roomId,
      name,
      createdAt: Date.now(),
      hostId,
      participants: [host],
      messages: [{
        id: nanoid(),
        senderId: 'system',
        senderDisplayChar: 'S',
        content: `Room "${name}" created. Share code: ${roomCode}`,
        timestamp: Date.now(),
        isSystem: true
      }],
      code: roomCode,
    };
    
    setCurrentUser(host);
    setActiveRoom(newRoom);
    return newRoom;
  };

  // Join an existing room
  const joinRoom = (code: string, userName: string): boolean => {
    // Check if the room exists in active room or saved rooms
    if (activeRoom && activeRoom.code === code && !activeRoom.endedAt) {
      const userId = nanoid();
      const displayChar = getDisplayChar(userName, activeRoom.participants);
      
      const user: User = {
        id: userId,
        name: userName,
        displayChar,
        role: 'participant',
      };
      
      const updatedParticipants = [...activeRoom.participants, user];
      const systemMessage: Message = {
        id: nanoid(),
        senderId: 'system',
        senderDisplayChar: 'S',
        content: `${displayChar} joined the room`,
        timestamp: Date.now(),
        isSystem: true
      };
      
      const updatedMessages = [...activeRoom.messages, systemMessage];
      
      setCurrentUser(user);
      setActiveRoom({
        ...activeRoom,
        participants: updatedParticipants,
        messages: updatedMessages,
      });
      
      return true;
    }
    
    return false;
  };

  // Send a message in the active room
  const sendMessage = (content: string) => {
    if (!activeRoom || !currentUser) return;
    
    const newMessage: Message = {
      id: nanoid(),
      senderId: currentUser.id,
      senderDisplayChar: currentUser.displayChar,
      content,
      timestamp: Date.now(),
    };
    
    const updatedMessages = [...activeRoom.messages, newMessage];
    setActiveRoom({
      ...activeRoom,
      messages: updatedMessages,
    });
  };

  // End the active room
  const endRoom = () => {
    if (!activeRoom || !currentUser || currentUser.role !== 'host') return;
    
    const endedRoom = {
      ...activeRoom,
      endedAt: Date.now(),
      messages: [
        ...activeRoom.messages,
        {
          id: nanoid(),
          senderId: 'system',
          senderDisplayChar: 'S',
          content: 'The room has been closed by the host.',
          timestamp: Date.now(),
          isSystem: true
        }
      ]
    };
    
    setSavedRooms(prev => [...prev, endedRoom]);
    setActiveRoom(null);
  };
  
  // Leave the active room (for participants)
  const leaveRoom = () => {
    if (!activeRoom || !currentUser) return;
    
    if (currentUser.role === 'host') {
      endRoom();
    } else {
      const systemMessage: Message = {
        id: nanoid(),
        senderId: 'system',
        senderDisplayChar: 'S',
        content: `${currentUser.displayChar} left the room`,
        timestamp: Date.now(),
        isSystem: true
      };
      
      setActiveRoom({
        ...activeRoom,
        participants: activeRoom.participants.filter(p => p.id !== currentUser.id),
        messages: [...activeRoom.messages, systemMessage],
      });
      
      setCurrentUser(null);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeRoom,
        savedRooms,
        createRoom,
        joinRoom,
        sendMessage,
        endRoom,
        getDisplayChar,
        leaveRoom
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
