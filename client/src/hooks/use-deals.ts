import { useQuery } from "@tanstack/react-query";
import type { Deal } from "@shared/schema";

export function useDeals() {
  return useQuery<Deal[]>({
    queryKey: ['/api/deals'],
    enabled: false, // Only fetch when explicitly triggered
  });
}
