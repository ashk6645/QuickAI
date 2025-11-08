import { useAuth, useUser } from "@clerk/clerk-react";
import React, { useEffect, useState } from "react";
import { Heart, Search } from "lucide-react";
import { LoadingSpinner, SkeletonImage } from "../components/LoadingComponents";
import axios from "axios";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const Community = () => {
  const [creations, setCreations] = useState([]);
  const [filteredCreations, setFilteredCreations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const {getToken} = useAuth();

  const fetchCreations = async () => {
    try {
      const {data} = await axios.get("/api/user/get-published-creations",{
        headers: {
          Authorization: `Bearer ${await getToken()}`
        },
      });
      if(data.success) {
        setCreations(data.creations);
        setFilteredCreations(data.creations);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);

  };

  const imageLikeToggle = async (id) =>{
    try {
      const {data} = await axios.post("/api/user/toggle-like-creation",{id},{
        headers: {
          Authorization: `Bearer ${await getToken()}`}
        })
        if(data.success){
          toast.success(data.message);
          await fetchCreations()
        }
        else{
          toast.error(data.message);
        }
    }
    catch (error) {
      toast.error(error.message);
      
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredCreations(creations);
    } else {
      const filtered = creations.filter(creation => 
        creation.prompt?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredCreations(filtered);
    }
  };
  

  useEffect(() => {
    if (user) {
      fetchCreations();
    }
  }, [user]);

  return (
    <div className="flex-1 h-full flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Community Gallery</h1>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by prompt..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square">
              <SkeletonImage />
            </div>
          ))}
        </div>
      ) : filteredCreations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCreations.map((creation) => (
            <div
              key={creation.id}
              className="relative group aspect-square overflow-hidden rounded-lg bg-gray-100"
            >
              <img
                src={creation.content}
                alt={creation.prompt || "AI Generated"}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm line-clamp-2 mb-2">
                    {creation.prompt || "AI Generated Image"}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => imageLikeToggle(creation.id)}
                      className="flex items-center gap-1 text-white hover:scale-110 transition"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          creation.likes.includes(user.id)
                            ? "fill-red-500 text-red-500"
                            : "text-white"
                        }`}
                      />
                      <span className="text-sm">{creation.likes.length}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Creations Found</h3>
          <p className="text-gray-500 max-w-sm">
            {searchQuery ? "Try a different search term" : "Be the first to publish a creation!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Community;
