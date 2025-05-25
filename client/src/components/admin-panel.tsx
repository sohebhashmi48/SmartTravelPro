import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Agent } from "@shared/schema";

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: agents = [], isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<{
    avgPrice: number;
    mostPopularDestination: string;
    fastestConfirmation: string;
  }>({
    queryKey: ['/api/analytics'],
  });

  const updateAgentMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await apiRequest('PATCH', `/api/agents/${id}`, { isActive });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({
        title: "Agent Updated",
        description: "Agent status changed successfully",
      });
    },
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="admin-panel h-full p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-playfair text-3xl font-bold text-white">Admin Panel</h2>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-white hover:text-gray-300"
            >
              <i className="fas fa-times text-2xl"></i>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Agent Management */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                <i className="fas fa-users mr-2"></i>Agent Management
              </h3>
              {agentsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-700 p-4 rounded-lg">
                      <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {agents.map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                      <span className="text-white">{agent.name}</span>
                      <Switch
                        checked={agent.isActive}
                        onCheckedChange={(checked) => 
                          updateAgentMutation.mutate({ id: agent.id, isActive: checked })
                        }
                        disabled={updateAgentMutation.isPending}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Analytics */}
            <div className="bg-gray-800 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                <i className="fas fa-chart-bar mr-2"></i>Analytics
              </h3>
              {analyticsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-700 p-4 rounded-lg">
                      <div className="h-4 bg-gray-600 rounded w-1/3 mb-2"></div>
                      <div className="h-6 bg-gray-600 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : analytics ? (
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-gray-300 text-sm">Average Price</div>
                    <div className="text-white text-2xl font-bold">
                      ${analytics.avgPrice.toFixed(0)}
                    </div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-gray-300 text-sm">Most Popular Destination</div>
                    <div className="text-white text-2xl font-bold">
                      {analytics.mostPopularDestination}
                    </div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg">
                    <div className="text-gray-300 text-sm">Fastest Confirmation</div>
                    <div className="text-white text-2xl font-bold">
                      {analytics.fastestConfirmation}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
