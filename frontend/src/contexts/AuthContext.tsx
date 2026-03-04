
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  avatar?: string;
  department?: string;
}

interface RegisteredUser extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithOAuth: (provider: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<boolean>;
  verifyOTP: (otp: string) => Promise<boolean>;
  updatePassword: (newPassword: string) => Promise<boolean>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; role: 'admin' | 'employee'; department: string }) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to compress base64 images
const compressImage = (base64: string, maxSizeKB: number = 500): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate new dimensions to keep aspect ratio
      let { width, height } = img;
      const maxDimension = 300; // Max width/height
      
      if (width > height && width > maxDimension) {
        height = (height * maxDimension) / width;
        width = maxDimension;
      } else if (height > maxDimension) {
        width = (width * maxDimension) / height;
        height = maxDimension;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Compress with quality reduction
      let quality = 0.8;
      let compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      
      // Reduce quality until size is acceptable
      while (compressedBase64.length > maxSizeKB * 1024 && quality > 0.1) {
        quality -= 0.1;
        compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      }
      
      resolve(compressedBase64);
    };
    img.src = base64;
  });
};

// Helper function to safely save to localStorage
const safeLocalStorageSet = async (key: string, value: any): Promise<boolean> => {
  try {
    const stringValue = JSON.stringify(value);
    
    // Check if the value is too large (over 4MB)
    if (stringValue.length > 4 * 1024 * 1024) {
      console.warn('Data too large for localStorage, attempting compression...');
      
      // If it's user data with an avatar, try to compress the avatar
      if (key === 'user' && value.avatar && value.avatar.startsWith('data:')) {
        const compressedAvatar = await compressImage(value.avatar, 200);
        const compressedUser = { ...value, avatar: compressedAvatar };
        const compressedString = JSON.stringify(compressedUser);
        
        if (compressedString.length > 4 * 1024 * 1024) {
          // Still too large, remove avatar
          const userWithoutAvatar = { ...value, avatar: '👤' };
          localStorage.setItem(key, JSON.stringify(userWithoutAvatar));
          toast({
            title: "Image too large",
            description: "Profile image was too large and has been reset to default.",
            variant: "destructive",
          });
          return false;
        } else {
          localStorage.setItem(key, compressedString);
          return true;
        }
      }
      
      throw new Error('Data too large for localStorage');
    }
    
    localStorage.setItem(key, stringValue);
    return true;
  } catch (error) {
    console.error('localStorage error:', error);
    
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // Clear some space by removing old data or large items
      try {
        // Try to clear and set just the essential data
        if (key === 'user') {
          const essentialUser = {
            id: value.id,
            name: value.name,
            email: value.email,
            role: value.role,
            avatar: '👤', // Reset to default emoji
            department: value.department
          };
          localStorage.clear(); // Clear all data
          localStorage.setItem(key, JSON.stringify(essentialUser));
          
          toast({
            title: "Storage limit reached",
            description: "Your profile image was reset due to storage limitations.",
            variant: "destructive",
          });
          return false;
        }
      } catch (retryError) {
        console.error('Failed to save essential data:', retryError);
        toast({
          title: "Storage Error",
          description: "Unable to save data. Please try refreshing the page.",
          variant: "destructive",
        });
        return false;
      }
    }
    
    toast({
      title: "Storage Error",
      description: "Failed to save data to local storage.",
      variant: "destructive",
    });
    return false;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading user from localStorage:', error);
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [resetEmail, setResetEmail] = useState<string>('');

  // Get registered users from localStorage
  const getRegisteredUsers = (): RegisteredUser[] => {
    try {
      const stored = localStorage.getItem('registeredUsers');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading registered users:', error);
    }
    
    // Default users if none exist
    const defaultUsers = [
      { id: '1', email: 'admin@worksphere.com', password: 'admin123', name: 'Admin User', role: 'admin' as const, avatar: '👨‍💼', department: 'Management' },
      { id: '2', email: 'supritha@company.com', password: 'emp123', name: 'Supritha Vallela', role: 'employee' as const, avatar: '👩‍💻', department: 'Engineering' },
      { id: '3', email: 'harshad@company.com', password: 'emp123', name: 'Harshad', role: 'employee' as const, avatar: '👨‍🎨', department: 'Design' },
      { id: '4', email: 'saraswathi@company.com', password: 'emp123', name: 'Saraswathi', role: 'employee' as const, avatar: '👩‍💼', department: 'Marketing' },
      { id: '5', email: 'kavitha@company.com', password: 'emp123', name: 'Kavitha', role: 'employee' as const, avatar: '👩‍💼', department: 'HR' },
      { id: '6', email: 'dheeraja@company.com', password: 'emp123', name: 'Dheeraja', role: 'employee' as const, avatar: '👨‍🔧', department: 'Engineering' },
      { id: '7', email: 'sruthi@company.com', password: 'emp123', name: 'Sruthi', role: 'employee' as const, avatar: '👩‍🔬', department: 'Quality Assurance' },
      { id: '8', email: 'govind@company.com', password: 'emp123', name: 'Govind Sir', role: 'employee' as const, avatar: '👨‍💼', department: 'Management' },
      { id: '9', email: 'vijayalakshmi@company.com', password: 'emp123', name: 'Vijayalakshmi Mam', role: 'employee' as const, avatar: '👩‍🏫', department: 'Training' },
      { id: '10', email: 'mahalakshmi@company.com', password: 'emp123', name: 'Mahalakshmi Mam', role: 'employee' as const, avatar: '👩‍🏫', department: 'Training' },
      { id: '11', email: 'meghana@company.com', password: 'emp123', name: 'Meghana Mam', role: 'employee' as const, avatar: '👩‍🏫', department: 'Training' }
    ];
    
    safeLocalStorageSet('registeredUsers', defaultUsers);
    return defaultUsers;
  };

  const saveRegisteredUsers = (users: RegisteredUser[]) => {
    safeLocalStorageSet('registeredUsers', users);
  };

  useEffect(() => {
    if (user) {
      safeLocalStorageSet('user', user);
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const registeredUsers = getRegisteredUsers();
    const foundUser = registeredUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      
      toast({
        title: "Welcome back! 👋",
        description: `Logged in successfully as ${foundUser.name}`,
      });
      
      return true;
    }
    
    toast({
      title: "Login Failed",
      description: "Invalid email or password. Please check your credentials.",
      variant: "destructive",
    });
    
    return false;
  };

  const register = async (userData: { name: string; email: string; password: string; role: 'admin' | 'employee'; department: string }): Promise<boolean> => {
    try {
      const registeredUsers = getRegisteredUsers();
      
      // Check if email already exists
      if (registeredUsers.find(u => u.email === userData.email)) {
        toast({
          title: "Registration Failed",
          description: "An account with this email already exists.",
          variant: "destructive",
        });
        return false;
      }

      const newUser: RegisteredUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        avatar: userData.role === 'admin' ? '👨‍💼' : '👤',
        department: userData.department
      };

      const updatedUsers = [...registeredUsers, newUser];
      saveRegisteredUsers(updatedUsers);

      toast({
        title: "Registration Successful! 🎉",
        description: `Account created for ${userData.name}. You can now login.`,
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const loginWithOAuth = async (provider: string): Promise<boolean> => {
    const demoUser = {
      id: 'oauth-' + provider,
      email: `user@${provider}.com`,
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      role: 'employee' as const,
      avatar: provider === 'google' ? '🔍' : '👤',
      department: 'General'
    };

    setUser(demoUser);
    setIsAuthenticated(true);
    
    toast({
      title: "Welcome! 👋",
      description: `Logged in successfully with ${provider}`,
    });
    
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    
    toast({
      title: "Goodbye! 👋",
      description: "You have been logged out successfully.",
    });
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    const registeredUsers = getRegisteredUsers();
    const userExists = registeredUsers.find(u => u.email === email);
    
    if (!userExists) {
      toast({
        title: "User Not Found",
        description: "No account found with this email address.",
        variant: "destructive",
      });
      return false;
    }
    
    setResetEmail(email);
    toast({
      title: "Password Reset Sent! 📧",
      description: "Check your email for reset instructions. Use OTP: 123456",
    });
    return true;
  };

  const verifyOTP = async (otp: string): Promise<boolean> => {
    return otp === '123456';
  };

  const updatePassword = async (newPassword: string): Promise<boolean> => {
    if (!resetEmail) {
      toast({
        title: "Error",
        description: "No reset session found. Please start the reset process again.",
        variant: "destructive",
      });
      return false;
    }

    const registeredUsers = getRegisteredUsers();
    const userIndex = registeredUsers.findIndex(u => u.email === resetEmail);
    
    if (userIndex === -1) {
      toast({
        title: "Error",
        description: "User not found.",
        variant: "destructive",
      });
      return false;
    }

    // Update the password
    registeredUsers[userIndex].password = newPassword;
    saveRegisteredUsers(registeredUsers);
    
    // Clear reset email
    setResetEmail('');
    
    toast({
      title: "Password Updated! 🔐",
      description: "Your password has been updated successfully. You can now login with your new password.",
    });
    return true;
  };

  const updateUserProfile = async (updates: Partial<User>): Promise<void> => {
    if (user) {
      let processedUpdates = { ...updates };
      
      // Compress avatar if it's a base64 image
      if (updates.avatar && updates.avatar.startsWith('data:')) {
        try {
          processedUpdates.avatar = await compressImage(updates.avatar, 200);
        } catch (error) {
          console.error('Error compressing image:', error);
          processedUpdates.avatar = '👤'; // Fallback to default
        }
      }
      
      const updatedUser = { ...user, ...processedUpdates };
      setUser(updatedUser);
      
      // Also update in registered users if it's a profile change
      const registeredUsers = getRegisteredUsers();
      const userIndex = registeredUsers.findIndex(u => u.email === user.email);
      if (userIndex !== -1) {
        registeredUsers[userIndex] = { ...registeredUsers[userIndex], ...processedUpdates };
        saveRegisteredUsers(registeredUsers);
      }
      
      toast({
        title: "Profile Updated! ✅",
        description: "Your profile has been updated successfully.",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        loginWithOAuth,
        logout,
        resetPassword,
        verifyOTP,
        updatePassword,
        updateUserProfile,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
