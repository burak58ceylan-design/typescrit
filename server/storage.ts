
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

// Data directory
const DATA_DIR = join(process.cwd(), 'data');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// File paths
const USERS_FILE = join(DATA_DIR, 'users.json');
const KEYS_FILE = join(DATA_DIR, 'keys.json');
const SESSIONS_FILE = join(DATA_DIR, 'sessions.json');
const LOGS_FILE = join(DATA_DIR, 'logs.json');

// Type definitions
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

// File operations
function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (!existsSync(filePath)) {
      writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const data = readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return defaultValue;
  }
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  
  // License key operations
  getLicenseKey(id: string): Promise<LicenseKey | undefined>;
  getLicenseKeyByKey(key: string): Promise<LicenseKey | undefined>;
  getLicenseKeyByName(keyName: string): Promise<LicenseKey | undefined>;
  getLicenseKeyByKeyOrName(keyOrName: string): Promise<LicenseKey | undefined>;
  createLicenseKey(licenseKey: InsertLicenseKey): Promise<LicenseKey>;
  updateLicenseKey(id: string, updates: Partial<LicenseKey>): Promise<LicenseKey>;
  deleteLicenseKey(id: string): Promise<void>;
  getUserLicenseKeys(userId: string): Promise<LicenseKey[]>;
  getAllLicenseKeys(): Promise<LicenseKey[]>;
  
  // Session management
  createActiveSession(session: InsertActiveSession): Promise<ActiveSession>;
  removeActiveSession(keyId: string, hwid: string): Promise<void>;
  getActiveSessionsForKey(keyId: string): Promise<ActiveSession[]>;
  cleanExpiredSessions(): Promise<void>;
  
  // API logs
  createApiLog(log: InsertApiLog): Promise<ApiLog>;
  getApiLogs(limit?: number): Promise<ApiLog[]>;
  
  // Dashboard stats
  getDashboardStats(): Promise<{
    totalUsers: number;
    activeKeys: number;
    apiRequests: number;
    activeSessions: number;
  }>;
}

export class JsonFileStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const users = readJsonFile<User[]>(USERS_FILE, []);
    return users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = readJsonFile<User[]>(USERS_FILE, []);
    return users.find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = readJsonFile<User[]>(USERS_FILE, []);
    return users.find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const users = readJsonFile<User[]>(USERS_FILE, []);
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const newUser: User = {
      id: randomUUID(),
      ...insertUser,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    writeJsonFile(USERS_FILE, users);
    return newUser;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const users = readJsonFile<User[]>(USERS_FILE, []);
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    writeJsonFile(USERS_FILE, users);
    return users[userIndex];
  }

  async deleteUser(id: string): Promise<void> {
    const users = readJsonFile<User[]>(USERS_FILE, []);
    const filteredUsers = users.filter(user => user.id !== id);
    writeJsonFile(USERS_FILE, filteredUsers);
  }

  async getAllUsers(): Promise<User[]> {
    const users = readJsonFile<User[]>(USERS_FILE, []);
    return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getLicenseKey(id: string): Promise<LicenseKey | undefined> {
    const keys = readJsonFile<LicenseKey[]>(KEYS_FILE, []);
    return keys.find(key => key.id === id);
  }

  async getLicenseKeyByKey(key: string): Promise<LicenseKey | undefined> {
    const keys = readJsonFile<LicenseKey[]>(KEYS_FILE, []);
    return keys.find(licenseKey => licenseKey.key === key);
  }

  async getLicenseKeyByName(keyName: string): Promise<LicenseKey | undefined> {
    const keys = readJsonFile<LicenseKey[]>(KEYS_FILE, []);
    return keys.find(licenseKey => licenseKey.keyName === keyName);
  }

  async getLicenseKeyByKeyOrName(keyOrName: string): Promise<LicenseKey | undefined> {
    let licenseKey = await this.getLicenseKeyByKey(keyOrName);
    if (!licenseKey) {
      licenseKey = await this.getLicenseKeyByName(keyOrName);
    }
    return licenseKey;
  }

  async createLicenseKey(insertLicenseKey: InsertLicenseKey): Promise<LicenseKey> {
    const keys = readJsonFile<LicenseKey[]>(KEYS_FILE, []);
    
    const newKey: LicenseKey = {
      id: randomUUID(),
      key: '',
      currentUsers: 0,
      lastUsed: null,
      hwids: [],
      ...insertLicenseKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    keys.push(newKey);
    writeJsonFile(KEYS_FILE, keys);
    return newKey;
  }

  async updateLicenseKey(id: string, updates: Partial<LicenseKey>): Promise<LicenseKey> {
    const keys = readJsonFile<LicenseKey[]>(KEYS_FILE, []);
    const keyIndex = keys.findIndex(key => key.id === id);
    
    if (keyIndex === -1) {
      throw new Error('License key not found');
    }
    
    keys[keyIndex] = {
      ...keys[keyIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    writeJsonFile(KEYS_FILE, keys);
    return keys[keyIndex];
  }

  async deleteLicenseKey(id: string): Promise<void> {
    // Delete API logs for this key
    const logs = readJsonFile<ApiLog[]>(LOGS_FILE, []);
    const filteredLogs = logs.filter(log => log.keyId !== id);
    writeJsonFile(LOGS_FILE, filteredLogs);
    
    // Delete the license key
    const keys = readJsonFile<LicenseKey[]>(KEYS_FILE, []);
    const filteredKeys = keys.filter(key => key.id !== id);
    writeJsonFile(KEYS_FILE, filteredKeys);
  }

  async getUserLicenseKeys(userId: string): Promise<LicenseKey[]> {
    const keys = readJsonFile<LicenseKey[]>(KEYS_FILE, []);
    return keys.filter(key => key.userId === userId);
  }

  async getAllLicenseKeys(): Promise<LicenseKey[]> {
    const keys = readJsonFile<LicenseKey[]>(KEYS_FILE, []);
    return keys.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createApiLog(log: InsertApiLog): Promise<ApiLog> {
    const logs = readJsonFile<ApiLog[]>(LOGS_FILE, []);
    
    const newLog: ApiLog = {
      id: randomUUID(),
      ...log,
      createdAt: new Date().toISOString(),
    };
    
    logs.push(newLog);
    writeJsonFile(LOGS_FILE, logs);
    return newLog;
  }

  async getApiLogs(limit: number = 100): Promise<any[]> {
    const logs = readJsonFile<ApiLog[]>(LOGS_FILE, []);
    const keys = readJsonFile<LicenseKey[]>(KEYS_FILE, []);
    
    return logs
      .map(log => {
        const key = keys.find(k => k.id === log.keyId);
        return {
          id: log.id,
          endpoint: log.endpoint,
          method: log.method,
          keyId: log.keyId,
          keyName: key?.keyName || null,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          response: log.response,
          success: log.success,
          hwid: log.hwid,
          timestamp: log.createdAt
        };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  async createActiveSession(sessionData: InsertActiveSession): Promise<ActiveSession> {
    const sessions = readJsonFile<ActiveSession[]>(SESSIONS_FILE, []);
    
    // Remove existing session with same keyId and hwid
    const filteredSessions = sessions.filter(
      session => !(session.keyId === sessionData.keyId && session.hwid === sessionData.hwid)
    );
    
    const newSession: ActiveSession = {
      id: randomUUID(),
      ...sessionData,
      createdAt: new Date().toISOString(),
    };
    
    filteredSessions.push(newSession);
    writeJsonFile(SESSIONS_FILE, filteredSessions);
    return newSession;
  }

  async removeActiveSession(keyId: string, hwid: string): Promise<void> {
    const sessions = readJsonFile<ActiveSession[]>(SESSIONS_FILE, []);
    const filteredSessions = sessions.filter(
      session => !(session.keyId === keyId && session.hwid === hwid)
    );
    writeJsonFile(SESSIONS_FILE, filteredSessions);
  }

  async getActiveSessionsForKey(keyId: string): Promise<ActiveSession[]> {
    const sessions = readJsonFile<ActiveSession[]>(SESSIONS_FILE, []);
    return sessions.filter(session => session.keyId === keyId);
  }

  async cleanExpiredSessions(): Promise<void> {
    const sessions = readJsonFile<ActiveSession[]>(SESSIONS_FILE, []);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const activeSessions = sessions.filter(session => 
      new Date(session.lastSeen) > fiveMinutesAgo
    );
    
    writeJsonFile(SESSIONS_FILE, activeSessions);
  }

  async getDashboardStats(): Promise<{
    totalUsers: number;
    activeKeys: number;
    apiRequests: number;
    activeSessions: number;
  }> {
    const users = readJsonFile<User[]>(USERS_FILE, []);
    const keys = readJsonFile<LicenseKey[]>(KEYS_FILE, []);
    const logs = readJsonFile<ApiLog[]>(LOGS_FILE, []);
    const sessions = readJsonFile<ActiveSession[]>(SESSIONS_FILE, []);
    
    return {
      totalUsers: users.length,
      activeKeys: keys.filter(key => key.status === "active").length,
      apiRequests: logs.length,
      activeSessions: sessions.length,
    };
  }
}

export const storage = new JsonFileStorage();
