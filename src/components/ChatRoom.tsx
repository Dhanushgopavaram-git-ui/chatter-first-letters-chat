import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, LogOut, Users } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const ChatRoom: React.FC = () => {
  const { activeRoom, currentUser, sendMessage, leaveRoom } = useChat();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeRoom?.messages]);
  
  if (!activeRoom || !currentUser) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  const isHost = currentUser.role === 'host';
  
  return (
    <Card className="w-full h-full flex flex-col animate-fade-in">
      <CardHeader className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              {activeRoom.name}
              {activeRoom.endedAt && (
                <Badge variant="secondary">Ended</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Room Code: <span className="font-mono">{activeRoom.code}</span>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Users size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Participants</SheetTitle>
                  <SheetDescription>
                    {activeRoom.participants.length} people in this room
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4">
                  {activeRoom.participants.map(participant => (
                    <div key={participant.id} className="flex items-center gap-2 py-2 border-b">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                        {participant.displayChar}
                      </div>
                      <div>
                        <div className="font-medium">{participant.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {participant.role === 'host' ? 'Host' : 'Participant'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <LogOut size={18} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {isHost ? 'End this room?' : 'Leave this room?'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {isHost 
                      ? "This will end the chat for all participants. This cannot be undone."
                      : "You'll need the room code to join again."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={leaveRoom}>
                    {isHost ? 'End Room' : 'Leave Room'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-250px)]">
          <div className="p-4 space-y-4">
            {activeRoom.messages.map(msg => {
              const isCurrentUser = msg.senderId === currentUser.id;
              const isSystem = msg.isSystem;
              
              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <span className="text-xs bg-muted px-2 py-1 rounded-md text-muted-foreground">
                      {msg.content}
                    </span>
                  </div>
                );
              }
              
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex gap-2 max-w-[80%]">
                    {!isCurrentUser && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                              {msg.senderDisplayChar}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {activeRoom.participants.find(p => p.id === msg.senderId)?.name || 'Unknown'}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    <div>
                      <div 
                        className={`p-3 rounded-lg ${
                          isCurrentUser 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-secondary'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 text-right">
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="w-full flex gap-2">
          <Input 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            placeholder="Type a message..."
            disabled={activeRoom.endedAt !== undefined}
            autoFocus
          />
          <Button 
            type="submit" 
            disabled={!message.trim() || activeRoom.endedAt !== undefined}
          >
            <Send size={18} />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatRoom;
