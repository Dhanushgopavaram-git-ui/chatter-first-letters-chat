
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChat } from '@/contexts/ChatContext';
import { useToast } from "@/components/ui/use-toast";

const CreateRoomForm: React.FC = () => {
  const [roomName, setRoomName] = useState('');
  const [hostName, setHostName] = useState('');
  const { createRoom } = useChat();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomName.trim() || !hostName.trim()) {
      toast({
        title: "Error",
        description: "Room name and host name are required",
        variant: "destructive"
      });
      return;
    }
    
    createRoom(roomName, hostName);
    toast({
      title: "Success",
      description: "Room created successfully!",
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create a Chat Room</CardTitle>
        <CardDescription className="text-center">
          Start a new anonymous chat session
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomName">Room Name</Label>
            <Input
              id="roomName"
              placeholder="Enter a name for your room"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hostName">Your Name</Label>
            <Input
              id="hostName"
              placeholder="Enter your name"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              You'll be identified as "H" in the chat.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Create Room
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreateRoomForm;
