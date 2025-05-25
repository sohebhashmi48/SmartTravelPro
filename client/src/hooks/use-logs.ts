import { useQuery } from "@tanstack/react-query";
import type { AgentLog } from "@shared/schema";

export function useLogs() {
  return useQuery<AgentLog[]>({
    queryKey: ['/api/logs'],
    refetchInterval: 10000, // Refresh every 10 seconds
  });
}
