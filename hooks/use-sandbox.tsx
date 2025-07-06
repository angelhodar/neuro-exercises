import { useState, useTransition } from "react";
import {
  createOrConnectToSandbox as createOrConnectToSandboxAction,
  checkSandboxStatus as checkSandboxStatusAction,
  stopSandbox as stopSandboxAction,
  type SandboxResult,
} from "@/app/actions/sandbox";

type SandboxStatus = SandboxResult;

interface UseSandboxReturn {
  isCreating: boolean;
  isChecking: boolean;
  isStopping: boolean;
  sandboxStatus: SandboxStatus | null;
  createOrConnectToSandbox: (slug: string) => Promise<void>;
  checkSandboxStatus: (slug: string) => Promise<void>;
  stopSandbox: (slug: string) => Promise<void>;
}

export function useSandbox(): UseSandboxReturn {
  const [isCreating, startCreateTransition] = useTransition();
  const [isChecking, startCheckTransition] = useTransition();
  const [isStopping, startStopTransition] = useTransition();
  const [sandboxStatus, setSandboxStatus] = useState<SandboxStatus | null>(
    null,
  );

  const createOrConnectToSandbox = async (slug: string) => {
    startCreateTransition(async () => {
      const result = await createOrConnectToSandboxAction(slug);
      setSandboxStatus(result);
    });
  };

  const checkSandboxStatus = async (slug: string) => {
    startCheckTransition(async () => {
      const result = await checkSandboxStatusAction(slug);
      setSandboxStatus(result);
    });
  };

  const stopSandbox = async () => {
    if (!sandboxStatus?.sandboxId) return;

    startStopTransition(async () => {
      const result = await stopSandboxAction(sandboxStatus.sandboxId);
      setSandboxStatus(result);
    });
  };

  return {
    isCreating,
    isChecking,
    isStopping,
    sandboxStatus,
    createOrConnectToSandbox,
    checkSandboxStatus,
    stopSandbox,
  };
}
