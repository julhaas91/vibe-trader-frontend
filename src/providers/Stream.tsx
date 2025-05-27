"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useStream } from "@langchain/langgraph-sdk/react";
import { type Message } from "@langchain/langgraph-sdk";
import {
  uiMessageReducer,
  isUIMessage,
  isRemoveUIMessage,
  type UIMessage,
  type RemoveUIMessage,
} from "@langchain/langgraph-sdk/react-ui";
import { useQueryState } from "nuqs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LangGraphLogoSVG } from "@/components/icons/langgraph";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { PasswordInput } from "@/components/ui/password-input";
import {
  getApiKey,
  getOrganizationId,
  getTenantId,
  getAssistantId,
  getDeploymentUrl,
} from "@/lib/api-key";
import { useThreads } from "./Thread";
import { toast } from "sonner";

export type StateType = { messages: Message[]; ui?: UIMessage[] };

const useTypedStream = useStream<
  StateType,
  {
    UpdateType: {
      messages?: Message[] | Message | string;
      ui?: (UIMessage | RemoveUIMessage)[] | UIMessage | RemoveUIMessage;
      context?: Record<string, unknown>;
    };
    CustomEventType: UIMessage | RemoveUIMessage;
  }
>;

type StreamContextType = ReturnType<typeof useTypedStream>;
const StreamContext = createContext<StreamContextType | undefined>(undefined);

async function sleep(ms = 4000) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkGraphStatus(
  apiUrl: string,
  apiKey: string | null,
  organizationId?: string,
  tenantId?: string,
): Promise<boolean> {
  try {
    // Instead of checking /info, we'll try to create a test thread
    const testMessage = {
      assistant_id: "test",
      input: {
        messages: [
          {
            role: "user",
            content: "test",
          },
        ],
      },
    };

    const res = await fetch(`${apiUrl}/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey && { "X-Api-Key": apiKey }),
        ...(organizationId && { "X-Organization-Id": organizationId }),
        ...(tenantId && { "X-Tenant-Id": tenantId }),
      },
      body: JSON.stringify(testMessage),
    });

    // If we get a 404 or 400, it might mean the endpoint exists but the test assistant_id is invalid
    // which is fine for our purposes - we just want to verify the server is reachable
    return res.ok || res.status === 404 || res.status === 400;
  } catch (e) {
    console.error(e);
    return false;
  }
}

const StreamSession = ({
  children,
  apiKey,
  apiUrl,
  assistantId,
  organizationId,
  tenantId,
}: {
  children: ReactNode;
  apiKey: string | null;
  apiUrl: string;
  assistantId: string;
  organizationId?: string;
  tenantId?: string;
}) => {
  const [threadId, setThreadId] = useQueryState("threadId");
  const { getThreads, setThreads } = useThreads();
  const streamValue = useTypedStream({
    apiUrl,
    apiKey: apiKey ?? undefined,
    assistantId,
    threadId: threadId ?? null,
    defaultHeaders: {
      ...(organizationId && { "X-Organization-Id": organizationId }),
      ...(tenantId && { "X-Tenant-Id": tenantId }),
    },
    onCustomEvent: (event, options) => {
      if (isUIMessage(event) || isRemoveUIMessage(event)) {
        options.mutate((prev) => {
          const ui = uiMessageReducer(prev.ui ?? [], event);
          return { ...prev, ui };
        });
      }
    },
    onThreadId: (id) => {
      setThreadId(id);
      // Refetch threads list when thread ID changes.
      // Wait for some seconds before fetching so we're able to get the new thread that was created.
      sleep().then(() => getThreads().then(setThreads).catch(console.error));
    },
  });

  useEffect(() => {
    checkGraphStatus(apiUrl, apiKey, organizationId, tenantId).then((ok) => {
      if (!ok) {
        toast.error("Failed to connect to LangGraph server", {
          description: () => (
            <p>
              Please ensure your graph is running at <code>{apiUrl}</code> and
              your API key is correctly set (if connecting to a deployed graph).
            </p>
          ),
          duration: 10000,
          richColors: true,
          closeButton: true,
        });
      }
    });
  }, [apiKey, apiUrl, organizationId, tenantId]);

  return (
    <StreamContext.Provider value={streamValue}>
      {children}
    </StreamContext.Provider>
  );
};

// Default values for the form
const DEFAULT_API_URL = "http://localhost:2024";
const DEFAULT_ASSISTANT_ID = "agent";

export const StreamProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Prevent hydration mismatch
  }

  // Read all configuration from environment variables
  const organizationId = process.env.NEXT_PUBLIC_X_ORGANIZATION_ID || "";
  const tenantId = process.env.NEXT_PUBLIC_X_TENANT_ID || "";
  const assistantId = process.env.NEXT_PUBLIC_ASSISTANT_ID || "";
  const deploymentUrl = process.env.NEXT_PUBLIC_LANGGRAPH_API_URL || "";
  const apiKey = process.env.NEXT_PUBLIC_LANGSMITH_API_KEY || "";

  return (
    <StreamSession
      apiKey={apiKey || null}
      apiUrl={deploymentUrl}
      assistantId={assistantId}
      organizationId={organizationId}
      tenantId={tenantId}
    >
      {children}
    </StreamSession>
  );
};

// Create a custom hook to use the context
export const useStreamContext = (): StreamContextType => {
  const context = useContext(StreamContext);
  if (context === undefined) {
    throw new Error("useStreamContext must be used within a StreamProvider");
  }
  return context;
};

export default StreamContext;
