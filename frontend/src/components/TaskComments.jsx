import { useEffect, useState } from 'react';
import { api } from '../api/api';
import { Button } from './Button';
import { useAuth } from '../hooks/useAuth';

export function TaskComments({ taskId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const data = await api.getComments(taskId);
      setComments(data.comments || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [taskId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!user?._id) return setError('You must be signed in');
    try {
      await api.createComment(taskId, { message, author_id: user._id });
      setMessage('');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (commentId) => {
    if (!confirm('Delete this comment?')) return;
    try {
      setDeletingId(commentId);
      await api.deleteComment(taskId, commentId);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="stack" style={{ marginTop: 12 }}>
      {loading && <div className="muted">Loading comments…</div>}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && comments.length === 0 && <div className="muted">No comments yet.</div>}
      {comments.map(c => {
        const canDelete = user && (user._id === (c.author_id?._id || c.author_id) || user.role === 'Admin');
        return (
          <div key={c._id} className="card" style={{ padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div className="muted">{c.author_id?.userName || c.author_id?.email}</div>
              {canDelete && (
                <Button variant="secondary" onClick={() => remove(c._id)} disabled={deletingId === c._id}>
                  {deletingId === c._id ? 'Deleting…' : 'Delete'}
                </Button>
              )}
            </div>
            <div>{c.message}</div>
          </div>
        );
      })}

      <form onSubmit={submit} className="stack">
        <textarea className="input" placeholder="Write a comment" value={message} onChange={(e) => setMessage(e.target.value)} required />
        <Button type="submit">Add Comment</Button>
      </form>
    </div>
  );
}
