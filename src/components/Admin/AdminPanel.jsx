import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Shield, Trash2, Crown, User as UserIcon, Search, ArrowLeft, Activity } from 'lucide-react';

const AdminPanel = ({ onBack }) => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totalUsers: 0, admins: 0, activeToday: 0 });

  useEffect(() => {
    if (isAdmin) fetchUsers();
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        lastLogin: doc.data().lastLogin?.toDate()
      }));
      setUsers(usersData);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      setStats({
        totalUsers: usersData.length,
        admins: usersData.filter(u => u.role === 'admin').length,
        activeToday: usersData.filter(u => u.lastLogin >= today).length
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId, currentRole) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: currentRole === 'admin' ? 'user' : 'admin' });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Delete this user?')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="admin-denied">
        <Shield size={32} />
        <span>Access Denied</span>
        <button onClick={onBack}>Back</button>
      </div>
    );
  }

  return (
    <div className="admin-compact">
      {/* Header Row */}
      <div className="admin-top">
        <button className="back-btn" onClick={onBack}><ArrowLeft size={16} /></button>
        <div className="admin-title"><Shield size={16} /> Admin</div>
        <div className="stats-inline">
          <span><Users size={12} /> {stats.totalUsers}</span>
          <span><Crown size={12} /> {stats.admins}</span>
          <span><Activity size={12} /> {stats.activeToday}</span>
        </div>
      </div>

      {/* Search */}
      <div className="search-compact">
        <Search size={14} />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* User List */}
      {loading ? (
        <div className="loading-msg">Loading...</div>
      ) : (
        <div className="user-list">
          {filteredUsers.map(user => (
            <motion.div
              key={user.id}
              className="user-row"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="user-info">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="avatar-tiny" />
                ) : (
                  <div className="avatar-tiny placeholder"><UserIcon size={10} /></div>
                )}
                <div className="user-details">
                  <span className="user-name">{user.displayName || 'Unknown'}</span>
                  <span className="user-email">{user.email}</span>
                </div>
              </div>
              <div className="user-meta">
                <span className={`role-pill ${user.role || 'user'}`}>
                  {user.role === 'admin' ? '👑' : '👤'}
                </span>
                <span className="level-pill">Lv{user.level || 1}</span>
              </div>
              <div className="user-actions">
                <button
                  className="act-btn crown"
                  onClick={() => toggleAdmin(user.id, user.role)}
                  title={user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                >
                  <Crown size={12} />
                </button>
                <button
                  className="act-btn delete"
                  onClick={() => deleteUser(user.id)}
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </motion.div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="no-results">No users found</div>
          )}
        </div>
      )}

      <style>{`
        .admin-compact {
          display: flex;
          flex-direction: column;
          gap: 6px;
          height: 100%;
          overflow: hidden;
          padding: 8px;
        }

        .admin-denied {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 100%;
          color: var(--text-muted);
        }
        .admin-denied button {
          padding: 4px 12px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .admin-top {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
        }

        .back-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          padding: 4px;
          display: flex;
          cursor: pointer;
        }
        .back-btn:hover { color: var(--text-primary); }

        .admin-title {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 700;
          font-size: 0.9rem;
          color: #f59e0b;
        }

        .stats-inline {
          margin-left: auto;
          display: flex;
          gap: 10px;
          font-size: 0.7rem;
          color: var(--text-muted);
        }
        .stats-inline span {
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .search-compact {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 6px;
        }
        .search-compact svg { color: var(--text-muted); flex-shrink: 0; }
        .search-compact input {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 0.8rem;
          outline: none;
        }

        .loading-msg {
          padding: 20px;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.8rem;
        }

        .user-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .user-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 0.75rem;
        }
        .user-row:hover {
          background: var(--glass-bg);
          border-color: var(--accent);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          min-width: 0;
        }

        .avatar-tiny {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .avatar-tiny.placeholder {
          background: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .user-name {
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .user-email {
          color: var(--text-muted);
          font-size: 0.65rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-meta {
          display: flex;
          gap: 4px;
          flex-shrink: 0;
        }

        .role-pill {
          font-size: 0.65rem;
          padding: 2px 4px;
          border-radius: 3px;
        }
        .role-pill.admin { background: rgba(245, 158, 11, 0.15); }
        .role-pill.user { background: rgba(59, 130, 246, 0.1); }

        .level-pill {
          background: var(--accent-light);
          color: var(--accent);
          padding: 2px 5px;
          border-radius: 3px;
          font-size: 0.6rem;
          font-weight: 700;
        }

        .user-actions {
          display: flex;
          gap: 3px;
          flex-shrink: 0;
        }

        .act-btn {
          width: 22px;
          height: 22px;
          border: none;
          border-radius: 4px;
          background: var(--bg-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .act-btn.crown { color: #f59e0b; }
        .act-btn.crown:hover { background: rgba(245, 158, 11, 0.15); }
        .act-btn.delete { color: #ef4444; }
        .act-btn.delete:hover { background: rgba(239, 68, 68, 0.15); }

        .no-results {
          padding: 16px;
          text-align: center;
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        @media (max-width: 480px) {
          .user-email { display: none; }
          .stats-inline { display: none; }
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
