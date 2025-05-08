import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LangGraphLogoSVG } from "@/components/icons/langgraph";
import { toast } from "sonner";

interface AccessCodeProps {
  onAccessGranted: () => void;
}

export function AccessCode({ onAccessGranted }: AccessCodeProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Get the access code from environment variable and trim any whitespace
    const accessCode = process.env.NEXT_PUBLIC_ACCESS_CODE?.trim();
    const enteredCode = code.trim();
    
    // For debugging
    console.log('Entered code:', enteredCode);
    console.log('Expected code:', accessCode);
    console.log('Length of entered code:', enteredCode.length);
    console.log('Length of expected code:', accessCode?.length);
    
    // Check if the codes match (case-insensitive)
    if (enteredCode.toLowerCase() === accessCode?.toLowerCase()) {
      // Store access in localStorage
      window.localStorage.setItem("lg:chat:hasAccess", "true");
      onAccessGranted();
    } else {
      toast.error("Invalid access code", {
        description: "Please try again with the correct code.",
        duration: 3000,
        richColors: true,
        closeButton: true,
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="animate-in fade-in-0 zoom-in-95 bg-background flex max-w-md flex-col rounded-lg border shadow-lg">
        <div className="mt-14 flex flex-col gap-2 border-b p-6">
          <div className="flex flex-col items-start gap-2">
            <LangGraphLogoSVG className="h-7" />
            <h1 className="text-xl font-semibold tracking-tight">
              Vibe Trader Agent
            </h1>
          </div>
          <p className="text-muted-foreground">
            Please enter the access code to continue.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-muted/50 flex flex-col gap-6 p-6"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="accessCode">Access Code</Label>
            <Input
              id="accessCode"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="bg-background"
              placeholder="Enter access code"
              required
            />
          </div>

          <div className="mt-2 flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Checking..." : "Continue"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 