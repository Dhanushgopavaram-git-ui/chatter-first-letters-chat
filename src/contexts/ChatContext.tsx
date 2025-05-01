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

// Helper function to get rooms from localStorage with more robust error handling
const getRoomsFromStorage = (): ChatRoom[] => {
  try {
    const roomsStr = localStorage.getItem('savedRooms');
    if (!roomsStr) return [];
    
    const parsed = JSON.parse(roomsStr);
    if (!Array.isArray(parsed)) {
      console.error('Saved rooms is not an array, resetting');
      return [];
    }
    
    return parsed;
  } catch (e) {
    console.error('Failed to parse saved rooms from localStorage', e);
    // In case of corruption, clear the saved rooms
    localStorage.removeItem('savedRooms');
    return [];
  }
};

// Helper function to save rooms to localStorage with validation
const saveRoomsToStorage = (rooms: ChatRoom[]): void => {
  try {
    if (!Array.isArray(rooms)) {
      console.error('Attempting to save non-array to localStorage', rooms);
      return;
    }
    localStorage.setItem('savedRooms', JSON.stringify(rooms));
  } catch (e) {
    console.error('Failed to save rooms to localStorage', e);
  }
};

// Provider component
export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [savedRooms, setSavedRooms] = useState<ChatRoom[]>([]);

  // Load saved rooms from localStorage on mount
  useEffect(() => {
    const rooms = getRoomsFromStorage();
    setSavedRooms(rooms);
    
    // Debug logs
    console.log('Loaded rooms from localStorage:', rooms);
  }, []);

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

  // Create a new room with improved localStorage handling
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
    
    // Get the most up-to-date rooms
    const currentRooms = getRoomsFromStorage();
    const updatedRooms = [...currentRooms, newRoom];
    
    // Update state
    setSavedRooms(updatedRooms);
    
    // Save directly to localStorage 
    saveRoomsToStorage(updatedRooms);
    
    // Log for debugging
    console.log(`Created new room with code ${roomCode}`, newRoom);
    console.log('Updated saved rooms:', updatedRooms);
    
    return newRoom;
  };

  // Join an existing room with robust error handling
  const joinRoom = (code: string, userName: string): boolean => {
    // Validate input parameters
    if (!code || !userName || userName.trim().length === 0) {
      console.log('Invalid inputs for joining room');
      return false;
    }
    
    // Format code for consistency
    const formattedCode = code.trim().toUpperCase();
    console.log(`Attempting to join room with code: ${formattedCode}`);
    
    // ALWAYS get the latest rooms directly from localStorage
    const latestRooms = getRoomsFromStorage();
    console.log('Latest rooms from localStorage:', latestRooms);
    
    // Update our state with the latest data
    setSavedRooms(latestRooms);

    // Search for the room with multiple strategies
    let targetRoom = null;
    
    // Strategy 1: Check active room
    if (activeRoom?.code === formattedCode && !activeRoom?.endedAt) {
      targetRoom = activeRoom;
      console.log('Found room in active room state');
    } 
    // Strategy 2: Check latest rooms from localStorage as primary source
    else {
      targetRoom = latestRooms.find(
        room => room.code === formattedCode && !room.endedAt
      );
      if (targetRoom) {
        console.log('Found room in localStorage');
      }
    }
    
    // If room doesn't exist or has ended
    if (!targetRoom || targetRoom.endedAt) {
      console.log('Room not found or already ended:', formattedCode);
      return false;
    }
    
    // Check if user with same name already exists
    const existingUser = targetRoom.participants.find(
      p => p.name.toLowerCase() === userName.trim().toLowerCase()
    );
    
    if (existingUser) {
      console.log('User with this name already exists in the room');
      return false;
    }

    // Create new user
    const userId = nanoid();
    const displayChar = getDisplayChar(userName, targetRoom.participants);
    
    const user: User = {
      id: userId,
      name: userName.trim(),
      displayChar,
      role: 'participant',
    };
    
    // Update room state
    const systemMessage: Message = {
      id: nanoid(),
      senderId: 'system',
      senderDisplayChar: 'S',
      content: `${displayChar} joined the room`,
      timestamp: Date.now(),
      isSystem: true
    };

    const updatedRoom = {
      ...targetRoom,
      participants: [...targetRoom.participants, user],
      messages: [...targetRoom.messages, systemMessage],
    };
    
    setCurrentUser(user);
    setActiveRoom(updatedRoom);
    
    // Update in both state and localStorage
    const updatedRooms = latestRooms.map(room => 
      room.id === updatedRoom.id ? updatedRoom : room
    );
    
    setSavedRooms(updatedRooms);
    saveRoomsToStorage(updatedRooms);
    
    console.log(`User ${displayChar} successfully joined room ${formattedCode}`);
    return true;
  };

  // Send a message in the active room
  const sendMessage = (content: string): boolean => {
    // Validate input and state
    if (!content || content.trim().length === 0) return false;
    if (!activeRoom || !currentUser) return false;
    if (activeRoom.endedAt) return false;
    
    // Create and add new message
    const newMessage: Message = {
      id: nanoid(),
      senderId: currentUser.id,
      senderDisplayChar: currentUser.displayChar,
      content: content.trim(),
      timestamp: Date.now(),
    };
    
    const updatedRoom = {
      ...activeRoom,
      messages: [...activeRoom.messages, newMessage],
    };
    
    setActiveRoom(updatedRoom);
    
    // Always update in savedRooms to maintain consistency across states
    setSavedRooms(prev => 
      prev.map(room => room.id === activeRoom.id ? updatedRoom : room)
    );
    
    // Also update localStorage directly
    try {
      const existingRooms = localStorage.getItem('savedRooms');
      if (existingRooms) {
        const parsedRooms = JSON.parse(existingRooms);
        const updatedRooms = parsedRooms.map((room: ChatRoom) => 
          room.id === activeRoom.id ? updatedRoom : room
        );
        localStorage.setItem('savedRooms', JSON.stringify(updatedRooms));
      }
    } catch (e) {
      console.error('Failed to update room in localStorage', e);
    }
    
    return true;
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
    
    setSavedRooms(prev => {
      // Check if the room already exists in savedRooms
      const exists = prev.some(room => room.id === endedRoom.id);
      if (exists) {
        // Update the existing room
        return prev.map(room => room.id === endedRoom.id ? endedRoom : room);
      } else {
        // Add the new room
        return [...prev, endedRoom];
      }
    });
    
    // Also update localStorage directly
    try {
      const existingRooms = localStorage.getItem('savedRooms');
      if (existingRooms) {
        const parsedRooms = JSON.parse(existingRooms);
        const exists = parsedRooms.some((room: ChatRoom) => room.id === endedRoom.id);
        
        let updatedRooms;
        if (exists) {
          updatedRooms = parsedRooms.map((room: ChatRoom) => 
            room.id === endedRoom.id ? endedRoom : room
          );
        } else {
          updatedRooms = [...parsedRooms, endedRoom];
        }
        
        localStorage.setItem('savedRooms', JSON.stringify(updatedRooms));
      }
    } catch (e) {
      console.error('Failed to update room in localStorage', e);
    }
    
    setActiveRoom(null);
    setCurrentUser(null); // Also clear currentUser when ending the room
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
      
      const updatedRoom = {
        ...activeRoom,
        participants: activeRoom.participants.filter(p => p.id !== currentUser.id),
        messages: [...activeRoom.messages, systemMessage],
      };
      
      // Update active room first
      setActiveRoom(updatedRoom);
      
      // Always update in savedRooms to maintain consistency
      setSavedRooms(prev => 
        prev.map(room => room.id === activeRoom.id ? updatedRoom : room)
      );
      
      // Also update localStorage directly
      try {
        const existingRooms = localStorage.getItem('savedRooms');
        if (existingRooms) {
          const parsedRooms = JSON.parse(existingRooms);
          const updatedRooms = parsedRooms.map((room: ChatRoom) => 
            room.id === activeRoom.id ? updatedRoom : room
          );
          localStorage.setItem('savedRooms', JSON.stringify(updatedRooms));
        }
      } catch (e) {
        console.error('Failed to update room in localStorage', e);
      }
      
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
