
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChat } from '@/contexts/ChatContext';
import { useToast } from "@/components/ui/use-toast";
import { Share, Copy, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CreateRoomForm: React.FC = () => {
  const [roomName, setRoomName] = useState<string>('');
  const [hostName, setHostName] = useState<string>('');
  const { createRoom, activeRoom } = useChat();
  const { toast } = useToast();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!roomName.trim()) {
      toast({
        title: "Error",
        description: "Room name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!hostName.trim()) {
      toast({
        title: "Error",
        description: "Host name is required",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Create the room
      const newRoom = createRoom(roomName.trim(), hostName.trim());
      
      toast({
        title: "Success",
        description: `Room created successfully! Your code is ${newRoom.code}`,
      });
      
      // Open share dialog automatically
      setIsShareDialogOpen(true);
    } catch (error) {
      console.error("Error creating room:", error);
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
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
    
    const shareText = `Join my chat room "${activeRoom.name}" with code: ${activeRoom.code}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Join my chat room: ${activeRoom.name}`,
        text: shareText,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      copyRoomCodeToClipboard();
    }
  };

  return (
    <>
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
                aria-required="true"
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
                aria-required="true"
              />
              <p className="text-xs text-muted-foreground">
                You'll be identified as "H" in the chat.
              </p>
            </div>
            
            {activeRoom && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You already have an active room. Creating a new room will end your current session.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Create Room
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {/* Share Room Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Room Created Successfully!</DialogTitle>
            <DialogDescription>
              Share this code with others so they can join your chat room.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col space-y-4 py-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="roomCode">Room Code</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  id="roomCode" 
                  value={activeRoom?.code || ''} 
                  readOnly 
                  className="font-mono text-lg text-center"
                />
                <Button variant="outline" size="icon" onClick={copyRoomCodeToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-2">How others can join:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Share this 6-character code with others</li>
                <li>They need to visit this application's URL</li>
                <li>Click on "Join Room" and enter the code</li>
                <li>Enter their name and join the conversation</li>
              </ol>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={copyRoomCodeToClipboard} variant="outline" className="gap-2">
              <Copy className="h-4 w-4" /> Copy Code
            </Button>
            <Button onClick={shareRoomCode} className="gap-2">
              <Share className="h-4 w-4" /> Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateRoomForm;
