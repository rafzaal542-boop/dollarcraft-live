import React, { useEffect, useState } from 'react';
import { fetchUsersHistory } from '../../services/api';

export default function UsersHistory() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsersHistory()
      .then((data) => {
        if (data && data.users) {
          setUsers(data.users);
        } else if (Array.isArray(data)) {
          setUsers(data);
        }
      })
      .catch((err) => console.error('Error fetching users history:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-white">Loading registered accounts history...</div>;

  return (
    <div className="p-4 bg-slate-900 text-white rounded-lg shadow-lg my-4 border border-slate-700">
      <h2 className="text-lg font-bold mb-3 border-b border-gray-700 pb-2">
        Registered Accounts History
      </h2>
      {users.length === 0 ? (
        <p className="text-gray-400">No users registered yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-800 text-gray-400">
                <th className="p-2 border-b border-gray-700">Name</th>
                <th className="p-2 border-b border-gray-700">Email</th>
                <th className="p-2 border-b border-gray-700">Registration Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr key={u.id || u._id || index} className="hover:bg-slate-800/50 transition">
                  <td className="p-2 border-b border-gray-800 font-medium">{u.name || u.username || 'User'}</td>
                  <td className="p-2 border-b border-gray-800 text-gray-300">{u.email}</td>
                  <td className="p-2 border-b border-gray-800 text-gray-400">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}