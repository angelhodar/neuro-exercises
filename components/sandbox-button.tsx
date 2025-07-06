"use client";

import { Button, ButtonProps } from "@/components/ui/button";
import { useSandbox } from "@/hooks/use-sandbox";
import { ExternalLink, Play, Loader2, Square } from "lucide-react";
import { useEffect } from "react";

interface SandboxButtonProps extends ButtonProps {
  slug: string;
}

export function SandboxButton({ slug, className }: SandboxButtonProps) {
  const {
    isCreating,
    isChecking,
    isStopping,
    sandboxStatus,
    createOrConnectToSandbox,
    checkSandboxStatus,
    stopSandbox,
  } = useSandbox();

  // Check sandbox status on mount
  useEffect(() => {
    checkSandboxStatus(slug);
  }, []);

  const handleCreateSandbox = async () => {
    await createOrConnectToSandbox(slug);
  };

  const handleStopSandbox = async () => {
    await stopSandbox(slug);
  };

  const handleOpenSandbox = () => {
    if (sandboxStatus?.status === "running") {
      window.open(sandboxStatus.sandboxUrl, "_blank");
    }
  };

  // Show loading state while checking
  if (isChecking) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Checking sandbox...
      </Button>
    );
  }

  // Show existing sandbox with controls
  if (sandboxStatus?.status === "running") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button variant="default" size="sm" onClick={handleOpenSandbox}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Sandbox
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleStopSandbox}
          disabled={isStopping}
        >
          {isStopping ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Stopping...
            </>
          ) : (
            <>
              <Square className="h-4 w-4 mr-2" />
              Stop
            </>
          )}
        </Button>
      </div>
    );
  }

  // Show paused sandbox
  if (sandboxStatus?.status === "paused") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button variant="secondary" size="sm" disabled>
          <Play className="h-4 w-4 mr-2" />
          Paused
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleStopSandbox}
          disabled={isStopping}
        >
          {isStopping ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Stopping...
            </>
          ) : (
            <>
              <Square className="h-4 w-4 mr-2" />
              Stop
            </>
          )}
        </Button>
      </div>
    );
  }

  // Show create button
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCreateSandbox}
      disabled={isCreating}
      className={className}
    >
      {isCreating ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Creating sandbox...
        </>
      ) : (
        <>
          <Play className="h-4 w-4 mr-2" />
          Deploy to Sandbox
        </>
      )}
    </Button>
  );
}
