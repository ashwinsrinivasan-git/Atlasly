import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Shield, Trash2, Crown, User as UserIcon, Mail, Calendar, Activity, Search, ArrowLeft } from 'lucide-react';

const AdminPanel = ({ onBack }) => {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalUsers: 0,
    admins: 0,
    activeToday: 0
  });

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
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

      // Calculate stats
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
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await updateDoc(userRef, { role: newRole });
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const userRef = doc(db, 'users', userId);
      await deleteDoc(userRef);
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="admin-unauthorized">
        <Shield size={64} className="unauthorized-icon" />
        <h2>Access Denied</h2>
        <p>You don't have permission to access the admin panel.</p>
        <button className="btn btn-primary" onClick={onBack}>Go Back</button>
      </div>
    );
  }

  if (loading) {
    return <div className="admin-loading">Loading users...</div>;
  }

  return (
    <div className="admin-panel">
      <motion.div
        className="admin-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="admin-title">
          <button className="btn btn-ghost" onClick={onBack}>
            <ArrowLeft size={20} />
            Back
          </button>
          <div>
            <h1>
              <Shield size={28} />
              Admin Panel
            </h1>
            <p>User Management Dashboard</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="stats-row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="stat-box">
          <Users className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div className="stat-box">
          <Crown className="stat-icon admin" />
          <div className="stat-content">
            <div className="stat-value">{stats.admins}</div>
            <div className="stat-label">Admins</div>
          </div>
        </div>

        <div className="stat-box">
          <Activity className="stat-icon active" />
          <div className="stat-content">
            <div className="stat-value">{stats.activeToday}</div>
            <div className="stat-label">Active Today</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="search-bar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </motion.div>

      <motion.div
        className="users-table-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <table className="users-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Level</th>
              <th>XP</th>
              <th>Joined</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <td>
                  <div className="user-cell">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} className="user-avatar" />
                    ) : (
                      <div className="user-avatar-placeholder">
                        <UserIcon size={16} />
                      </div>
                    )}
                    <span>{user.displayName || 'Unknown'}</span>
                  </div>
                </td>
                <td>
                  <div className="email-cell">
                    <Mail size={14} />
                    {user.email}
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'admin' ? <Crown size={12} /> : <UserIcon size={12} />}
                    {user.role || 'user'}
                  </span>
                </td>
                <td>{user.level || 1}</td>
                <td>{user.xp || 0}</td>
                <td>
                  {user.createdAt ? (
                    <div className="date-cell">
                      <Calendar size={14} />
                      {user.createdAt.toLocaleDateString()}
                    </div>
                  ) : 'N/A'}
                </td>
                <td>
                  {user.lastLogin ? (
                    <div className="date-cell">
                      {user.lastLogin.toLocaleDateString()}
                    </div>
                  ) : 'Never'}
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-action toggle-admin"
                      onClick={() => toggleAdmin(user.id, user.role)}
                      title={user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                    >
                      <Crown size={16} />
                    </button>
                    <button
                      className="btn-action delete"
                      onClick={() => deleteUser(user.id)}
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div className="no-users">
            <Users size={48} />
            <p>No users found</p>
          </div>
        )}
      </motion.div>

      <style>{`
        .admin-panel {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--space-lg);
        }

        .admin-unauthorized {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: var(--space-md);
        }

        .unauthorized-icon {
          color: var(--text-muted);
        }

        .admin-loading {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: var(--text-secondary);
        }

        .admin-header {
          margin-bottom: var(--space-xl);
        }

        .admin-title {
          display: flex;
          align-items: center;
          gap: var(--space-lg);
        }

        .admin-title h1 {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin: 0;
          font-size: 2rem;
        }

        .admin-title p {
          margin: 0;
          color: var(--text-secondary);
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-md);
          margin-bottom: var(--space-xl);
        }

        .stat-box {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          display: flex;
          align-items: center;
          gap: var(--space-md);
          box-shadow: var(--shadow);
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          color: var(--accent);
        }

        .stat-icon.admin {
          color: #f59e0b;
        }

        .stat-icon.active {
          color: #10b981;
        }

        .stat-content {
          flex: 1;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          line-height: 1;
        }

        .stat-label {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-top: 4px;
        }

        .search-bar {
          position: relative;
          margin-bottom: var(--space-lg);
        }

        .search-icon {
          position: absolute;
          left: var(--space-md);
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .search-bar input {
          width: 100%;
          padding: var(--space-md) var(--space-md) var(--space-md) calc(var(--space-md) * 3);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          color: var(--text-primary);
          font-size: 1rem;
        }

        .search-bar input:focus {
          outline: none;
          border-color: var(--accent);
        }

        .users-table-container {
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
        }

        .users-table thead {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
        }

        .users-table th {
          padding: var(--space-md);
          text-align: left;
          font-weight: 600;
          color: var(--text-secondary);
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .users-table tbody tr {
          border-bottom: 1px solid var(--border);
          transition: background var(--transition-speed);
        }

        .users-table tbody tr:hover {
          background: var(--bg-secondary);
        }

        .users-table td {
          padding: var(--space-md);
          color: var(--text-primary);
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .user-avatar-placeholder {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .email-cell {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          color: var(--text-secondary);
          font-size: 0.875rem;
        }

        .date-cell {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .role-badge.admin {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        .role-badge.user {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }

        .action-buttons {
          display: flex;
          gap: var(--space-xs);
        }

        .btn-action {
          padding: 6px;
          border: none;
          background: var(--bg-secondary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-speed);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-action.toggle-admin {
          color: #f59e0b;
        }

        .btn-action.toggle-admin:hover {
          background: rgba(245, 158, 11, 0.1);
        }

        .btn-action.delete {
          color: #ef4444;
        }

        .btn-action.delete:hover {
          background: rgba(239, 68, 68, 0.1);
        }

        .no-users {
          padding: var(--space-xl);
          text-align: center;
          color: var(--text-muted);
        }

        .no-users p {
          margin-top: var(--space-md);
        }

        @media (max-width: 1200px) {
          .users-table-container {
            overflow-x: auto;
          }

          .users-table {
            min-width: 800px;
          }
        }

        @media (max-width: 768px) {
          .admin-title {
            flex-direction: column;
            align-items: flex-start;
          }

          .stats-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPanel;
