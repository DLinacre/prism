import { useState } from 'react';
import { User, Bell, Palette, Shield, Save } from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Input, Select, Button, Avatar } from '../components/ui';
import useAuthStore from '../stores/authStore';
import useAppStore from '../stores/appStore';
import styles from './Settings.module.css';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
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

  return (
    <div className={styles.page}>
      <Header title="Settings" subtitle="Manage your account and preferences" />

      <div className={styles.content}>
        <div className={styles.layout}>
          {/* Tabs */}
          <nav className={styles.tabs}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`${styles.tab} ${activeTab === id ? styles.active : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon />
                {label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className={styles.panel}>
            {activeTab === 'profile' && (
              <Card className={styles.card}>
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
                  />

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

            {activeTab === 'notifications' && (
              <Card className={styles.card}>
                <h2 className={styles.cardTitle}>Notification Preferences</h2>
                <p className={styles.cardDesc}>Choose how you want to be notified</p>

                <div className={styles.toggleList}>
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
                    />
                  </label>
                </div>
              </Card>
            )}

            {activeTab === 'appearance' && (
              <Card className={styles.card}>
                <h2 className={styles.cardTitle}>Appearance</h2>
                <p className={styles.cardDesc}>Customize how Prism looks</p>

                <div className={styles.themeSection}>
                  <h3 className={styles.sectionLabel}>Theme</h3>
                  <div className={styles.themeOptions}>
                    <button className={`${styles.themeOption} ${styles.active}`}>
                      <div className={styles.themePreview} data-theme="dark" />
                      <span>Dark</span>
                    </button>
                    <button className={styles.themeOption}>
                      <div className={styles.themePreview} data-theme="light" />
                      <span>Light</span>
                    </button>
                    <button className={styles.themeOption}>
                      <div className={styles.themePreview} data-theme="system" />
                      <span>System</span>
                    </button>
                  </div>
                </div>
              </Card>
            )}

            {activeTab === 'security' && (
              <Card className={styles.card}>
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
