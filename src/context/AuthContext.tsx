import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, Address, UserSession } from '../types';
import { INITIAL_USER, INITIAL_SESSIONS } from '../data/mockData';

interface AuthContextType {
  user: UserProfile | null;
  isGuest: boolean;
  isAdmin: boolean;
  sessions: UserSession[];
  login: (email: string, role?: 'CUSTOMER' | 'ADMIN') => void;
  register: (name: string, email: string) => void;
  logout: () => void;
  loginAsAdmin: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  terminateSession: (sessionId: string) => void;
  updateNotificationPreferences: (prefs: Partial<UserProfile['notificationPreferences']>) => void;
  updatePrivacyPreferences: (prefs: Partial<UserProfile['privacyPreferences']>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode; onLoginMerge?: () => void }> = ({
  children,
  onLoginMerge,
}) => {
  // Start with customer logged in by default for smooth portfolio preview, but allow switching to guest or admin
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('cartwise_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_USER;
      }
    }
    return INITIAL_USER;
  });

  const [sessions, setSessions] = useState<UserSession[]>(INITIAL_SESSIONS);

  useEffect(() => {
    if (user) {
      localStorage.setItem('cartwise_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('cartwise_user');
    }
  }, [user]);

  const login = (email: string, role: 'CUSTOMER' | 'ADMIN' = 'CUSTOMER') => {
    const loggedUser: UserProfile = {
      ...INITIAL_USER,
      email,
      role,
      name: role === 'ADMIN' ? 'Sarah Chen (Admin)' : email.split('@')[0].replace('.', ' '),
    };
    setUser(loggedUser);
    if (onLoginMerge) {
      onLoginMerge();
    }
  };

  const loginAsAdmin = () => {
    login('admin@cartwise.com', 'ADMIN');
  };

  const register = (name: string, email: string) => {
    const newUser: UserProfile = {
      ...INITIAL_USER,
      id: `usr-${Date.now()}`,
      name,
      email,
      role: 'CUSTOMER',
      emailVerified: false,
      addresses: [],
    };
    setUser(newUser);
    if (onLoginMerge) {
      onLoginMerge();
    }
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  const addAddress = (addressData: Omit<Address, 'id'>) => {
    if (!user) return;
    const newAddress: Address = {
      ...addressData,
      id: `addr-${Date.now()}`,
      isDefaultShipping: user.addresses.length === 0 ? true : addressData.isDefaultShipping,
    };
    let updatedAddresses = [...user.addresses];
    if (newAddress.isDefaultShipping) {
      updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefaultShipping: false }));
    }
    setUser({ ...user, addresses: [...updatedAddresses, newAddress] });
  };

  const updateAddress = (id: string, updates: Partial<Address>) => {
    if (!user) return;
    let updated = user.addresses.map((addr) => {
      if (addr.id === id) {
        return { ...addr, ...updates };
      }
      if (updates.isDefaultShipping) {
        return { ...addr, isDefaultShipping: false };
      }
      return addr;
    });
    setUser({ ...user, addresses: updated });
  };

  const deleteAddress = (id: string) => {
    if (!user) return;
    setUser({ ...user, addresses: user.addresses.filter((a) => a.id !== id) });
  };

  const terminateSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const updateNotificationPreferences = (prefs: Partial<UserProfile['notificationPreferences']>) => {
    if (!user) return;
    setUser({
      ...user,
      notificationPreferences: { ...user.notificationPreferences, ...prefs },
    });
  };

  const updatePrivacyPreferences = (prefs: Partial<UserProfile['privacyPreferences']>) => {
    if (!user) return;
    setUser({
      ...user,
      privacyPreferences: { ...user.privacyPreferences, ...prefs },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest: user === null,
        isAdmin: user?.role === 'ADMIN',
        sessions,
        login,
        register,
        logout,
        loginAsAdmin,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
        terminateSession,
        updateNotificationPreferences,
        updatePrivacyPreferences,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
