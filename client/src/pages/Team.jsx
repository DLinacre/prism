import { useEffect, useState } from 'react';
import { Mail, Calendar, CheckCircle, Clock, UserPlus } from 'lucide-react';
import { Header } from '../components/layout';
import { Card, Avatar, Badge, Modal, Input, Select, Button } from '../components/ui';
import useAppStore from '../stores/appStore';
import { formatRelative, cn } from '../utils/helpers';
import styles from './Team.module.css';

const Team = () => {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  const { team, teamLoading, projects, fetchTeam, fetchProjects, inviteMember } = useAppStore();

  useEffect(() => {
    fetchTeam();
    fetchProjects();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail || projects.length === 0) return;

    try {
      await inviteMember(inviteEmail, projects[0].id, inviteRole);
      setInviteEmail('');
      setInviteRole('member');
      setShowInvite(false);
    } catch (err) {
      console.error('Invite failed:', err);
    }
  };

  const roleOptions = [
    { value: 'member', label: 'Member' },
    { value: 'admin', label: 'Admin' }
  ];

  return (
    <div className={styles.page}>
      <Header
        title="Team"
        subtitle={`${team.length} members`}
        actions={
          <Button icon={UserPlus} onClick={() => setShowInvite(true)}>
            Invite Member
          </Button>
        }
      />

      <div className={styles.content}>
        <div className={styles.teamGrid}>
          {team.map((member, index) => {
            const completionRate = member.total_tasks > 0
              ? Math.round((member.completed / member.total_tasks) * 100)
              : 0;

            return (
              <Card
                key={member.id}
                className={styles.memberCard}
                style={{ '--delay': `${index * 50}ms` }}
              >
                <div className={styles.memberHeader}>
                  <Avatar name={member.name} size="lg" />
                  <div className={styles.memberInfo}>
                    <h3 className={styles.memberName}>{member.name}</h3>
                    <p className={styles.memberEmail}>{member.email}</p>
                    <Badge size="sm" variant="accent">{member.role}</Badge>
                  </div>
                </div>

                <div className={styles.memberStats}>
                  <div className={styles.stat}>
                    <div className={styles.statValue}>
                      <CheckCircle className={styles.statIcon} />
                      {member.completed || 0}
                    </div>
                    <div className={styles.statLabel}>Completed</div>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.statValue}>
                      <Clock className={styles.statIcon} />
                      {member.in_progress || 0}
                    </div>
                    <div className={styles.statLabel}>In Progress</div>
                  </div>
                  <div className={styles.stat}>
                    <div className={styles.statValue}>{completionRate}%</div>
                    <div className={styles.statLabel}>Rate</div>
                  </div>
                </div>

                <div className={styles.memberFooter}>
                  <span className={styles.memberTime}>
                    <Calendar />
                    Joined {formatRelative(member.created_at)}
                  </span>
                </div>
              </Card>
            );
          })}

          <button className={styles.inviteCard} onClick={() => setShowInvite(true)}>
            <div className={styles.inviteIcon}>
              <UserPlus />
            </div>
            <span>Invite Team Member</span>
          </button>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={showInvite}
        onClose={() => setShowInvite(false)}
        title="Invite Team Member"
        size="sm"
      >
        <form onSubmit={handleInvite} className={styles.inviteForm}>
          <Input
            label="Email address"
            type="email"
            placeholder="colleague@company.com"
            icon={Mail}
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            autoFocus
          />
          <Select
            label="Role"
            options={roleOptions}
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
          />
          {projects.length > 0 && (
            <div className={styles.projectNote}>
              Will be added to: <strong>{projects[0].name}</strong>
            </div>
          )}
          <div className={styles.formActions}>
            <Button variant="secondary" type="button" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
            <Button type="submit" icon={Mail}>
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Team;
