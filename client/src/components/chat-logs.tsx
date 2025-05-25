import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatLog {
  id: number;
  tripId: number;
  agent: string;
  messageType: "user" | "agent";
  message: string;
  timestamp: string;
  metadata?: {
    step?: string;
    specialty?: string;
    personality?: string;
  };
}

interface ChatLogsProps {
  tripId: number;
}

export default function ChatLogs({ tripId }: ChatLogsProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const { data: chatLogs, isLoading } = useQuery({
    queryKey: [`/api/chat-logs/trip/${tripId}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/chat-logs/trip/${tripId}`);
      return response.json() as Promise<ChatLog[]>;
    },
    enabled: !!tripId
  });

  const agents = ["TravelBot Pro", "VoyageAI", "JourneyGenie", "WanderBot", "ExploreAI"];
  
  const getAgentColor = (agent: string) => {
    const colors = {
      "TravelBot Pro": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      "VoyageAI": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      "JourneyGenie": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      "WanderBot": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      "ExploreAI": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      "User": "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    };
    return colors[agent as keyof typeof colors] || colors["User"];
  };

  const getAgentIcon = (agent: string) => {
    const icons = {
      "TravelBot Pro": "👑",
      "VoyageAI": "🏛️",
      "JourneyGenie": "🏔️",
      "WanderBot": "💰",
      "ExploreAI": "✨",
      "User": "👤"
    };
    return icons[agent as keyof typeof icons] || "🤖";
  };

  const filteredLogs = selectedAgent 
    ? chatLogs?.filter(log => log.agent === selectedAgent || log.agent === "User")
    : chatLogs;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-comments text-primary"></i>
            Agent Conversations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="shimmer-loading w-8 h-8 rounded-full mr-3"></div>
            <span className="text-muted-foreground">Loading conversations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <i className="fas fa-comments text-primary"></i>
          Agent Conversations
        </CardTitle>
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => setSelectedAgent(null)}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              !selectedAgent 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            All Agents
          </button>
          {agents.map(agent => (
            <button
              key={agent}
              onClick={() => setSelectedAgent(agent)}
              className={`px-3 py-1 rounded-full text-sm transition-all ${
                selectedAgent === agent 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {getAgentIcon(agent)} {agent}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full pr-4">
          <div className="space-y-4">
            {filteredLogs?.map((log) => (
              <div
                key={log.id}
                className={`flex gap-3 ${
                  log.messageType === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {log.messageType === "agent" && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className={getAgentColor(log.agent)}>
                      {getAgentIcon(log.agent)}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    log.messageType === "user"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-gray-100 dark:bg-gray-800 text-foreground"
                  }`}
                >
                  {log.messageType === "agent" && (
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className={getAgentColor(log.agent)}>
                        {log.agent}
                      </Badge>
                      {log.metadata?.specialty && (
                        <Badge variant="outline" className="text-xs">
                          {log.metadata.specialty}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <p className="text-sm leading-relaxed">{log.message}</p>
                  
                  <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                    <span>
                      {new Date(log.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {log.metadata?.step && (
                      <span className="text-xs">
                        {log.metadata.step.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                </div>

                {log.messageType === "user" && (
                  <Avatar className="w-8 h-8 mt-1">
                    <AvatarFallback className={getAgentColor("User")}>
                      👤
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        
        {(!filteredLogs || filteredLogs.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <i className="fas fa-comment-slash text-4xl mb-4 opacity-50"></i>
            <p>No conversations found for this trip.</p>
            <p className="text-sm">Chat logs will appear here after agents process your request.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
