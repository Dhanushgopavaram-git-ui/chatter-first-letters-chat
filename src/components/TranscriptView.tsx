
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from 'date-fns';
import { ChatRoom } from '@/contexts/ChatContext';

interface TranscriptViewProps {
  room: ChatRoom;
  onBack: () => void;
}

const TranscriptView: React.FC<TranscriptViewProps> = ({ room, onBack }) => {
  const handleDownload = () => {
    // Create a text version of the transcript
    const transcript = room.messages.map(msg => {
      const timestamp = format(msg.timestamp, 'MMM dd, yyyy h:mm a');
      return `[${timestamp}] ${msg.senderDisplayChar}: ${msg.content}`;
    }).join('\n');
    
    // Create a download link
    const element = document.createElement('a');
    const file = new Blob([transcript], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `transcript-${room.name}-${format(room.endedAt || Date.now(), 'yyyy-MM-dd')}.txt`;
    
    // Trigger download
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  return (
    <Card className="w-full h-[calc(100vh-2rem)] max-w-4xl mx-auto flex flex-col animate-fade-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">
              Transcript: {room.name}
            </CardTitle>
            <CardDescription>
              <div className="flex flex-col gap-1">
                <span>Room Code: <span className="font-mono">{room.code}</span></span>
                <span>
                  Created: {format(room.createdAt, 'MMM dd, yyyy h:mm a')}
                </span>
                <span>
                  Ended: {format(room.endedAt || 0, 'MMM dd, yyyy h:mm a')}
                </span>
              </div>
            </CardDescription>
          </div>
          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" onClick={onBack}>
              Back
            </Button>
            <Button variant="secondary" size="sm" onClick={handleDownload}>
              Download
            </Button>
          </div>
        </div>
        <div className="flex gap-2 pt-2 text-sm">
          <Badge variant="outline" className="bg-brand-50">
            Participants: {room.participants.length}
          </Badge>
          <Badge variant="outline" className="bg-brand-50">
            Messages: {room.messages.length}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow p-0 relative">
        <ScrollArea className="h-full p-4">
          <div className="space-y-3 px-2">
            {room.messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col rounded-lg p-3 max-w-[85%] ${
                  msg.isSystem 
                    ? 'bg-chat-system mx-auto text-center' 
                    : msg.senderId === room.hostId 
                      ? 'bg-chat-host ml-auto' 
                      : 'bg-chat-participant'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    variant="outline" 
                    className={`${
                      msg.isSystem ? 'bg-blue-100' : 
                      msg.senderId === room.hostId ? 'bg-purple-100' : 'bg-gray-100'
                    } h-6 w-6 rounded-full flex items-center justify-center p-0`}
                  >
                    {msg.senderDisplayChar}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(msg.timestamp, 'h:mm a')}
                  </span>
                </div>
                <p className={`text-sm ${msg.isSystem ? 'italic text-muted-foreground' : ''}`}>
                  {msg.content}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TranscriptView;
