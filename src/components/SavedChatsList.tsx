
import React from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, Eye, Users } from "lucide-react";
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SavedChatsListProps {
  onViewTranscript?: (roomId: string) => void;
}

const SavedChatsList: React.FC<SavedChatsListProps> = ({ onViewTranscript }) => {
  const { savedRooms } = useChat();

  // Function to export chat as a file
  const exportChat = (roomId: string) => {
    const room = savedRooms.find(r => r.id === roomId);
    if (!room) return;

    // Format chat data
    const roomInfo = `Chat Room: ${room.name}\nCode: ${room.code}\nCreated: ${new Date(room.createdAt).toLocaleString()}\nEnded: ${room.endedAt ? new Date(room.endedAt).toLocaleString() : 'Active'}\n\n`;
    
    const participants = room.participants.map(p => 
      `${p.displayChar}: ${p.name} (${p.role})`
    ).join('\n');
    
    const messages = room.messages.map(msg => {
      const time = new Date(msg.timestamp).toLocaleTimeString();
      const sender = msg.isSystem 
        ? 'SYSTEM' 
        : room.participants.find(p => p.id === msg.senderId)?.name || 'Unknown';
      return `[${time}] ${msg.senderDisplayChar}: ${msg.content}`;
    }).join('\n');

    const fileContent = `${roomInfo}Participants:\n${participants}\n\nMessages:\n${messages}`;
    
    // Create and download the file
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-${room.code}-${format(room.createdAt, 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to view a chat
  const viewChat = (roomId: string) => {
    if (onViewTranscript) {
      onViewTranscript(roomId);
    } else {
      // Fallback behavior when onViewTranscript is not provided
      console.log("View chat", roomId);
      alert("Chat viewing functionality coming soon!");
    }
  };

  if (savedRooms.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Saved Chats</CardTitle>
          <CardDescription>
            No saved chats yet. Create and end a chat to see it here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Saved Chats</CardTitle>
        <CardDescription>
          Your ended chat sessions
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-4 p-4">
            {savedRooms.map(room => (
              <div key={room.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{room.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Code: <span className="font-mono">{room.code}</span>
                    </p>
                  </div>
                  <Badge variant={room.endedAt ? "secondary" : "default"}>
                    {room.endedAt ? "Ended" : "Active"}
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground mb-2">
                  <p>Created: {format(room.createdAt, 'MMM dd, yyyy - h:mm a')}</p>
                  {room.endedAt && (
                    <p>Ended: {format(room.endedAt, 'MMM dd, yyyy - h:mm a')}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 mb-3">
                  <Users size={14} />
                  <span className="text-sm">{room.participants.length} participants</span>
                </div>

                <Separator className="my-3" />

                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex gap-1"
                    onClick={() => viewChat(room.id)}
                  >
                    <Eye size={14} />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex gap-1"
                    onClick={() => exportChat(room.id)}
                  >
                    <Download size={14} />
                    Export
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SavedChatsList;
