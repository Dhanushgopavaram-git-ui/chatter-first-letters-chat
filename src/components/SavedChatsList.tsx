
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useChat } from '@/contexts/ChatContext';
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const SavedChatsList: React.FC<{
  onViewTranscript: (roomId: string) => void;
}> = ({ onViewTranscript }) => {
  const { savedRooms } = useChat();
  
  if (savedRooms.length === 0) {
    return (
      <Card className="w-full max-w-md mx-auto animate-fade-in">
        <CardHeader>
          <CardTitle className="text-xl">Saved Chats</CardTitle>
          <CardDescription>
            No saved chats yet. Create and end a chat to see it here.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl">Saved Chats</CardTitle>
        <CardDescription>
          View transcripts from ended chat rooms
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          {savedRooms.map((room, index) => (
            <React.Fragment key={room.id}>
              {index > 0 && <Separator />}
              <div className="p-4 hover:bg-accent transition-colors cursor-pointer" onClick={() => onViewTranscript(room.id)}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">{room.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      Ended {format(room.endedAt || 0, 'MMM dd, yyyy h:mm a')}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={(e) => {
                    e.stopPropagation();
                    onViewTranscript(room.id);
                  }}>
                    View
                  </Button>
                </div>
                <p className="text-sm line-clamp-1">
                  {room.messages.length} messages · {room.participants.length} participants
                </p>
              </div>
            </React.Fragment>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SavedChatsList;
