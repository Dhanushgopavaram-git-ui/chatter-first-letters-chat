
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChat } from '@/contexts/ChatContext';
import { useToast } from "@/components/ui/use-toast";
import { Share, QrCode } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const JoinRoomForm: React.FC = () => {
  const [roomCode, setRoomCode] = useState('');
  const [userName, setUserName] = useState('');
  const { joinRoom, activeRoom } = useChat();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomCode.trim() || !userName.trim()) {
      toast({
        title: "Error",
        description: "Room code and your name are required",
        variant: "destructive"
      });
      return;
    }
    
    const success = joinRoom(roomCode.trim().toUpperCase(), userName);
    
    if (!success) {
      toast({
        title: "Error",
        description: "Room not found or already ended",
        variant: "destructive"
      });
    }
  };

  const copyRoomCodeToClipboard = () => {
    if (!activeRoom) return;
    
    navigator.clipboard.writeText(activeRoom.code);
    toast({
      title: "Copied!",
      description: "Room code copied to clipboard",
    });
  };

  const shareRoomCode = () => {
    if (!activeRoom) return;
    
    if (navigator.share) {
      navigator.share({
        title: `Join my chat room: ${activeRoom.name}`,
        text: `Join my chat room with code: ${activeRoom.code}`,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      copyRoomCodeToClipboard();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Join a Chat Room</CardTitle>
        <CardDescription className="text-center">
          Enter a room code to join an existing chat
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="roomCode">Room Code</Label>
            <Input
              id="roomCode"
              placeholder="Enter the 6-character room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              Ask the room host for their 6-character code to join.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="userName">Your Name</Label>
            <Input
              id="userName"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              You'll be identified by the first letter of your name.
            </p>
          </div>
          {activeRoom && (
            <Dialog>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="w-full flex gap-2">
                  <Share size={16} />
                  Share Room Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Share Room Code</DialogTitle>
                  <DialogDescription>
                    Share this code with others to join your chat room.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="share-code">Room Code</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="share-code" 
                        value={activeRoom.code} 
                        readOnly 
                        className="font-mono text-center text-lg" 
                      />
                      <Button onClick={copyRoomCodeToClipboard} variant="outline">
                        Copy
                      </Button>
                    </div>
                  </div>
                  <Button onClick={shareRoomCode} className="w-full">
                    <Share size={16} className="mr-2" /> 
                    Share
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Join Room
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default JoinRoomForm;
