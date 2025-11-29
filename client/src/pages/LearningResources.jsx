import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Youtube,
  ExternalLink,
  GraduationCap,
  Loader2,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const LearningResources = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [resources, setResources] = useState([]);
  const { getToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description");
      return;
    }

    setLoading(true);
    setResources([]);

    try {
      const { data } = await axios.post(
        "/api/ai/generate-learning-resources",
        { jobDescription },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        setResources(data.resources);
        toast.success("Learning resources generated!");
      } else {
        toast.error(data.message || "Failed to generate resources");
      }
    } catch (error) {
      console.error("Error generating resources:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm sticky top-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Job Description
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Paste Job Description
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
                    className="w-full h-64 p-4 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition text-foreground placeholder:text-muted-foreground text-sm leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !jobDescription.trim()}
                  className="w-full flex justify-center items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Find Resources
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-2">
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm h-[calc(100vh-8rem)] flex flex-col">
              <div className="flex items-center gap-3 mb-6 flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Learning Resources
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {resources.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center text-center py-16 opacity-50">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                      <BookOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground max-w-xs">
                      Paste a job description and click "Find Resources" to get
                      curated learning materials for required skills.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {resources.map((resource, index) => (
                      <div
                        key={index}
                        className="border border-border rounded-lg p-5 hover:border-primary/50 hover:shadow-md transition bg-card group"
                      >
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">
                              {resource.skill}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {resource.importance}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border">
                          <a
                            href={resource.youtubeLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium border border-red-100 flex-1 justify-center sm:flex-none"
                          >
                            <Youtube className="w-4 h-4" />
                            Watch Tutorials
                          </a>
                          <a
                            href={resource.articleLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium border border-blue-100 flex-1 justify-center sm:flex-none"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Read Article
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningResources;
