import React, { useEffect, useState } from 'react';
import { Gem, Sparkles, Plus } from 'lucide-react';
import { Protect, useAuth } from '@clerk/clerk-react';
import CreationItem from '../components/CreationItem';
import { SkeletonCard, SkeletonCreationItem } from '../components/LoadingComponents';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Dashboard = () => {
  const [creations, setCreations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  const getDashboardData = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await axios.get('/api/user/get-user-creations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setCreations(data.creations);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCreation = async (id) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        '/api/user/delete-creation',
        { id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        setCreations(prev => prev.filter(creation => creation.id !== id));
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getDashboardData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your activity.</p>
        </div>
        <Link to="/ai/write-article" className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Creation</span>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* Total Creations */}
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-full text-muted-foreground">Lifetime</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">{creations.length}</h2>
                <p className="text-sm text-muted-foreground">Total Creations</p>
              </div>
            </div>

            {/* Active Plan */}
            <div className="bg-card border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Gem className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-full text-muted-foreground">Current</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">
                  <Protect plan="premium" fallback="Free">Premium</Protect>
                </h2>
                <p className="text-sm text-muted-foreground">Active Plan</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Creations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Creations</h3>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-4">
              <SkeletonCreationItem />
              <SkeletonCreationItem />
              <SkeletonCreationItem />
            </div>
          ) : creations.length > 0 ? (
            <div className="divide-y divide-border">
              {creations.map(item => (
                <CreationItem key={item.id} item={item} onDelete={handleDeleteCreation} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-1">No creations yet</h3>
              <p className="text-muted-foreground mb-6">Start creating amazing content with our AI tools.</p>
              <Link to="/ai/write-article" className="inline-flex items-center gap-2 text-primary hover:underline font-medium">
                Start Creating <Plus className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;