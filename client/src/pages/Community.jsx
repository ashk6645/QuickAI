import { useAuth, useUser } from "@clerk/clerk-react";
import React, { useEffect, useState, useMemo } from "react";
import { Heart, Search, Users } from "lucide-react";
import { SkeletonImage } from "../components/LoadingComponents";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
  const [creations, setCreations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  // ✅ Derived state instead of duplicate filteredCreations
  const filteredCreations = useMemo(() => {
    if (!searchQuery.trim()) return creations;
    return creations.filter((c) =>
      c.prompt?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, creations]);

  // ✅ Fetch creations
  const fetchCreations = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/user/get-published-creations", {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
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

  // ✅ Optimistic update for likes
  const imageLikeToggle = async (id) => {
    try {
      const { data } = await axios.post(
        "/api/user/toggle-like-creation",
        { id },
        {
          headers: { Authorization: `Bearer ${await getToken()}` },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setCreations((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                ...c,
                likes: c.likes.includes(user.id)
                  ? c.likes.filter((uid) => uid !== user.id)
                  : [...c.likes, user.id],
              }
              : c
          )
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCreations();
    }
  }, [user]);

  return (
    <div className="flex-1 h-full flex flex-col gap-6 p-6 overflow-y-auto">
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Community Gallery
          </h1>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by prompt..."
            className="pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none w-full md:w-72 transition text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden bg-card border border-border">
              <SkeletonImage />
            </div>
          ))}
        </div>
      ) : filteredCreations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCreations.map((creation) => (
            <div
              key={creation.id}
              className="relative group aspect-square overflow-hidden rounded-xl bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300"
            >
              <img
                src={creation.content}
                alt={creation.prompt || "AI Generated"}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white text-sm line-clamp-2 mb-3 font-medium">
                  {creation.prompt || "AI Generated Image"}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xs text-white font-bold">
                      {creation.username ? creation.username[0].toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs text-white/80 truncate max-w-[80px]">
                      {creation.username || 'User'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      imageLikeToggle(creation.id);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition"
                  >
                    <Heart
                      className={`w-4 h-4 ${creation.likes.includes(user.id)
                          ? "fill-red-500 text-red-500"
                          : "text-white"
                        }`}
                    />
                    <span className="text-xs font-medium text-white">{creation.likes.length}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Empty State
        <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
            <Search className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No Creations Found
          </h3>
          <p className="text-muted-foreground max-w-sm">
            {searchQuery
              ? `No results found for "${searchQuery}". Try a different search term.`
              : "Be the first to publish a creation to the community!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Community;