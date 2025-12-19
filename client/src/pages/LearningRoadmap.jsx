import React, { useState } from "react";
import {
  Map,
  Search,
  Loader2,
  Target,
  Clock,
  TrendingUp,
  CheckCircle2,
  BookOpen,
  Video,
  FileText,
  Code,
  Award,
  Trophy,
  ArrowRight,
  Briefcase,
  DollarSign,
  PlayCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import DataPipeline from "../components/DataPipeline";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const LearningRoadmap = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [isDataFlowing, setIsDataFlowing] = useState(false);
  const [isReceiving, setIsReceiving] = useState(false);
  const { getToken } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      toast.error("Please enter a job role or topic");
      return;
    }

    setLoading(true);
    setRoadmap(null);
    setIsDataFlowing(true);
    setIsReceiving(false);

    // Simulate data reaching output section
    setTimeout(() => {
      setIsReceiving(true);
    }, 1000);

    try {
      const { data } = await axios.post(
        "/api/ai/generate-learning-roadmap",
        { input },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        setRoadmap(data.roadmap);
        toast.success("Roadmap generated successfully!");
        // Stop animations after content is displayed
        setTimeout(() => {
          setIsDataFlowing(false);
          setIsReceiving(false);
        }, 500);
      } else {
        console.error("Roadmap generation failed:", data);
        toast.error(data.message || "Failed to generate roadmap");
        setIsDataFlowing(false);
        setIsReceiving(false);
      }
    } catch (error) {
      console.error("Error generating roadmap:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Something went wrong");
      setIsDataFlowing(false);
      setIsReceiving(false);
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "article":
        return <FileText className="w-4 h-4" />;
      case "practice":
        return <Code className="w-4 h-4" />;
      case "book":
        return <BookOpen className="w-4 h-4" />;
      case "course":
        return <Award className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border shadow-sm sticky top-0 relative">
              <DataPipeline isActive={isDataFlowing} isReceiving={isReceiving} />
              <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-border bg-muted/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Map className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Learning Roadmap
                </h2>
              </div>

              <div className="space-y-5 p-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    What do you want to learn?
                  </label>
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter a job description or topic you want to learn..."
                    className="w-full h-48 p-4 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none transition text-foreground placeholder:text-muted-foreground text-sm leading-relaxed"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || !input.trim()}
                  className="w-full flex justify-center items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Your Path...
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      Generate Roadmap
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="lg:col-span-2">
            <div className={`bg-card rounded-xl border h-[calc(100vh-8rem)] flex flex-col transition-all duration-500 ${
              isReceiving ? 'border-primary/50 animate-receiving-pulse' : 'border-border shadow-sm'
            }`}>
              <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-border bg-muted/50 flex-shrink-0">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Your Learning Path
                </h2>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 pl-6 custom-scrollbar">
                {roadmap ? (
                  <div className="space-y-8">
                    {/* Header Section */}
                    <div className="space-y-4">
                      <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                          {roadmap.title}
                        </h1>
                        <p className="text-muted-foreground leading-relaxed">
                          {roadmap.description}
                        </p>
                      </div>

                      {/* Quick Stats Grid */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                          <Clock className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-xs text-primary font-medium">Duration</p>
                            <p className="text-sm font-semibold text-foreground">{roadmap.totalDuration}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-green-500/5 rounded-lg border border-green-500/10">
                          <Target className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-xs text-green-600 font-medium">Phases</p>
                            <p className="text-sm font-semibold text-foreground">{roadmap.phases?.length || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-purple-500/5 rounded-lg border border-purple-500/10">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="text-xs text-purple-600 font-medium">Level</p>
                            <p className="text-sm font-semibold text-foreground">{roadmap.difficulty}</p>
                          </div>
                        </div>
                        {roadmap.salaryRange && (
                          <div className="flex items-center gap-2 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                            <div>
                              <p className="text-xs text-emerald-600 font-medium">Salary</p>
                              <p className="text-sm font-semibold text-foreground">{roadmap.salaryRange}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Prerequisites */}
                      {roadmap.prerequisites && roadmap.prerequisites.length > 0 && (
                        <div className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/10">
                          <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Prerequisites
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {roadmap.prerequisites.map((prereq, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-background text-foreground rounded-md text-xs font-medium border border-border"
                              >
                                {prereq}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Learning Phases */}
                    <div className="space-y-6">
                      {roadmap.phases && roadmap.phases.map((phase, phaseIdx) => (
                        <div key={phaseIdx} className="relative">
                          {/* Phase Card */}
                          <div className="bg-muted/30 rounded-xl border-2 border-border overflow-hidden">
                            {/* Phase Header */}
                            <div className="bg-card p-5 border-b border-border">
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/30 flex-shrink-0">
                                  {phase.phaseNumber}
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-foreground mb-1">
                                    {phase.phaseName}
                                  </h3>
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                      <Clock className="w-3.5 h-3.5" />
                                      {phase.duration}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {phase.description}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Modules */}
                            <div className="p-5 space-y-4">
                              {phase.modules && phase.modules.map((module, moduleIdx) => (
                                <div key={moduleIdx} className="bg-card rounded-lg border border-border overflow-hidden">
                                  {/* Module Header */}
                                  <div className="bg-muted/50 p-4 border-b border-border">
                                    <div className="flex items-center justify-between">
                                      <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-primary" />
                                        {module.moduleName}
                                      </h4>
                                      <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                                        {module.duration}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="p-4 space-y-4">
                                    {/* Topics */}
                                    {module.topics && module.topics.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                          Topics Covered
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {module.topics.map((topic, topicIdx) => (
                                            <span
                                              key={topicIdx}
                                              className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium border border-primary/20"
                                            >
                                              {topic}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Learning Objectives */}
                                    {module.learningObjectives && module.learningObjectives.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                          Learning Objectives
                                        </p>
                                        <ul className="space-y-2">
                                          {module.learningObjectives.map((objective, objIdx) => (
                                            <li
                                              key={objIdx}
                                              className="flex items-start gap-2 text-sm text-foreground"
                                            >
                                              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                              <span>{objective}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {/* Resources */}
                                    {module.resources && module.resources.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                          Recommended Resources
                                        </p>
                                        <div className="space-y-2">
                                          {module.resources.map((resource, resIdx) => {
                                            const hasUrl = resource.url && resource.url !== 'placeholder-url' && !resource.url.includes('placeholder');
                                            const ResourceWrapper = hasUrl ? 'a' : 'div';
                                            const wrapperProps = hasUrl ? {
                                              href: resource.url,
                                              target: "_blank",
                                              rel: "noopener noreferrer",
                                              className: "flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition cursor-pointer group"
                                            } : {
                                              className: "flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border transition"
                                            };

                                            return (
                                              <ResourceWrapper key={resIdx} {...wrapperProps}>
                                                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-muted-foreground shadow-sm flex-shrink-0 mt-0.5">
                                                  {getResourceIcon(resource.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-foreground">
                                                      {resource.title}
                                                    </p>
                                                    {hasUrl && (
                                                      <ExternalLink className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition flex-shrink-0" />
                                                    )}
                                                  </div>
                                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    {resource.author && (
                                                      <span className="text-xs text-muted-foreground">
                                                        by {resource.author}
                                                      </span>
                                                    )}
                                                    {resource.platform && (
                                                      <span className="text-xs text-muted-foreground">
                                                        • {resource.platform}
                                                      </span>
                                                    )}
                                                    {resource.duration && (
                                                      <span className="text-xs text-muted-foreground">
                                                        • {resource.duration}
                                                      </span>
                                                    )}
                                                    {resource.difficulty && (
                                                      <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full font-medium">
                                                        {resource.difficulty}
                                                      </span>
                                                    )}
                                                    {resource.priority && resource.priority === "Essential" && (
                                                      <span className="px-2 py-0.5 text-xs bg-red-500/10 text-red-600 rounded-full font-medium">
                                                        Essential
                                                      </span>
                                                    )}
                                                  </div>
                                                </div>
                                              </ResourceWrapper>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {/* Practice Problems */}
                                    {module.practiceProblems && module.practiceProblems.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                          <Target className="w-3.5 h-3.5" />
                                          Practice Problems
                                        </p>
                                        <div className="space-y-2">
                                          {module.practiceProblems.map((problem, probIdx) => (
                                            <div
                                              key={probIdx}
                                              className="flex items-center justify-between p-2.5 bg-blue-500/5 rounded-lg border border-blue-500/10"
                                            >
                                              <div className="flex items-center gap-2">
                                                <Code className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-medium text-foreground">
                                                  {typeof problem === 'string' ? problem : problem.title}
                                                </span>
                                              </div>
                                              {typeof problem === 'object' && (
                                                <div className="flex items-center gap-2">
                                                  {problem.platform && (
                                                    <span className="text-xs text-muted-foreground">
                                                      {problem.platform}
                                                    </span>
                                                  )}
                                                  {problem.difficulty && (
                                                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                                      problem.difficulty === 'Easy' 
                                                        ? 'bg-green-500/10 text-green-600'
                                                        : problem.difficulty === 'Medium'
                                                        ? 'bg-amber-500/10 text-amber-600'
                                                        : 'bg-red-500/10 text-red-600'
                                                    }`}>
                                                      {problem.difficulty}
                                                    </span>
                                                  )}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Projects */}
                                    {module.projects && module.projects.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                          <Code className="w-3.5 h-3.5" />
                                          Practice Projects
                                        </p>
                                        <div className="space-y-3">
                                          {module.projects.map((project, projIdx) => {
                                            // Handle both string and object formats
                                            const isObject = typeof project === 'object' && project !== null;
                                            const projectName = isObject ? project.name : project;
                                            const projectDesc = isObject ? project.description : null;
                                            const projectSkills = isObject ? project.skills : null;
                                            const projectTime = isObject ? project.estimatedTime : null;

                                            return (
                                              <div
                                                key={projIdx}
                                                className="p-3 bg-purple-500/5 rounded-lg border border-purple-500/10"
                                              >
                                                <div className="flex items-start gap-2 mb-2">
                                                  <PlayCircle className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                                                  <span className="text-sm font-semibold text-foreground">
                                                    {projectName}
                                                  </span>
                                                </div>
                                                {projectDesc && (
                                                  <p className="text-xs text-muted-foreground mb-2 ml-6">
                                                    {projectDesc}
                                                  </p>
                                                )}
                                                {projectSkills && projectSkills.length > 0 && (
                                                  <div className="flex flex-wrap gap-1.5 ml-6 mb-2">
                                                    {projectSkills.map((skill, skillIdx) => (
                                                      <span
                                                        key={skillIdx}
                                                        className="px-2 py-0.5 bg-purple-600/10 text-purple-600 rounded text-xs font-medium"
                                                      >
                                                        {skill}
                                                      </span>
                                                    ))}
                                                  </div>
                                                )}
                                                {projectTime && (
                                                  <div className="flex items-center gap-1.5 ml-6">
                                                    <Clock className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground">
                                                      {projectTime}
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Capstone Project */}
                            {phase.capstoneProject && (
                              <div className="p-5 bg-indigo-500/5 border-t-2 border-indigo-500/20">
                                <div className="flex items-start gap-3">
                                  <Award className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1">
                                    <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">
                                      Phase Capstone Project
                                    </p>
                                    <p className="text-base font-bold text-foreground mb-2">
                                      {phase.capstoneProject.name}
                                    </p>
                                    {phase.capstoneProject.description && (
                                      <p className="text-sm text-muted-foreground mb-2">
                                        {phase.capstoneProject.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                      {phase.capstoneProject.estimatedTime && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {phase.capstoneProject.estimatedTime}
                                        </span>
                                      )}
                                      {phase.capstoneProject.deliverable && (
                                        <span>
                                          Deliverable: {phase.capstoneProject.deliverable}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Phase Milestone */}
                            {phase.milestone && (
                              <div className="p-5 bg-green-500/5 border-t-2 border-green-500/20">
                                <div className="flex items-start gap-3">
                                  <Trophy className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                                      Phase Milestone
                                    </p>
                                    <p className="text-sm font-semibold text-foreground">
                                      {phase.milestone}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Skills Acquired */}
                    {roadmap.skillsAcquired && roadmap.skillsAcquired.length > 0 && (
                      <div className="p-5 bg-primary/5 rounded-xl border-2 border-primary/10">
                        <div className="flex items-center gap-2 mb-4">
                          <Award className="w-5 h-5 text-primary" />
                          <h3 className="font-bold text-foreground">Skills You'll Acquire</h3>
                        </div>
                        <div className="space-y-3">
                          {roadmap.skillsAcquired.map((skillCategory, idx) => (
                            <div key={idx}>
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                {skillCategory.category}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {skillCategory.skills && skillCategory.skills.map((skill, skillIdx) => (
                                  <span
                                    key={skillIdx}
                                    className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium border border-primary/20"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Career Paths */}
                    {roadmap.careerPaths && roadmap.careerPaths.length > 0 && (
                      <div className="p-5 bg-indigo-500/5 rounded-xl border-2 border-indigo-500/10">
                        <div className="flex items-center gap-2 mb-3">
                          <Briefcase className="w-5 h-5 text-indigo-600" />
                          <h3 className="font-bold text-foreground">Career Opportunities</h3>
                        </div>
                        <div className="space-y-3">
                          {roadmap.careerPaths.map((path, idx) => {
                            // Handle both string and object formats
                            const isObject = typeof path === 'object' && path !== null;
                            const roleName = isObject ? path.role : path;
                            
                            return isObject ? (
                              <div
                                key={idx}
                                className="p-4 bg-background rounded-lg border border-border shadow-sm"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="text-sm font-bold text-foreground">{path.role}</h4>
                                  {path.salaryRange && (
                                    <div className="flex items-center gap-1 text-green-600">
                                      <DollarSign className="w-4 h-4" />
                                      <span className="text-xs font-semibold">{path.salaryRange}</span>
                                    </div>
                                  )}
                                </div>
                                {path.description && (
                                  <p className="text-xs text-muted-foreground mb-2">{path.description}</p>
                                )}
                                {path.demandLevel && (
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                                    path.demandLevel === 'High'
                                      ? 'bg-green-500/10 text-green-600'
                                      : path.demandLevel === 'Medium'
                                      ? 'bg-amber-500/10 text-amber-600'
                                      : 'bg-gray-500/10 text-gray-600'
                                  }`}>
                                    <TrendingUp className="w-3 h-3" />
                                    {path.demandLevel} Demand
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span
                                key={idx}
                                className="inline-block px-4 py-2 bg-background text-foreground rounded-lg text-sm font-semibold border border-border shadow-sm"
                              >
                                {roleName}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Certifications */}
                    {roadmap.certifications && roadmap.certifications.length > 0 && (
                      <div className="p-5 bg-amber-500/5 rounded-xl border-2 border-amber-500/10">
                        <div className="flex items-center gap-2 mb-3">
                          <Award className="w-5 h-5 text-amber-600" />
                          <h3 className="font-bold text-foreground">Recommended Certifications</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {roadmap.certifications.map((cert, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-background rounded-lg border border-border"
                            >
                              <p className="text-sm font-semibold text-foreground mb-1">
                                {cert.name}
                              </p>
                              <p className="text-xs text-muted-foreground mb-2">
                                {cert.provider}
                              </p>
                              {cert.value && (
                                <p className="text-xs text-muted-foreground mb-2">
                                  {cert.value}
                                </p>
                              )}
                              {cert.difficulty && (
                                <span className="inline-block px-2 py-0.5 bg-amber-600/10 text-amber-600 rounded-full text-xs font-medium">
                                  {cert.difficulty}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Next Steps */}
                    {roadmap.nextSteps && roadmap.nextSteps.length > 0 && (
                      <div className="p-5 bg-primary/5 rounded-xl border-2 border-primary/10">
                        <div className="flex items-center gap-2 mb-3">
                          <ArrowRight className="w-5 h-5 text-primary" />
                          <h3 className="font-bold text-foreground">Next Steps</h3>
                        </div>
                        <ul className="space-y-2">
                          {roadmap.nextSteps.map((step, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 text-sm text-foreground p-3 bg-card rounded-lg border border-border"
                            >
                              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                              <span className="font-medium">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[400px] flex flex-col justify-center items-center text-center py-16 opacity-50">
                    <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
                      <Map className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground max-w-xs">
                      Enter a job description or topic you want to master and click "Generate Roadmap", to get a structured learning path.
                    </p>
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

export default LearningRoadmap;