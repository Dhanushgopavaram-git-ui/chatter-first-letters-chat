
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import CreateRoomForm from '@/components/CreateRoomForm';
import JoinRoomForm from '@/components/JoinRoomForm';
import ChatRoom from '@/components/ChatRoom';
import SavedChatsList from '@/components/SavedChatsList';
import TranscriptView from '@/components/TranscriptView';
import { useChat, ChatProvider } from '@/contexts/ChatContext';
import { Toaster } from "@/components/ui/toaster";

const ChatApp: React.FC = () => {
  const { activeRoom, savedRooms } = useChat();
  const [viewMode, setViewMode] = useState<'home' | 'transcript'>('home');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  
  const handleViewTranscript = (roomId: string) => {
    setSelectedRoomId(roomId);
    setViewMode('transcript');
  };
  
  const handleBackToList = () => {
    setViewMode('home');
    setSelectedRoomId(null);
  };
  
  if (viewMode === 'transcript' && selectedRoomId) {
    const room = savedRooms.find(r => r.id === selectedRoomId);
    if (room) {
      return <TranscriptView room={room} onBack={handleBackToList} />;
    }
  }
  
  if (activeRoom) {
    return <ChatRoom />;
  }
  
  return (
    <div className="container py-8 max-w-5xl">
      <h1 className="text-4xl font-bold text-center mb-2 text-brand-600">Chatter</h1>
      <p className="text-center text-muted-foreground mb-8">
        Anonymous chat with just first letter identifiers
      </p>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-8">
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="create">Create Room</TabsTrigger>
              <TabsTrigger value="join">Join Room</TabsTrigger>
            </TabsList>
            <TabsContent value="create">
              <CreateRoomForm />
            </TabsContent>
            <TabsContent value="join">
              <JoinRoomForm />
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <SavedChatsList onViewTranscript={handleViewTranscript} />
        </div>
      </div>
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <ChatProvider>
      <ChatApp />
      <Toaster />
    </ChatProvider>
  );
};

export default Index;
