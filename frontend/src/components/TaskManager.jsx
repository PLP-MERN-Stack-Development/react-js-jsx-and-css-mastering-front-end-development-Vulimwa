import { useState, useEffect } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { api } from '../api/api';
import { useAuth } from '../hooks/useAuth';
import { TaskComments } from './TaskComments';

export function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const { user } = useAuth();
  const userId = user?._id || null;

  useEffect(() => {
    const init = async () => {
      if (!userId) { setTasks([]); setLoading(false); return; }
      try {
        setLoading(true);
        const data = await api.getTasks(userId);
        setTasks(data.tasks);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [userId]);

  const fetchTasks = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const data = await api.getTasks(userId);
      setTasks(data.tasks);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...newTask,
        status: 'todo',
        priority: 'medium'
      };
      if (!userId) throw new Error('No user selected');
      await api.createTask(userId, taskData);
      setNewTask({ title: '', description: '' });
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateTask = async (taskId, status) => {
    try {
      if (!userId) throw new Error('No user selected');
      await api.updateTask(userId, taskId, { status });
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      if (!userId) throw new Error('No user selected');
      await api.deleteTask(userId, taskId);
      fetchTasks();
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return task.status !== 'completed';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  if (!userId) return <div className="container"><div className="alert">Sign in to view your tasks.</div></div>;
  if (loading) return <div className="loading">Loading tasks...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="container">
      <Card className="mb-6">
        <form onSubmit={handleCreateTask} className="stack">
          <div>
            <input
              type="text"
              placeholder="Task title"
              className="input"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <textarea
              placeholder="Task description"
              className="input"
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              required
            />
          </div>
          <Button type="submit">Add Task</Button>
        </form>
      </Card>

      <div className="button-group mb-4">
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'active' ? 'primary' : 'secondary'}
          onClick={() => setFilter('active')}
        >
          Active
        </Button>
        <Button
          variant={filter === 'completed' ? 'primary' : 'secondary'}
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
      </div>

      <div className="stack">
        {filteredTasks.map((task) => (
          <Card key={task._id} className="card-row">
            <div className="card-row__main">
              <h3 className="card-title">{task.title}</h3>
              <p className="muted">{task.description}</p>
              <span className={`badge ${
                task.status === 'completed' ? 'badge-success' :
                task.status === 'in-progress' ? 'badge-warning' :
                'badge-info'
              }`}>
                {task.status}
              </span>
              <TaskComments taskId={task._id} />
            </div>
            <div className="button-group">
              {task.status !== 'completed' && (
                <Button
                  variant="primary"
                  onClick={() => handleUpdateTask(task._id, 'completed')}
                >
                  Complete
                </Button>
              )}
              <Button
                variant="danger"
                onClick={() => handleDeleteTask(task._id)}
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
