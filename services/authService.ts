
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

const API_URL = 'http://localhost:8000/auth';

export const authService = {
  getUsers: (): UserRecord[] => {
    // Not needed for real backend, but keeping for compatibility if any other component uses it
    return [];
  },

  signIn: async (email: string, password: string): Promise<{ success: boolean; user?: UserRecord; token?: string; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.detail || "Login failed" };
      }

      // Store token
      localStorage.setItem('refinyx_token', data.access_token);

      return {
        success: true,
        user: { email, name: data.user_name, verified: true, token: data.access_token },
        token: data.access_token
      };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  },

  signUp: async (email: string, name: string, password: string): Promise<{ success: boolean; code?: string; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, full_name: name, password })
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.detail || "Registration failed" };
      }

      return { success: true, code: "CHECK_SERVER_LOGS" };
    } catch (error) {
      console.error("Signup Error Details:", error);
      return { success: false, error: "Network error - check console" };
    }
  },

  verifyCode: async (email: string, inputCode: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: inputCode })
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.detail || "Verification failed" };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return { success: response.ok };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  },

  resetPassword: async (email: string, code: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, new_password: newPassword })
      });
      if (!response.ok) return { success: false, error: "Reset failed" };
      return { success: true };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  },

  googleLogin: async (token: string): Promise<{ success: boolean; user?: UserRecord; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();
      if (!response.ok) return { success: false, error: "Google Login failed" };

      localStorage.setItem('refinyx_token', data.access_token);
      return {
        success: true,
        user: { email: "google@user.com", name: data.user_name, verified: true, token: data.access_token }
      };
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  }
};
