
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes, createHash } from "crypto";

// Type validation schemas
const insertUserSchema = {
  parse: (data: any) => {
    if (!data.username || !data.email || !data.password) {
      throw new Error('Missing required fields');
    }
    return {
      username: data.username,
      email: data.email,
      password: data.password,
      role: data.role || 'user',
      isActive: data.isActive !== undefined ? data.isActive : true
    };
  }
};

const insertLicenseKeySchema = {
  parse: (data: any) => {
    if (!data.keyName || !data.keyType) {
      throw new Error('Missing required fields');
    }
    return {
      keyName: data.keyName,
      keyType: data.keyType,
      maxUsers: data.maxUsers || 1,
      userId: data.userId,
      status: data.status || 'active',
      expiresAt: data.expiresAt || null
    };
  }
};

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key";

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware to check admin role
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await storage.createUser(userData);
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ 
        user: { ...user, password: undefined }, 
        token 
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(401).json({ message: 'Account suspended' });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
      
      res.json({ 
        user: { ...user, password: undefined }, 
        token 
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: 'Login failed' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    res.json({ ...req.user, password: undefined });
  });

  // User management routes (admin only)
  app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users.map(user => ({ ...user, password: undefined })));
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  });

  app.put('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const user = await storage.updateUser(id, updates);
      res.json({ ...user, password: undefined });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ message: 'Failed to update user' });
    }
  });

  app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUser(id);
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ message: 'Failed to delete user' });
    }
  });

  // License key routes
  app.get('/api/keys', authenticateToken, async (req: any, res) => {
    try {
      if (req.user.role === 'admin') {
        const keys = await storage.getAllLicenseKeys();
        res.json(keys);
      } else {
        const keys = await storage.getUserLicenseKeys(req.user.id);
        res.json(keys);
      }
    } catch (error) {
      console.error('Get keys error:', error);
      res.status(500).json({ message: 'Failed to fetch license keys' });
    }
  });

  app.post('/api/keys', authenticateToken, async (req: any, res) => {
    try {
      const keyData = insertLicenseKeySchema.parse(req.body);
      
      // Generate unique license key
      const key = randomBytes(16).toString('hex').toUpperCase();
      
      // Set expiration date based on key type
      let expiresAt = null;
      if (keyData.keyType === 'basic') {
        expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days
      } else if (keyData.keyType === 'premium') {
        expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 days
      }
      // lifetime keys don't expire

      const licenseKey = await storage.createLicenseKey({
        ...keyData,
        userId: req.user.id // Kullanıcının kendi ID'sini ata
      });
      
      // Update with generated key
      const updatedKey = await storage.updateLicenseKey(licenseKey.id, {
        key: key,
        expiresAt: expiresAt
      });
      
      res.json(updatedKey);
    } catch (error) {
      console.error('Create key error:', error);
      res.status(400).json({ message: 'Failed to create license key' });
    }
  });

  app.put('/api/keys/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const licenseKey = await storage.updateLicenseKey(id, updates);
      res.json(licenseKey);
    } catch (error) {
      console.error('Update key error:', error);
      res.status(500).json({ message: 'Failed to update license key' });
    }
  });

  app.delete('/api/keys/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteLicenseKey(id);
      res.json({ message: 'License key deleted successfully' });
    } catch (error) {
      console.error('Delete key error:', error);
      res.status(500).json({ message: 'Failed to delete license key' });
    }
  });

  // API for external connections (PUBG mod menu integration)
  const connectHandler = async (req, res) => {
    try {
      // Mod menu sends form data: game=PUBG&user_key={key}&serial={hwid}
      const { user_key, serial, game } = req.body;
      const key = user_key;
      const hwid = serial;
      
      if (!key) {
        await storage.createApiLog({
          endpoint: '/api/connect',
          method: 'POST',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || '',
          response: 'error: key required',
          success: false
        });
        return res.status(400).json({ 
          status: false, 
          reason: 'License key required' 
        });
      }

      if (!hwid) {
        await storage.createApiLog({
          endpoint: '/api/connect',
          method: 'POST',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || '',
          response: 'error: hwid required',
          success: false,
          hwid: hwid
        });
        return res.status(400).json({ 
          status: false, 
          reason: 'Hardware ID required' 
        });
      }

      const licenseKey = await storage.getLicenseKeyByKeyOrName(key);
      
      if (!licenseKey) {
        await storage.createApiLog({
          endpoint: '/api/connect',
          method: 'POST',
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || '',
          response: 'error: invalid key',
          success: false,
          hwid: hwid
        });
        return res.status(401).json({ 
          status: false, 
          reason: 'Invalid license key' 
        });
      }

      // Check if key is active
      if (licenseKey.status !== 'active') {
        await storage.createApiLog({
          endpoint: '/api/connect',
          method: 'POST',
          keyId: licenseKey.id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || '',
          response: 'error: key not active',
          success: false,
          hwid: hwid
        });
        return res.status(401).json({ 
          status: false, 
          reason: 'License key is suspended' 
        });
      }

      // Check if key has expired
      if (licenseKey.expiresAt && new Date() > new Date(licenseKey.expiresAt)) {
        await storage.updateLicenseKey(licenseKey.id, { status: 'expired' });
        await storage.createApiLog({
          endpoint: '/api/connect',
          method: 'POST',
          keyId: licenseKey.id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || '',
          response: 'error: key expired',
          success: false,
          hwid: hwid
        });
        return res.status(401).json({ 
          status: false, 
          reason: 'License key has expired' 
        });
      }

      // Clean expired sessions first
      await storage.cleanExpiredSessions();

      // Get current active sessions for this key
      const activeSessions = await storage.getActiveSessionsForKey(licenseKey.id);
      
      // Check if this HWID is already connected
      const existingSession = activeSessions.find(session => session.hwid === hwid);
      
      if (existingSession) {
        // Update existing session timestamp
        await storage.createActiveSession({
          keyId: licenseKey.id,
          hwid: hwid,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || '',
          lastSeen: new Date().toISOString()
        });
      } else {
        // Check if we've reached the max users limit
        if (activeSessions.length >= licenseKey.maxUsers) {
          await storage.createApiLog({
            endpoint: '/api/connect',
            method: 'POST',
            keyId: licenseKey.id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent') || '',
            response: 'error: max users reached',
            success: false,
            hwid: hwid
          });
          return res.status(429).json({ 
            status: false, 
            reason: `Maximum users limit reached (${licenseKey.maxUsers})` 
          });
        }

        // Create new session
        await storage.createActiveSession({
          keyId: licenseKey.id,
          hwid: hwid,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || '',
          lastSeen: new Date().toISOString()
        });
      }

      // Update license key statistics
      await storage.updateLicenseKey(licenseKey.id, { 
        lastUsed: new Date().toISOString(),
        currentUsers: activeSessions.length + (existingSession ? 0 : 1)
      });

      // Log successful connection
      await storage.createApiLog({
        endpoint: '/api/connect',
        method: 'POST',
        keyId: licenseKey.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || '',
        response: 'success: access granted',
        success: true,
        hwid: hwid
      });

      // Generate token and timestamp as expected by mod menu
      const currentTime = Math.floor(Date.now() / 1000);
      const authString = `PUBG-${key}-${hwid}-Vm8Lk7Uj2JmsjCPVPVjrLa7zgfx3uz9E`;
      const token = createHash('md5').update(authString).digest('hex');

      res.json({
        status: true,
        data: {
          token: token,
          rng: currentTime,
          keyName: licenseKey.keyName,
          keyType: licenseKey.keyType,
          expiresAt: licenseKey.expiresAt,
          maxUsers: licenseKey.maxUsers,
          currentUsers: activeSessions.length + (existingSession ? 0 : 1)
        }
      });
    } catch (error) {
      console.error('Connect API error:', error);
      res.status(500).json({ 
        status: false, 
        reason: 'Internal server error' 
      });
    }
  };
  
  // Register both /connect and /api/connect endpoints
  app.post('/connect', connectHandler);
  app.post('/api/connect', connectHandler);
  
  // API status endpoints - show that API is working
  app.get('/api/status', (req, res) => {
    res.json({
      status: true,
      message: "PUBG Mod Menu API Sistemi Aktif",
      storage: "JSON File Storage",
      endpoints: {
        connect: {
          url: "/connect veya /api/connect",
          method: "POST",
          format: "application/x-www-form-urlencoded",
          parameters: "game=PUBG&user_key={key_name}&serial={hwid}"
        },
        disconnect: {
          url: "/disconnect veya /api/disconnect", 
          method: "POST",
          format: "application/x-www-form-urlencoded",
          parameters: "user_key={key_name}&serial={hwid}"
        }
      },
      example: "curl -X POST /connect -d 'game=PUBG&user_key=Deneme&serial=hwid123'",
      timestamp: new Date().toISOString()
    });
  });
  
  // Also add it to /connect for production use
  app.get('/connect', (req, res) => {
    res.json({
      status: true,
      message: "PUBG Mod Menu API Endpoint Aktif",
      storage: "JSON File Storage",
      info: "Bu endpoint POST istekleri için hazırlanmıştır.",
      usage: {
        method: "POST",
        contentType: "application/x-www-form-urlencoded",
        parameters: {
          game: "PUBG",
          user_key: "key_ismi_veya_key",
          serial: "hwid"
        }
      },
      example: "curl -X POST /connect -d 'game=PUBG&user_key=Deneme&serial=hwid123'"
    });
  });

  // API for disconnecting from mod menu
  const disconnectHandler = async (req, res) => {
    try {
      const { user_key: key, serial: hwid } = req.body;
      
      if (!key || !hwid) {
        return res.status(400).json({ 
          status: false, 
          reason: 'License key and hardware ID required' 
        });
      }

      const licenseKey = await storage.getLicenseKeyByKeyOrName(key);
      
      if (licenseKey) {
        // Remove the session
        await storage.removeActiveSession(licenseKey.id, hwid);
        
        // Update current users count
        const activeSessions = await storage.getActiveSessionsForKey(licenseKey.id);
        await storage.updateLicenseKey(licenseKey.id, { 
          currentUsers: activeSessions.length 
        });

        // Log the disconnection
        await storage.createApiLog({
          endpoint: '/api/disconnect',
          method: 'POST',
          keyId: licenseKey.id,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || '',
          response: 'success: disconnected',
          success: true,
          hwid: hwid
        });
      }

      res.json({
        status: true
      });
    } catch (error) {
      console.error('Disconnect API error:', error);
      res.status(500).json({ 
        status: false, 
        reason: 'Internal server error' 
      });
    }
  };
  
  // Register both /disconnect and /api/disconnect endpoints
  app.post('/disconnect', disconnectHandler);
  app.post('/api/disconnect', disconnectHandler);

  // Validate key endpoint
  app.post('/api/validate', async (req, res) => {
    try {
      const { key } = req.body;
      
      const licenseKey = await storage.getLicenseKeyByKey(key);
      
      if (!licenseKey) {
        return res.json({ valid: false, message: 'Invalid key' });
      }

      const isExpired = licenseKey.expiresAt && new Date() > new Date(licenseKey.expiresAt);
      const isActive = licenseKey.status === 'active';

      res.json({
        valid: isActive && !isExpired,
        keyType: licenseKey.keyType,
        status: licenseKey.status,
        expiresAt: licenseKey.expiresAt
      });
    } catch (error) {
      console.error('Validate key error:', error);
      res.status(500).json({ valid: false, message: 'Validation failed' });
    }
  });

  // Dashboard stats
  app.get('/api/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  });

  // API logs
  app.get('/api/logs', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const logs = await storage.getApiLogs(50);
      res.json(logs);
    } catch (error) {
      console.error('Get logs error:', error);
      res.status(500).json({ message: 'Failed to fetch logs' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
