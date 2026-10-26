export interface User {
  id?: string | number;
  email: string;
  full_name?: string | null;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  user?: User;
}

export type RequestType = 'EQUIPMENT' | 'LEAVE' | 'ACCESS' | 'BUDGET' | 'OTHER';
export type RequestUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface RequestTicket {
  id: string;
  _id?: string;
  title: string;
  description: string;
  type: RequestType;
  urgency: RequestUrgency;
  status: RequestStatus;
  requester_email: string;
  superior_email: string;
  comment?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRequestPayload {
  title: string;
  description: string;
  type: RequestType;
  urgency: RequestUrgency;
  superior_email: string;
}

export interface UpdateStatusPayload {
  status: RequestStatus;
  comment?: string;
}
