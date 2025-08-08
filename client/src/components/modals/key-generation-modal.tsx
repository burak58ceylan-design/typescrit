import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KeyGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyGenerationModal({ isOpen, onClose }: KeyGenerationModalProps) {
  const [keyType, setKeyType] = useState("");
  const [keyName, setKeyName] = useState("");
  const [maxUsers, setMaxUsers] = useState("1");
  const [generatedKey, setGeneratedKey] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateKeyMutation = useMutation({
    mutationFn: async (data: { keyType: string; keyName: string; maxUsers: number }) => {
      const response = await apiRequest("POST", "/api/keys", data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedKey(data.key);
      queryClient.invalidateQueries({ queryKey: ["/api/keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Success",
        description: "License key generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate license key",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!keyType) {
      toast({
        title: "Error",
        description: "Please select a key type",
        variant: "destructive",
      });
      return;
    }

    if (!keyName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a key name",
        variant: "destructive",
      });
      return;
    }

    if (!maxUsers || parseInt(maxUsers) < 1) {
      toast({
        title: "Error",
        description: "Max users must be at least 1",
        variant: "destructive",
      });
      return;
    }

    generateKeyMutation.mutate({ 
      keyType,
      keyName: keyName.trim(),
      maxUsers: parseInt(maxUsers)
    });
  };

  const handleClose = () => {
    setKeyType("");
    setKeyName("");
    setMaxUsers("1");
    setGeneratedKey("");
    onClose();
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedKey);
    toast({
      title: "Copied",
      description: "License key copied to clipboard",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate New License Key</DialogTitle>
          <DialogDescription>
            Create a new license key for your application
          </DialogDescription>
        </DialogHeader>

        {!generatedKey ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="keyName">Key Name</Label>
              <Input
                id="keyName"
                type="text"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="My PUBG Mod Key"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="keyType">Key Type</Label>
              <Select value={keyType} onValueChange={setKeyType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select key type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic - 30 days</SelectItem>
                  <SelectItem value="premium">Premium - 90 days</SelectItem>
                  <SelectItem value="lifetime">Lifetime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="maxUsers">Max Users</Label>
              <Input
                id="maxUsers"
                type="number"
                min="1"
                max="100"
                value={maxUsers}
                onChange={(e) => setMaxUsers(e.target.value)}
                placeholder="1"
                className="mt-1"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Number of people who can use this key simultaneously
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={generateKeyMutation.isPending}
                className="flex-1"
              >
                {generateKeyMutation.isPending ? "Generating..." : "Generate Key"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <Label>Generated License Key</Label>
              <div className="mt-2 p-3 bg-gray-100 rounded-lg border">
                <code className="text-sm font-mono break-all">{generatedKey}</code>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={copyToClipboard} className="flex-1">
                Copy Key
              </Button>
              <Button onClick={handleClose} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
