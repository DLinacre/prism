import { useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, CheckCircle, Clock, Target, Users } from 'lucide-react';
import { Header } from '../components/layout';
import { Card } from '../components/ui';
import useAppStore from '../stores/appStore';
import { cn } from '../utils/helpers';
import styles from './Analytics.module.css';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'];

const Analytics = () => {
  const { analytics, team, analyticsLoading, fetchAnalytics, fetchTeam } = useAppStore();

  useEffect(() => {
    fetchAnalytics();
    fetchTeam();
  }, []);

  const taskDistribution = analytics ? [
    { name: 'Completed', value: analytics.tasks?.completed || 0, color: '#22c55e' },
    { name: 'In Progress', value: analytics.tasks?.in_progress || 0, color: '#3b82f6' },
    { name: 'In Review', value: analytics.tasks?.in_review || 0, color: '#f59e0b' },
    { name: 'Backlog', value: analytics.tasks?.backlog || 0, color: '#555566' }
  ] : [];

  const velocityData = [
    { week: 'Week 1', tasks: 12 },
    { week: 'Week 2', tasks: 19 },
    { week: 'Week 3', tasks: 15 },
    { week: 'Week 4', tasks: 22 },
    { week: 'Week 5', tasks: 18 },
    { week: 'Week 6', tasks: 25 }
  ];

  return (
    <div className={styles.page}>
      <Header title="Analytics" subtitle="Track your team's performance" />

      <div className={styles.content}>
        {/* Metrics Row */}
        <div className={styles.metricsRow}>
          <Card className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ '--color': '#22c55e' }}>
              <CheckCircle />
            </div>
            <div className={styles.metricValue}>{analytics?.tasks?.completed || 0}</div>
            <div className={styles.metricLabel}>Tasks Completed</div>
            <div className={styles.metricTrend + ' ' + styles.positive}>+12% vs last week</div>
          </Card>

          <Card className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ '--color': '#3b82f6' }}>
              <Clock />
            </div>
            <div className={styles.metricValue}>{analytics?.tasks?.in_progress || 0}</div>
            <div className={styles.metricLabel}>In Progress</div>
          </Card>

          <Card className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ '--color': '#f59e0b' }}>
              <Target />
            </div>
            <div className={styles.metricValue}>{analytics?.dueThisWeek || 0}</div>
            <div className={styles.metricLabel}>Due This Week</div>
          </Card>

          <Card className={styles.metricCard}>
            <div className={styles.metricIcon} style={{ '--color': '#6366f1' }}>
              <Users />
            </div>
            <div className={styles.metricValue}>{team.length || 0}</div>
            <div className={styles.metricLabel}>Team Members</div>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className={styles.chartsGrid}>
          {/* Velocity Chart */}
          <Card className={styles.chartCard} style={{ gridColumn: 'span 2' }}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>
                <TrendingUp />
                Team Velocity
              </h3>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={velocityData}>
                  <defs>
                    <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="tasks"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#velocityGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Task Distribution */}
          <Card className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Task Distribution</h3>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={taskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className={styles.legend}>
                {taskDistribution.map((item) => (
                  <div key={item.name} className={styles.legendItem}>
                    <span className={styles.legendDot} style={{ background: item.color }} />
                    <span className={styles.legendLabel}>{item.name}</span>
                    <span className={styles.legendValue}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Team Performance */}
          <Card className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3 className={styles.chartTitle}>Team Performance</h3>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={team.slice(0, 5)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="var(--text-muted)"
                    fontSize={12}
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="completed" fill="#22c55e" radius={[0, 4, 4, 0]} name="Completed" />
                  <Bar dataKey="in_progress" fill="#3b82f6" radius={[0, 4, 4, 0]} name="In Progress" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Burndown Chart */}
        <Card className={styles.burndownCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Sprint Progress</h3>
            <span className={styles.chartSubtitle}>Last 2 weeks</span>
          </div>
          <div className={styles.chartContainer}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={[
                { day: 'Day 1', remaining: 20, ideal: 20 },
                { day: 'Day 3', remaining: 17, ideal: 16 },
                { day: 'Day 5', remaining: 14, ideal: 12 },
                { day: 'Day 7', remaining: 10, ideal: 9 },
                { day: 'Day 9', remaining: 7, ideal: 6 },
                { day: 'Day 11', remaining: 4, ideal: 3 },
                { day: 'Day 14', remaining: 1, ideal: 0 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="ideal"
                  stroke="var(--border-hover)"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                  name="Ideal"
                />
                <Line
                  type="monotone"
                  dataKey="remaining"
                  stroke="#6366f1"
                  strokeWidth={2}
                  dot={{ fill: '#6366f1', strokeWidth: 2 }}
                  name="Actual"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
