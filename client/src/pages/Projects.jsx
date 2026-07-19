import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  MoreHorizontal,
  GripVertical,
  Calendar,
  MessageSquare,
  Trash2,
  Edit2,
  X
} from 'lucide-react';
import { Header } from '../components/layout';
import { Button, Card, Avatar, Badge, Modal, Input, Select } from '../components/ui';
import useAppStore from '../stores/appStore';
import { formatDate, cn, priorityColors, statusNames } from '../utils/helpers';
import styles from './Projects.module.css';

const columns = [
  { id: 'backlog', title: 'Backlog', color: 'var(--text-muted)' },
  { id: 'in-progress', title: 'In Progress', color: 'var(--info)' },
  { id: 'review', title: 'In Review', color: 'var(--warning)' },
  { id: 'completed', title: 'Completed', color: 'var(--success)' }
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
];

const Projects = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState('board');
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', assignee_id: '' });
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const {
    currentProject,
    tasks,
    team,
    fetchProject,
    fetchTasks,
    fetchTeam,
    createTask,
    moveTask,
    deleteTask,
    projects
  } = useAppStore();

  useEffect(() => {
    fetchTeam();
    if (id) {
      fetchProject(id);
      fetchTasks(id);
    } else {
      fetchProjects();
    }
  }, [id]);

  const fetchProjects = useAppStore.getState().fetchProjects;

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedTask && draggedTask.status !== columnId) {
      const columnTasks = tasks.filter(t => t.status === columnId);
      await moveTask(draggedTask.id, columnId, columnTasks.length);
    }
    setDraggedTask(null);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    
    await createTask(id, {
      ...newTask,
      assignee_id: newTask.assignee_id || null
    });
    setNewTask({ title: '', priority: 'medium', assignee_id: '' });
    setShowNewTask(false);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) {
      await deleteTask(taskId);
    }
  };

  // Project list view
  if (!id) {
    return (
      <div className={styles.page}>
        <Header
          title="Projects"
          subtitle={`${projects.length} projects`}
          actions={
            <Button icon={Plus} onClick={() => navigate('/projects/new')}>
              New Project
            </Button>
          }
        />
        <div className={styles.content}>
          <div className={styles.projectsGrid}>
            {projects.map((project, index) => {
              const progress = project.task_count > 0
                ? Math.round((project.completed_count / project.task_count) * 100)
                : 0;
              
              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className={styles.projectCard}
                  style={{ '--delay': `${index * 50}ms}` }}
                >
                  <div className={styles.projectTop}>
                    <div className={styles.projectColor} style={{ background: project.color }} />
                    <button
                      className={styles.projectMenu}
                      onClick={(e) => e.preventDefault()}
                    >
                      <MoreHorizontal />
                    </button>
                  </div>
                  <h3 className={styles.projectTitle}>{project.name}</h3>
                  <p className={styles.projectDesc}>{project.description}</p>
                  <div className={styles.projectStats}>
                    <span>{project.task_count} tasks</span>
                    <span>{progress}% done</span>
                  </div>
                  <div className={styles.projectProgress}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                  </div>
                </Link>
              );
            })}
            <button className={styles.newProjectCard} onClick={() => navigate('/projects/new')}>
              <Plus />
              <span>Create New Project</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Kanban board view
  const tasksByStatus = columns.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id);
    return acc;
  }, {});

  return (
    <div className={styles.page}>
      <Header
        title={currentProject?.name || 'Loading...'}
        subtitle={currentProject?.description}
        actions={
          <div className={styles.viewToggle}>
            <button className={cn(styles.viewBtn, view === 'board' && styles.active)} onClick={() => setView('board')}>
              Board
            </button>
            <button className={cn(styles.viewBtn, view === 'list' && styles.active)} onClick={() => setView('list')}>
              List
            </button>
          </div>
        }
      />

      <div className={styles.board}>
        {columns.map(column => (
          <div
            key={column.id}
            className={cn(styles.column, dragOverColumn === column.id && styles.dragOver)}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className={styles.columnHeader}>
              <div className={styles.columnTitle}>
                <span className={styles.columnDot} style={{ background: column.color }} />
                <span>{column.title}</span>
                <span className={styles.columnCount}>{tasksByStatus[column.id]?.length || 0}</span>
              </div>
              <button className={styles.columnAdd} onClick={() => setShowNewTask(true)}>
                <Plus />
              </button>
            </div>

            <div className={styles.columnContent}>
              {tasksByStatus[column.id]?.map((task, index) => (
                <div
                  key={task.id}
                  className={cn(styles.taskCard, draggedTask?.id === task.id && styles.dragging)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  style={{ '--delay': `${index * 30}ms` }}
                >
                  <div className={styles.taskHeader}>
                    <Badge
                      size="sm"
                      variant={task.priority === 'high' ? 'danger' : task.priority === 'medium' ? 'warning' : 'default'}
                    >
                      {task.priority}
                    </Badge>
                    <button className={styles.taskMenu}>
                      <MoreHorizontal />
                    </button>
                  </div>
                  <h4 className={styles.taskTitle}>{task.title}</h4>
                  {task.description && (
                    <p className={styles.taskDesc}>{task.description}</p>
                  )}
                  <div className={styles.taskFooter}>
                    <div className={styles.taskMeta}>
                      {task.due_date && (
                        <span className={styles.taskDate}>
                          <Calendar />
                          {formatDate(task.due_date)}
                        </span>
                      )}
                    </div>
                    {task.assignee_name ? (
                      <Avatar name={task.assignee_name} size="xs" />
                    ) : (
                      <div className={styles.unassigned}>?</div>
                    )}
                  </div>
                  <button
                    className={styles.taskDelete}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                  >
                    <Trash2 />
                  </button>
                </div>
              ))}
              
              {tasksByStatus[column.id]?.length === 0 && (
                <div className={styles.emptyColumn}>
                  <p>No tasks</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* New Task Modal */}
      <Modal
        isOpen={showNewTask}
        onClose={() => setShowNewTask(false)}
        title="Create Task"
        size="sm"
      >
        <form onSubmit={handleCreateTask} className={styles.taskForm}>
          <Input
            label="Title"
            placeholder="What needs to be done?"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            autoFocus
          />
          <Select
            label="Priority"
            options={priorityOptions}
            value={newTask.priority}
            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
          />
          <Select
            label="Assignee"
            options={[
              { value: '', label: 'Unassigned' },
              ...team.map(m => ({ value: m.id, label: m.name }))
            ]}
            value={newTask.assignee_id}
            onChange={(e) => setNewTask({ ...newTask, assignee_id: e.target.value })}
          />
          <div className={styles.formActions}>
            <Button variant="secondary" type="button" onClick={() => setShowNewTask(false)}>
              Cancel
            </Button>
            <Button type="submit" icon={Plus}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
