import React, { useState, useEffect } from 'react';
import * as api from '../services/api.js';
import { Mail, Phone, Calendar, User } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await api.fetchAdminUsers();
        if (data.success) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-[#070b13]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-400"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a1120] border border-gold-400/10 p-6 rounded-lg shadow-lg text-zinc-300 font-sans text-xs">
      <h3 className="font-outfit text-white text-base font-bold tracking-wider border-b border-gold-400/10 pb-2 mb-6">
        Registered Customer Accounts ({users.length})
      </h3>

      {users.length === 0 ? (
        <p className="text-zinc-500 italic text-center py-10">No customer accounts registered yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gold-400/10 text-white font-semibold">
                <th className="py-2.5">Client Name</th>
                <th className="py-2.5">Email address</th>
                <th className="py-2.5">Mobile Contact</th>
                <th className="py-2.5">Date Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-400/5">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-4 flex items-center">
                    <div className="h-7 w-7 rounded-full bg-slate-950 border border-gold-400/20 text-gold-400 font-bold flex items-center justify-center mr-3 uppercase text-[10px]">
                      {u.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-white">{u.name}</span>
                  </td>
                  <td className="py-4 font-mono text-[11px] text-zinc-400">
                    <span className="flex items-center">
                      <Mail className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
                      {u.email}
                    </span>
                  </td>
                  <td className="py-4 text-zinc-400">
                    <span className="flex items-center">
                      <Phone className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
                      {u.contact || 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 text-zinc-500">
                    <span className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-zinc-500" />
                      {new Date(u.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
