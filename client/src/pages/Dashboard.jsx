import React, { useEffect, useState, useCallback } from 'react';
import { Gem, Sparkles, Plus, ChevronLeft, ChevronRight, Trash2, CheckSquare, Square } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState({ total: 0, pages: 0, limit: 50 });
  const [selectedIds, setSelectedIds] = useState([]);
  const { getToken } = useAuth();

  const getDashboardData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = await getToken();
      const { data } = await axios.get(`/api/user/get-user-creations?limit=50&page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setCreations(data.creations);
        setPaginationMeta(data.meta);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

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
        // Refresh data to update pagination meta
        getDashboardData(currentPage);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getDashboardData(currentPage);
  }, [currentPage, getDashboardData]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSelectedIds([]); // Clear selection when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectAll = () => {
    if (selectedIds.length === creations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(creations.map(c => c.id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} creation${selectedIds.length > 1 ? 's' : ''}?`
    );

    if (!confirmDelete) return;

    try {
      const token = await getToken();
      const deletePromises = selectedIds.map(id => 
        axios.post(
          '/api/user/delete-creation',
          { id },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      await Promise.all(deletePromises);
      toast.success(`${selectedIds.length} creation${selectedIds.length > 1 ? 's' : ''} deleted successfully`);
      setSelectedIds([]);
      getDashboardData(currentPage);
    } catch (error) {
      toast.error(error.message || 'Failed to delete creations');
    }
  };

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
                <h2 className="text-3xl font-bold text-foreground">{paginationMeta.total || creations.length}</h2>
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Recent Creations</h3>
          
          {!loading && creations.length > 0 && (
            <div className="flex items-center gap-3">
              <button
                onClick={handleSelectAll}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                {selectedIds.length === creations.length ? (
                  <><CheckSquare className="w-4 h-4" /> Deselect All</>
                ) : (
                  <><Square className="w-4 h-4" /> Select All</>
                )}
              </button>
              
              {selectedIds.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedIds.length})
                </button>
              )}
            </div>
          )}
        </div>

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
                <CreationItem 
                  key={item.id} 
                  item={item} 
                  onDelete={handleDeleteCreation}
                  isSelected={selectedIds.includes(item.id)}
                  onToggleSelect={handleToggleSelect}
                />
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

        {/* Pagination Controls */}
        {!loading && creations.length > 0 && paginationMeta.pages > 1 && (
          <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4 shadow-sm">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{((currentPage - 1) * paginationMeta.limit) + 1}</span> to{' '}
              <span className="font-medium text-foreground">
                {Math.min(currentPage * paginationMeta.limit, paginationMeta.total)}
              </span> of{' '}
              <span className="font-medium text-foreground">{paginationMeta.total}</span> creations
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-background hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(paginationMeta.pages)].map((_, idx) => {
                  const pageNum = idx + 1;
                  // Show first page, last page, current page, and pages around current
                  if (
                    pageNum === 1 ||
                    pageNum === paginationMeta.pages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          currentPage === pageNum
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-border bg-background hover:bg-secondary'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className="text-muted-foreground">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === paginationMeta.pages}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-background hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;