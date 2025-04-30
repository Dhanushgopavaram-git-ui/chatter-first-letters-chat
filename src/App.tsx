import React from 'react';
import { ChatProvider, useChat } from './contexts/ChatContext';
import CreateRoomForm from './components/CreateRoomForm';
import JoinRoomForm from './components/JoinRoomForm';
import ChatRoom from './components/ChatRoom';
import SavedChats from './components/SavedChats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/toaster";

// Main application wrapper
const AppContent: React.FC = () => {
  const { activeRoom } = useChat();
  
  // If there's an active room, show the chat interface
  if (activeRoom) {
    return <ChatRoom />;
  }
  
  // Otherwise show the room creation/joining interface
  return (
    <div className="container max-w-5xl mx-auto p-4 grid grid-cols-1 md:grid-cols-5 gap-8">
      <div className="md:col-span-3">
        <Tabs defaultValue="join">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="join">Join Room</TabsTrigger>
            <TabsTrigger value="create">Create Room</TabsTrigger>
          </TabsList>
          <TabsContent value="join">
            <JoinRoomForm />
          </TabsContent>
          <TabsContent value="create">
            <CreateRoomForm />
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="md:col-span-2">
        <SavedChats />
      </div>
    </div>
  );
};

// Root component with providers
const App: React.FC = () => {
  return (
    <ChatProvider>
      <div className="min-h-screen flex flex-col">
        <header className="border-b py-4">
          <div className="container max-w-5xl mx-auto px-4">
            <h1 className="text-3xl font-bold text-primary text-center">Chatter</h1>
            <p className="text-center text-muted-foreground">
              Anonymous chat with just first letter identifiers
            </p>
          </div>
        </header>
        
        <main className="flex-1 py-8">
          <AppContent />
        </main>
        
        <footer className="border-t py-4">
          <div className="container max-w-5xl mx-auto px-4">
            <p className="text-center text-sm text-muted-foreground">
              Chatter &copy; {new Date().getFullYear()} - Simple anonymous chat
            </p>
          </div>
        </footer>
      </div>
      <Toaster />
    </ChatProvider>
  );
};

export default App;
