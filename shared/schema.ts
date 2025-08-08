// Type definitions for JSON file storage
// No need for drizzle-orm schemas

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LicenseKey {
  id: string;
  key: string;
  keyName: string;
  userId: string;
  keyType: string;
  status: string;
  maxUsers: number;
  currentUsers: number;
  expiresAt: string | null;
  lastUsed: string | null;
  hwids: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ActiveSession {
  id: string;
  keyId: string;
  hwid: string;
  ipAddress: string;
  userAgent: string;
  lastSeen: string;
  createdAt: string;
}

export interface ApiLog {
  id: string;
  endpoint: string;
  method: string;
  userId?: string;
  keyId?: string;
  hwid?: string;
  ipAddress: string;
  userAgent: string;
  response: string;
  success: boolean;
  createdAt: string;
}

export type InsertUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertLicenseKey = Omit<LicenseKey, 'id' | 'key' | 'currentUsers' | 'lastUsed' | 'hwids' | 'createdAt' | 'updatedAt'>;
export type InsertActiveSession = Omit<ActiveSession, 'id' | 'createdAt'>;
export type InsertApiLog = Omit<ApiLog, 'id' | 'createdAt'>;