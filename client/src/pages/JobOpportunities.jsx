import {
  FileText,
  Search,
  Briefcase,
  ExternalLink,
  Sparkles,
  Upload,
} from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const JobOpportunities = () => {
  const [resume, setResume] = useState(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobTitles, setJobTitles] = useState([]);
  const [searchingJob, setSearchingJob] = useState(null);
  const [searchResults, setSearchResults] = useState({});

  const { getToken } = useAuth();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setResume(file);
    setFileName(file ? file.name : "");
    setJobTitles([]);
    setSearchResults({});
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("resume", resume);

      const { data } = await axios.post(
        "/api/ai/find-job-opportunities",
        formData,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        setJobTitles(data.jobTitles || []);
        toast.success("Job opportunities found!");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
    setLoading(false);
  };

  const handleSearchJob = async (jobTitle) => {
    try {
      setSearchingJob(jobTitle);
      const { data } = await axios.post(
        "/api/ai/search-jobs",
        { jobTitle },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (data.success && data.searchData) {
        setSearchResults((prev) => ({
          ...prev,
          [jobTitle]: data.searchData,
        }));
        toast.success("Job search links generated!");
      } else {
        toast.error(data.message || "Failed to generate job search links");
      }
    } catch (error) {
      console.error("Error searching jobs:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to search jobs"
      );
    } finally {
      setSearchingJob(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border shadow-sm sticky top-0">
              <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-border bg-muted/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Upload Resume
                </h2>
              </div>

              <form onSubmit={onSubmitHandler} className="space-y-5 p-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Resume File
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer bg-secondary/30 hover:bg-secondary transition"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF (MAX. 5MB)
                        </p>
                      </div>
                      <input
                        id="dropzone-file"
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        required
                      />
                    </label>
                  </div>
                </div>

                {fileName && (
                  <div className="bg-secondary/30 p-3 rounded-lg border border-border">
                    <p className="text-sm text-foreground truncate flex items-center gap-2">
                      <FileText className="w-4 h-4 flex-shrink-0 text-primary" />
                      <span className="truncate">{fileName}</span>
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !resume}
                  className="w-full flex justify-center items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                >
                  {loading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <Briefcase className="w-5 h-5" />
                      Find Opportunities
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Job Opportunities Section */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border border-border shadow-sm h-[calc(100vh-8rem)] flex flex-col">
              <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-border bg-muted/50 flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Suggested Job Roles
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 pl-6 custom-scrollbar">
                {jobTitles.length === 0 ? (
                  <div className="h-full flex flex-col justify-center items-center text-center py-16 opacity-50">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                      <Briefcase className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground max-w-xs">
                      Upload your resume and click "Find Opportunities" to
                      discover relevant job roles
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobTitles.map((jobTitle, index) => {
                      const isSearching = searchingJob === jobTitle;
                      const searchData = searchResults[jobTitle];

                      return (
                        <div
                          key={index}
                          className="border border-border rounded-lg p-4 hover:border-primary/50 hover:shadow-md transition bg-card"
                        >
                          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <h3 className="text-lg font-medium text-foreground flex-1 min-w-[200px]">
                              {jobTitle}
                            </h3>
                            <button
                              onClick={() => handleSearchJob(jobTitle)}
                              disabled={isSearching}
                              className="flex items-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition disabled:opacity-70 disabled:cursor-not-allowed text-sm whitespace-nowrap border border-border"
                            >
                              {isSearching ? (
                                <>
                                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                  Searching...
                                </>
                              ) : (
                                <>
                                  <Search className="w-4 h-4" />
                                  {searchData && searchData.searchUrls
                                    ? "Refresh Links"
                                    : "Search Jobs"}
                                </>
                              )}
                            </button>
                          </div>

                          {searchData && searchData.searchUrls && (
                            <div className="mt-4 pt-4 border-t border-border animate-in fade-in duration-300">
                              {searchData.keywords && (
                                <p className="text-sm text-muted-foreground mb-3">
                                  <strong className="text-foreground">
                                    Keywords:
                                  </strong>{" "}
                                  {searchData.keywords}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-2">
                                {searchData.searchUrls.indeed && (
                                  <a
                                    href={searchData.searchUrls.indeed}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium shadow-sm hover:shadow-md border border-blue-100"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Indeed
                                  </a>
                                )}
                                {searchData.searchUrls.linkedin && (
                                  <a
                                    href={searchData.searchUrls.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition text-sm font-medium shadow-sm hover:shadow-md border border-blue-100"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    LinkedIn
                                  </a>
                                )}
                                {searchData.searchUrls.glassdoor && (
                                  <a
                                    href={searchData.searchUrls.glassdoor}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition text-sm font-medium shadow-sm hover:shadow-md border border-green-100"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Glassdoor
                                  </a>
                                )}
                                {searchData.searchUrls.internshala && (
                                  <a
                                    href={searchData.searchUrls.internshala}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-700 rounded-lg hover:bg-sky-100 transition text-sm font-medium shadow-sm hover:shadow-md border border-sky-100"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Internshala
                                  </a>
                                )}
                                {searchData.searchUrls.naukri && (
                                  <a
                                    href={searchData.searchUrls.naukri}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition text-sm font-medium shadow-sm hover:shadow-md border border-indigo-100"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    Naukri
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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

export default JobOpportunities;
