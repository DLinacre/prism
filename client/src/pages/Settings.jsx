import { useState, useEffect } from 'react';
import { User, Bell, Palette, Shield, Save, Accessibility, Keyboard } from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Input, Select, Button, Avatar } from '../components/ui';
import useAuthStore from '../stores/authStore';
import useAppStore from '../stores/appStore';
import styles from './Settings.module.css';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
  { id: 'security', label: 'Security', icon: Shield }
];

const timezoneOptions = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' }
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const { user, updateProfile } = useAuthStore();
  const { addToast } = useAppStore();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    timezone: user?.timezone || 'UTC'
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly: false,
    mentions: true
  });

  // Accessibility settings
  const [a11y, setA11y] = useState({
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    screenReader: false,
    keyboardNav: true
  });

  useEffect(() => {
    // Load user preferences
    const savedA11y = localStorage.getItem('prism-a11y');
    if (savedA11y) {
      setA11y(JSON.parse(savedA11y));
    }
    
    // Check system preferences
    setA11y(prev => ({
      ...prev,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: more)').matches
    }));
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(profile);
      addToast({ type: 'success', message: 'Profile updated successfully' });
    } catch (err) {
      addToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleA11yChange = (key, value) => {
    setA11y(prev => {
      const newA11y = { ...prev, [key]: value };
      localStorage.setItem('prism-a11y', JSON.stringify(newA11y));
      return newA11y;
    });
  };

  return (
    <div className={styles.page}>
      <Header title="Settings" subtitle="Manage your account and preferences" />

      <div className={styles.content}>
        <div className={styles.layout}>
          {/* Tabs */}
          <nav className={styles.tabs} role="tablist" aria-label="Settings navigation">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={activeTab === id}
                aria-controls={`panel-${id}`}
                id={`tab-${id}`}
                className={`${styles.tab} ${activeTab === id ? styles.active : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className={styles.panel}>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card className={styles.card} id="panel-profile" role="tabpanel" aria-labelledby="tab-profile">
                <h2 className={styles.cardTitle}>Profile Information</h2>
                <p className={styles.cardDesc}>Update your personal details</p>

                <form onSubmit={handleSaveProfile} className={styles.form}>
                  <div className={styles.avatarSection}>
                    <Avatar name={profile.name} size="xl" />
                    <button type="button" className={styles.changeAvatar}>
                      Change avatar
                    </button>
                  </div>

                  <Input
                    label="Full name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    aria-describedby="name-help"
                  />
                  <span id="name-help" className="sr-only">Enter your full name</span>

                  <Input
                    label="Email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />

                  <Select
                    label="Timezone"
                    options={timezoneOptions}
                    value={profile.timezone}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                  />

                  <div className={styles.formActions}>
                    <Button type="submit" loading={saving} icon={Save}>
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card className={styles.card} id="panel-notifications" role="tabpanel" aria-labelledby="tab-notifications">
                <h2 className={styles.cardTitle}>Notification Preferences</h2>
                <p className={styles.cardDesc}>Choose how you want to be notified</p>

                <div className={styles.toggleList} role="group" aria-label="Notification settings">
                  <label className={styles.toggleItem}>
                    <div className={styles.toggleInfo}>
                      <span className={styles.toggleLabel}>Email notifications</span>
                      <span className={styles.toggleDesc}>Receive task updates via email</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                      className={styles.toggle}
                      role="switch"
                      aria-checked={notifications.email}
                    />
                  </label>

                  <label className={styles.toggleItem}>
                    <div className={styles.toggleInfo}>
                      <span className={styles.toggleLabel}>Push notifications</span>
                      <span className={styles.toggleDesc}>Get notified in your browser</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                      className={styles.toggle}
                      role="switch"
                      aria-checked={notifications.push}
                    />
                  </label>

                  <label className={styles.toggleItem}>
                    <div className={styles.toggleInfo}>
                      <span className={styles.toggleLabel}>Weekly digest</span>
                      <span className={styles.toggleDesc}>Summary of your team's activity</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.weekly}
                      onChange={(e) => setNotifications({ ...notifications, weekly: e.target.checked })}
                      className={styles.toggle}
                      role="switch"
                      aria-checked={notifications.weekly}
                    />
                  </label>

                  <label className={styles.toggleItem}>
                    <div className={styles.toggleInfo}>
                      <span className={styles.toggleLabel}>Mentions</span>
                      <span className={styles.toggleDesc}>Notify when someone mentions you</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.mentions}
                      onChange={(e) => setNotifications({ ...notifications, mentions: e.target.checked })}
                      className={styles.toggle}
                      role="switch"
                      aria-checked={notifications.mentions}
                    />
                  </label>
                </div>
              </Card>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <Card className={styles.card} id="panel-appearance" role="tabpanel" aria-labelledby="tab-appearance">
                <h2 className={styles.cardTitle}>Appearance</h2>
                <p className={styles.cardDesc}>Customize how Prism looks</p>

                <div className={styles.themeSection}>
                  <h3 className={styles.sectionLabel}>Theme</h3>
                  <div className={styles.themeOptions} role="radiogroup" aria-label="Theme selection">
                    <button className={`${styles.themeOption} ${styles.active}`} role="radio" aria-checked="true">
                      <div className={styles.themePreview} data-theme="dark" />
                      <span>Dark</span>
                    </button>
                    <button className={styles.themeOption} role="radio" aria-checked="false">
                      <div className={styles.themePreview} data-theme="light" />
                      <span>Light</span>
                    </button>
                    <button className={styles.themeOption} role="radio" aria-checked="false">
                      <div className={styles.themePreview} data-theme="system" />
                      <span>System</span>
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {/* Accessibility Tab */}
            {activeTab === 'accessibility' && (
              <Card className={styles.card} id="panel-accessibility" role="tabpanel" aria-labelledby="tab-accessibility">
                <h2 className={styles.cardTitle}>Accessibility</h2>
                <p className={styles.cardDesc}>Customize accessibility features for a better experience</p>

                <div className={styles.a11ySection}>
                  <div className={styles.a11yInfo}>
                    <Keyboard aria-hidden="true" />
                    <div>
                      <h4>Keyboard Navigation</h4>
                      <p>Use Tab, Enter, and arrow keys to navigate</p>
                    </div>
                  </div>
                  
                  <div className={styles.toggleList} role="group" aria-label="Accessibility settings">
                    <label className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>Reduce motion</span>
                        <span className={styles.toggleDesc}>Minimize animations and transitions</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={a11y.reducedMotion}
                        onChange={(e) => handleA11yChange('reducedMotion', e.target.checked)}
                        className={styles.toggle}
                        role="switch"
                        aria-checked={a11y.reducedMotion}
                      />
                    </label>

                    <label className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>High contrast</span>
                        <span className={styles.toggleDesc}>Increase color contrast for better visibility</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={a11y.highContrast}
                        onChange={(e) => handleA11yChange('highContrast', e.target.checked)}
                        className={styles.toggle}
                        role="switch"
                        aria-checked={a11y.highContrast}
                      />
                    </label>

                    <label className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>Large text</span>
                        <span className={styles.toggleDesc}>Increase base font size</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={a11y.largeText}
                        onChange={(e) => handleA11yChange('largeText', e.target.checked)}
                        className={styles.toggle}
                        role="switch"
                        aria-checked={a11y.largeText}
                      />
                    </label>

                    <label className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>Screen reader optimized</span>
                        <span className={styles.toggleDesc}>Enhanced announcements and labels</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={a11y.screenReader}
                        onChange={(e) => handleA11yChange('screenReader', e.target.checked)}
                        className={styles.toggle}
                        role="switch"
                        aria-checked={a11y.screenReader}
                      />
                    </label>

                    <label className={styles.toggleItem}>
                      <div className={styles.toggleInfo}>
                        <span className={styles.toggleLabel}>Keyboard shortcuts</span>
                        <span className={styles.toggleDesc}>Enable keyboard shortcuts for power users</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={a11y.keyboardNav}
                        onChange={(e) => handleA11yChange('keyboardNav', e.target.checked)}
                        className={styles.toggle}
                        role="switch"
                        aria-checked={a11y.keyboardNav}
                      />
                    </label>
                  </div>
                </div>

                <div className={styles.a11yHelp}>
                  <h4>Keyboard Shortcuts</h4>
                  <ul className={styles.shortcutList}>
                    <li><kbd>Tab</kbd> Navigate forward</li>
                    <li><kbd>Shift + Tab</kbd> Navigate backward</li>
                    <li><kbd>Enter</kbd> Activate / Select</li>
                    <li><kbd>Escape</kbd> Close modals</li>
                    <li><kbd>Ctrl + K</kbd> Quick search</li>
                  </ul>
                </div>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card className={styles.card} id="panel-security" role="tabpanel" aria-labelledby="tab-security">
                <h2 className={styles.cardTitle}>Security</h2>
                <p className={styles.cardDesc}>Manage your account security</p>

                <div className={styles.securitySection}>
                  <h3 className={styles.sectionLabel}>Password</h3>
                  <p className={styles.securityDesc}>
                    Change your password to keep your account secure
                  </p>
                  <Button variant="secondary">Change Password</Button>
                </div>

                <div className={styles.securitySection}>
                  <h3 className={styles.sectionLabel}>Active Sessions</h3>
                  <p className={styles.securityDesc}>
                    You're currently signed in on this device
                  </p>
                  <Button variant="secondary">Manage Sessions</Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
