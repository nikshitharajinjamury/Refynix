
import { UserRecord, VirtualEmail } from "../types";

/**
 * REFINYX IDENTITY SERVICE (MOCK BACKEND)
 * Mimics a real authentication server in a frontend-only environment.
 */

const STORAGE_KEY = 'refinyx_user_db';

// Helper to ensure at least one demo user exists
const seedDemoUser = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  const users: UserRecord[] = data ? JSON.parse(data) : [];
  
  if (!users.find(u => u.email === 'demo@refinyx.io')) {
    users.push({
      email: 'demo@refinyx.io',
      name: 'Demo Architect',
      verified: true
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }
};

export const authService = {
  getUsers: (): UserRecord[] => {
    seedDemoUser();
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveUser: (user: UserRecord) => {
    const users = authService.getUsers();
    const existingIndex = users.findIndex(u => u.email === user.email);
    if (existingIndex > -1) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  },

  signIn: async (email: string): Promise<{ success: boolean; user?: UserRecord; error?: string }> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));
    const users = authService.getUsers();
    const user = users.find(u => u.email === email);

    if (!user) return { success: false, error: "Identity not found. Please sign up or use Guest Access." };
    if (!user.verified) return { success: false, error: "Verification pending.", user };

    return { success: true, user };
  },

  signUp: async (email: string, name: string): Promise<{ success: boolean; code?: string; error?: string }> => {
    await new Promise(r => setTimeout(r, 1000));
    const users = authService.getUsers();
    
    if (users.find(u => u.email === email && u.verified)) {
      return { success: false, error: "Account already exists." };
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    authService.saveUser({ email, name, verified: false });
    
    return { success: true, code };
  },

  verifyCode: async (email: string, inputCode: string, targetCode: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(r => setTimeout(r, 500));
    if (inputCode === targetCode || inputCode === "123456") {
      const users = authService.getUsers();
      const user = users.find(u => u.email === email);
      if (user) {
        user.verified = true;
        authService.saveUser(user);
        return { success: true };
      }
    }
    return { success: false, error: "Invalid verification code." };
  }
};
