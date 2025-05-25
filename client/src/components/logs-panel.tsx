import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { AgentLog } from "@shared/schema";

export default function LogsPanel() {
  const { toast } = useToast();

  const { data: logs = [], isLoading } = useQuery<AgentLog[]>({
    queryKey: ['/api/logs'],
    refetchInterval: 10000, // Refresh every 10 seconds for real-time feel
  });

  const exportCSVMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/logs/export');
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'travel-agent-logs.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    },
    onSuccess: () => {
      toast({
        title: "Export Successful",
        description: "CSV file has been downloaded",
      });
    },
  });

  const sendToSheetsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/logs/sheets');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Google Sheets Updated",
        description: `${data.rows} rows sent successfully`,
      });
    },
  });

  return (
    <section id="logs" className="py-20 bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-playfair text-4xl md:text-5xl font-bold text-white mb-4">
            Real-time Agent Activity
          </h2>
          <p className="text-lg text-gray-300">Monitor live responses from our AI travel agents</p>
        </div>
        
        <div className="bg-gray-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white mb-4 sm:mb-0">Agent Response Logs</h3>
            <div className="flex space-x-4">
              <Button 
                onClick={() => exportCSVMutation.mutate()}
                disabled={exportCSVMutation.isPending}
                className="bg-secondary hover:bg-yellow-500 text-gray-900 font-semibold"
              >
                <i className="fas fa-download mr-2"></i>Export CSV
              </Button>
              <Button 
                onClick={() => sendToSheetsMutation.mutate()}
                disabled={sendToSheetsMutation.isPending}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold"
              >
                <i className="fab fa-google mr-2"></i>Send to Sheets
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex space-x-4">
                    <div className="h-4 bg-gray-700 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/6"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/6"></div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full text-white">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-4 font-semibold">Agent</th>
                    <th className="text-left py-3 px-4 font-semibold">Price</th>
                    <th className="text-left py-3 px-4 font-semibold">Hotel Rating</th>
                    <th className="text-left py-3 px-4 font-semibold">Delivery Time</th>
                    <th className="text-left py-3 px-4 font-semibold">Timestamp</th>
                    <th className="text-left py-3 px-4 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors">
                        <td className="py-3 px-4">{log.agent}</td>
                        <td className="py-3 px-4 font-semibold text-green-400">${log.price}</td>
                        <td className="py-3 px-4">
                          {Array.from({ length: log.hotelRating }).map((_, i) => (
                            <i key={i} className="fas fa-star text-yellow-400 text-xs"></i>
                          ))}
                        </td>
                        <td className="py-3 px-4">{log.deliveryTime}</td>
                        <td className="py-3 px-4 text-gray-300">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-300">{log.notes}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400">
                        <i className="fas fa-robot text-4xl mb-4 block"></i>
                        No agent activity yet. Submit a trip to see real-time logs.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
