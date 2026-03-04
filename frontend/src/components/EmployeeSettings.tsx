import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { 
  User, 
  Lock, 
  Bell, 
  Monitor, 
  Shield, 
  Calendar,
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
  Clock,
  Settings
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const EmployeeSettings = () => {
  const { user, updateUserProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const [settings, setSettings] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+1 234 567 8900',
    address: '123 Main Street, City, State',
    workingHours: '9:00 AM - 5:00 PM',
    skills: 'React, TypeScript, Node.js',
    communicationMode: 'email',
    emailNotifications: true,
    smsNotifications: false,
    leaveNotifications: true,
    profileViews: true,
    twoFactorAuth: false,
    backupContact: 'backup@company.com'
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setProfileImage(imageUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (section: string) => {
    setIsLoading(true);
    
    try {
      // If we're saving personal info and there's a profile image, update it
      if (section === 'personal' && profileImage) {
        await updateUserProfile({
          name: settings.name,
          avatar: profileImage
        });
      } else if (section === 'personal') {
        await updateUserProfile({
          name: settings.name
        });
      }
      
      // Simulate API call for other sections
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Updated",
        description: `Your ${section} settings have been saved successfully.`,
      });
      
      // Clear the temporary profile image state after saving
      if (section === 'personal' && profileImage) {
        setProfileImage(null);
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating your settings. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  // Display the uploaded image or the user's current avatar
  const displayAvatar = profileImage || user?.avatar;

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'account', label: 'Account', icon: Lock },
    { id: 'work', label: 'Work Preferences', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'display', label: 'Display', icon: Monitor },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Employee Settings
        </h1>
        <p className="text-gray-600 mt-2">Manage your account and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </motion.div>

        {/* Settings Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3"
        >
          {/* Personal Information */}
          {activeTab === 'personal' && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-2xl text-white overflow-hidden">
                      {displayAvatar?.startsWith('data:') ? (
                        <img 
                          src={displayAvatar} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{displayAvatar || '👤'}</span>
                      )}
                    </div>
                    <label className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors cursor-pointer">
                      <Camera className="h-3 w-3" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="font-medium">{user?.name}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        value={settings.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={settings.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="pl-10"
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        value={settings.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="address"
                        value={settings.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => handleSave('personal')} 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Work Preferences */}
          {activeTab === 'work' && (
            <Card>
              <CardHeader>
                <CardTitle>Work Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="workingHours">Working Hours</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="workingHours"
                        value={settings.workingHours}
                        onChange={(e) => handleChange('workingHours', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="communicationMode">Communication Mode</Label>
                    <select
                      id="communicationMode"
                      value={settings.communicationMode}
                      onChange={(e) => handleChange('communicationMode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="email">Email</option>
                      <option value="slack">Slack</option>
                      <option value="teams">Microsoft Teams</option>
                      <option value="phone">Phone</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skills & Technologies</Label>
                  <Textarea
                    id="skills"
                    value={settings.skills}
                    onChange={(e) => handleChange('skills', e.target.value)}
                    placeholder="List your skills and technologies..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupContact">Backup Contact (during leave)</Label>
                  <Input
                    id="backupContact"
                    value={settings.backupContact}
                    onChange={(e) => handleChange('backupContact', e.target.value)}
                    placeholder="colleague@company.com"
                  />
                </div>

                <Button 
                  onClick={() => handleSave('work')} 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Display Settings */}
          {activeTab === 'display' && (
            <Card>
              <CardHeader>
                <CardTitle>Display & Theme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium">Dark Mode</h3>
                    <p className="text-sm text-gray-500">Toggle between light and dark themes</p>
                  </div>
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="w-full h-20 bg-white border rounded mb-2"></div>
                    <p className="text-sm">Light Theme</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="w-full h-20 bg-gray-800 border rounded mb-2"></div>
                    <p className="text-sm">Dark Theme</p>
                  </div>
                </div>

                <Button 
                  onClick={() => handleSave('display')} 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Display Settings'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                  { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive text message alerts' },
                  { key: 'profileViews', label: 'Profile View Alerts', desc: 'Know when someone views your profile' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h3 className="font-medium">{item.label}</h3>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                    <Switch
                      checked={settings[item.key as keyof typeof settings] as boolean}
                      onCheckedChange={(checked) => handleChange(item.key, checked)}
                    />
                  </div>
                ))}

                <Button 
                  onClick={() => handleSave('notifications')} 
                  disabled={isLoading}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Notification Settings'}
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};
