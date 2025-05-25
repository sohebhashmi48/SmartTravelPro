import { apiRequest } from "./queryClient";

export interface TripData {
  destination: string;
  duration: string;
  travelType: string;
  budget: string;
  departureDate: string;
  returnDate: string;
}

export async function createTrip(data: TripData) {
  const response = await apiRequest('POST', '/api/trips', data);
  return response.json();
}

export async function getDeals() {
  const response = await apiRequest('GET', '/api/deals');
  return response.json();
}

export async function getLogs() {
  const response = await apiRequest('GET', '/api/logs');
  return response.json();
}

export async function exportLogsCSV() {
  const response = await fetch('/api/logs/export');
  return response.blob();
}

export async function sendLogsToSheets() {
  const response = await apiRequest('POST', '/api/logs/sheets');
  return response.json();
}

export async function getAgents() {
  const response = await apiRequest('GET', '/api/agents');
  return response.json();
}

export async function updateAgent(id: number, data: any) {
  const response = await apiRequest('PATCH', `/api/agents/${id}`, data);
  return response.json();
}

export async function getAnalytics() {
  const response = await apiRequest('GET', '/api/analytics');
  return response.json();
}
