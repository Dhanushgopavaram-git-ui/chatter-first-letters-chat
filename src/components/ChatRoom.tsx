
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useChat } from '@/contexts/ChatContext';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';

const ChatRoom: React.FC = () => {
  const { activeRoom, currentUser, sendMessage, endRoom, leaveRoom } = useChat();
  const [message, setMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [activeRoom?.messages]);
  
  if (!activeRoom || !currentUser) return null;
  
  const isHost = currentUser.role === 'host';
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage('');
    }
  };
  
  return (
    <Card className="w-full h-[calc(100vh-2rem)] max-w-4xl mx-auto flex flex-col animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">{activeRoom.name}</CardTitle>
            <CardDescription>
              Room Code: <span className="font-mono font-semibold">{activeRoom.code}</span>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {isHost ? (
              <Button variant="destructive" size="sm" onClick={endRoom}>
                End Chat
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={leaveRoom}>
                Leave
              </Button>
            )}
          </div>
        </div>
        <div className="flex gap-2 pt-2 pb-1 text-sm">
          <Badge variant="outline" className="bg-brand-50">
            Participants: {activeRoom.participants.length}
          </Badge>
          <Badge variant="outline" className="bg-brand-50">
            Your ID: {currentUser.displayChar}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow p-0 relative">
        <ScrollArea className="h-full p-4 pb-0" ref={scrollAreaRef}>
          <div className="space-y-3 px-2">
            {activeRoom.messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col rounded-lg p-3 max-w-[85%] ${
                  msg.isSystem 
                    ? 'bg-chat-system mx-auto text-center' 
                    : msg.senderId === currentUser.id 
                      ? 'bg-chat-host ml-auto' 
                      : 'bg-chat-participant mr-auto'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    variant="outline" 
                    className={`${
                      msg.isSystem ? 'bg-blue-100' : 
                      msg.senderId === activeRoom.hostId ? 'bg-purple-100' : 'bg-gray-100'
                    } h-6 w-6 rounded-full flex items-center justify-center p-0`}
                  >
                    {msg.senderDisplayChar}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <p className={`text-sm ${msg.isSystem ? 'italic text-muted-foreground' : ''}`}>
                  {msg.content}
                </p>
              </div>
            ))}
          </div>
          <div className="h-4"></div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="pt-2">
        <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit">Send</Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatRoom;
