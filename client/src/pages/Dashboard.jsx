import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  FolderKanban,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Plus
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Header } from '../components/layout';
import { Card, Avatar, Badge } from '../components/ui';
import useAppStore from '../stores/appStore';
import useAuthStore from '../stores/authStore';
import { getGreeting, formatRelative, cn } from '../utils/helpers';
import styles from './Dashboard.module.css';

const MetricCard = ({ icon: Icon, label, value, trend, trendLabel, color, sparkline }) => (
  <Card className={styles.metricCard}>
    <div className={styles.metricHeader}>
      <div className={styles.metricIcon} style={{ '--color': color }}>
        <Icon />
      </div>
      {sparkline && (
        <div className={styles.sparkline}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkline}>
              <defs>
                <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="count"
                stroke={color}
                strokeWidth={2}
                fill={`url(#grad-${label})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
    <div className={styles.metricValue}>{value}</div>
    <div className={styles.metricLabel}>{label}</div>
    {trend !== undefined && (
      <div className={cn(styles.metricTrend, trend >= 0 ? styles.positive : styles.negative)}>
        <TrendingUp className={styles.trendIcon} />
        <span>{Math.abs(trend)}% {trendLabel}</span>
      </div>
    )}
  </Card>
);

const Dashboard = () => {
  const { user } = useAuthStore();
  const {
    projects,
    analytics,
    activity,
    fetchProjects,
    fetchAnalytics,
    fetchActivity,
    projectsLoading
  } = useAppStore();

  useEffect(() => {
    fetchProjects();
    fetchAnalytics();
    fetchActivity();
  }, []);

  const greeting = getGreeting();
  const firstName = user?.name?.split(' ')[0] || 'there';

  const formatActivityText = (act) => {
    const actionText = {
      created: 'created',
      completed: 'completed',
      moved: 'moved',
      commented: 'commented on'
    };
    return `${act.user_name} ${actionText[act.action] || act.action} a ${act.entity_type}`;
  };

  return (
    <div className={styles.page}>
      <Header
        title={`${greeting}, ${firstName}`}
        subtitle="Here's what's happening with your projects"
      />

      <div className={styles.content}>
        {/* Metrics Grid */}
        <div className={styles.metricsGrid}>
          <MetricCard
            icon={CheckCircle}
            label="Tasks Completed"
            value={analytics?.tasks?.completed || 0}
            trend={12}
            trendLabel="vs last week"
            color="#22c55e"
            sparkline={analytics?.sparkline}
          />
          <MetricCard
            icon={FolderKanban}
            label="Active Projects"
            value={projects.length || 0}
            trend={8}
            trendLabel="vs last month"
            color="#6366f1"
          />
          <MetricCard
            icon={Clock}
            label="Due This Week"
            value={analytics?.dueThisWeek || 0}
            color="#f59e0b"
          />
          <MetricCard
            icon={AlertTriangle}
            label="Overdue Tasks"
            value={analytics?.overdueTasks || 0}
            color="#ef4444"
          />
        </div>

        <div className={styles.mainGrid}>
          {/* Projects Section */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Active Projects</h2>
              <Link to="/projects" className={styles.viewAll}>
                View all <ArrowRight />
              </Link>
            </div>
            <div className={styles.projectsGrid}>
              {projects.slice(0, 4).map((project, index) => {
                const progress = project.task_count > 0
                  ? Math.round((project.completed_count / project.task_count) * 100)
                  : 0;
                
                return (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className={styles.projectCard}
                    style={{ '--delay': `${index * 50}ms` }}
                  >
                    <div className={styles.projectHeader}>
                      <div
                        className={styles.projectDot}
                        style={{ background: project.color }}
                      />
                      <h3 className={styles.projectName}>{project.name}</h3>
                    </div>
                    <p className={styles.projectDesc}>{project.description}</p>
                    <div className={styles.projectMeta}>
                      <span className={styles.projectProgress}>{progress}% complete</span>
                      <span className={styles.projectTasks}>
                        {project.completed_count}/{project.task_count} tasks
                      </span>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${progress}%`, '--color': project.color }}
                      />
                    </div>
                  </Link>
                );
              })}
              <Link to="/projects/new" className={styles.newProjectCard}>
                <Plus />
                <span>New Project</span>
              </Link>
            </div>
          </section>

          {/* Activity Feed */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recent Activity</h2>
            </div>
            <Card className={styles.activityCard}>
              <div className={styles.activityList}>
                {activity.slice(0, 8).map((act, index) => (
                  <div
                    key={act.id}
                    className={styles.activityItem}
                    style={{ '--delay': `${index * 30}ms` }}
                  >
                    <Avatar name={act.user_name} size="sm" />
                    <div className={styles.activityContent}>
                      <p className={styles.activityText}>
                        <strong>{act.user_name}</strong> {formatActivityText(act)}
                      </p>
                      <span className={styles.activityTime}>
                        {formatRelative(act.created_at)}
                      </span>
                    </div>
                    {act.project_name && (
                      <Badge
                        size="sm"
                        className={styles.activityProject}
                        style={{ '--color': act.project_color }}
                      >
                        {act.project_name}
                      </Badge>
                    )}
                  </div>
                ))}
                {activity.length === 0 && (
                  <div className={styles.emptyActivity}>
                    No recent activity
                  </div>
                )}
              </div>
            </Card>
          </section>
        </div>

        {/* Team Velocity Chart */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Team Performance</h2>
            <Link to="/analytics" className={styles.viewAll}>
              View analytics <ArrowRight />
            </Link>
          </div>
          <Card className={styles.chartCard}>
            <div className={styles.chartPlaceholder}>
              <TrendingUp className={styles.chartIcon} />
              <p>Weekly velocity tracking</p>
              <span>{analytics?.velocity || 0} tasks completed this week</span>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
