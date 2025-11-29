import React, { useCallback, useMemo, useState } from "react";
import Markdown from "react-markdown";
import PropTypes from "prop-types";
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  FileText,
  Briefcase,
  GraduationCap,
  ExternalLink,
  CheckSquare,
  Square,
} from "lucide-react";

/**
 * CreationItem - optimized:
 * - memoized parsing & icon selection
 * - callbacks memoized
 * - lazy image loading + async decoding
 * - limited list rendering
 * - keyboard accessible toggle
 * - safe link rendering inside Markdown
 */
const MAX_LIST_ITEMS = 50; // defensive cap to avoid rendering huge lists

const ICON_MAP = {
  image: { icon: ImageIcon, bg: "bg-purple-500/10", text: "text-purple-600" },
  "job-opportunities": { icon: Briefcase, bg: "bg-blue-500/10", text: "text-blue-600" },
  "learning-resources": { icon: GraduationCap, bg: "bg-green-500/10", text: "text-green-600" },
  default: { icon: FileText, bg: "bg-blue-500/10", text: "text-blue-600" },
};

// Map types to proper display labels (matching backend type values)
const TYPE_LABELS = {
  "article": "Write Article",
  "blog-title": "Blog Titles",
  "image": "Generate Images",
  "remove-background": "Remove Background",
  "remove-object": "Remove Object",
  "resume-review": "Review Resume",
  "job-opportunities": "Job Opportunities",
  "learning-resources": "Learning Resources",
  "learning-roadmap": "Learning Roadmap",
};

const CreationItem = ({ item, onDelete, isSelected = false, onToggleSelect }) => {
  const [expanded, setExpanded] = useState(false);

  // memoize icon/color selection
  const { Icon, bgColor, textColor } = useMemo(() => {
    const entry = ICON_MAP[item?.type] || ICON_MAP.default;
    return { Icon: entry.icon, bgColor: entry.bg, textColor: entry.text };
  }, [item?.type]);

  // parse content once (defensive)
  const parsedContent = useMemo(() => {
    if (!item || typeof item.content !== "string") return null;

    if (item.type === "job-opportunities") {
      try {
        const arr = JSON.parse(item.content);
        return Array.isArray(arr) ? arr.slice(0, MAX_LIST_ITEMS) : [];
      } catch {
        // Fallback: attempt to split by newline and clean
        return item.content
          .split("\n")
          .map((s) => s.replace(/^[-•\d.\s"]+|["\s]+$/g, "").trim())
          .filter(Boolean)
          .slice(0, MAX_LIST_ITEMS);
      }
    }

    if (item.type === "learning-resources") {
      try {
        const arr = JSON.parse(item.content);
        return Array.isArray(arr) ? arr.slice(0, MAX_LIST_ITEMS) : [];
      } catch {
        return [];
      }
    }

    return item.content;
  }, [item]);

  // toggle expanded (keyboard accessible)
  const toggleExpanded = useCallback(() => setExpanded((v) => !v), []);

  const handleKeyToggle = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleExpanded();
    }
  }, [toggleExpanded]);

  const handleDelete = useCallback(
    (e) => {
      e.stopPropagation();
      // prompt confirmation on client side
      if (window.confirm("Are you sure you want to delete this creation?")) {
        onDelete?.(item.id);
      }
    },
    [item?.id, onDelete],
  );

  // Renderers
  const renderImage = useCallback(() => {
    // make sure to lazy-load
    return (
      <div className="relative group/image overflow-hidden rounded-md max-w-md">
        <img
          src={item.content}
          alt={item.prompt || "generated image"}
          className="w-full h-auto object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }, [item?.content, item?.prompt]);

  const renderJobTitles = useCallback(() => {
    const titles = Array.isArray(parsedContent) ? parsedContent : [];
    if (titles.length === 0) {
      return <p className="text-sm text-muted-foreground">No job suggestions available</p>;
    }
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground mb-3">Suggested Job Roles:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {titles.map((title, i) => (
            <div
              key={String(title) + i}
              className="p-3 bg-secondary/50 rounded-lg border border-border hover:border-primary/50 transition-colors"
            >
              <p className="text-sm font-medium text-foreground truncate">{title}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }, [parsedContent]);

  const renderResources = useCallback(() => {
    const resources = Array.isArray(parsedContent) ? parsedContent : [];
    if (resources.length === 0) {
      return <p className="text-sm text-muted-foreground">No resources available</p>;
    }

    return (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground mb-3">Learning Resources:</h3>
        {resources.map((resource, index) => {
          const key = `${resource.skill || resource.name || index}-${index}`;
          return (
            <div key={key} className="p-4 bg-secondary/50 rounded-lg border border-border">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h4 className="font-semibold text-foreground truncate">{resource.skill || resource.name}</h4>
              </div>
              {resource.importance && <p className="text-sm text-muted-foreground mb-3">{resource.importance}</p>}
              <div className="flex flex-wrap gap-2">
                {resource.youtubeLink && (
                  <a
                    href={resource.youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-600 rounded-md hover:bg-red-500/20 transition-colors"
                    aria-label={`Open YouTube resources for ${resource.skill || resource.name}`}
                  >
                    <ExternalLink className="w-3 h-3" />
                    YouTube
                  </a>
                )}
                {resource.articleLink && (
                  <a
                    href={resource.articleLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-600 rounded-md hover:bg-blue-500/20 transition-colors"
                    aria-label={`Open article resource for ${resource.skill || resource.name}`}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Article
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [parsedContent]);

  const renderMarkdown = useCallback(() => {
    return (
      <div className="prose prose-sm max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-primary">
        <Markdown
          components={{
            a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
          }}
        >
          {String(parsedContent || "")}
        </Markdown>
      </div>
    );
  }, [parsedContent]);

  const renderContent = useMemo(() => {
    if (item.type === "image") return renderImage();
    if (item.type === "job-opportunities") return renderJobTitles();
    if (item.type === "learning-resources") return renderResources();
    return renderMarkdown();
  }, [item?.type, renderImage, renderJobTitles, renderResources, renderMarkdown]);

  return (
    <div className="group bg-card hover:bg-secondary/50 border-b border-border last:border-0 transition-colors">
      <div
        className="flex justify-between items-center gap-4 p-4 cursor-pointer"
        onClick={toggleExpanded}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyToggle}
        aria-expanded={expanded}
        aria-controls={`creation-${item?.id}`}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          {onToggleSelect && (
            <div 
              className="flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSelect(item.id);
              }}
            >
              {isSelected ? (
                <CheckSquare className="w-5 h-5 text-primary cursor-pointer hover:text-primary/80 transition-colors" />
              ) : (
                <Square className="w-5 h-5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
              )}
            </div>
          )}
          
          <div className={`p-2 rounded-lg ${bgColor} ${textColor}`}>
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-medium text-foreground truncate">{item?.prompt}</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-muted-foreground">
                {item?.created_at ? new Date(item.created_at).toLocaleDateString() : ""}
              </p>
              <span className="text-xs text-muted-foreground"></span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-500/10 text-blue-600 border border-blue-500/20">
                {TYPE_LABELS[item?.type] || String(item?.type || "").replaceAll("-", " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDelete}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            title="Delete creation"
            aria-label="Delete creation"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <div className="text-muted-foreground" aria-hidden>
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {expanded && (
        <div id={`creation-${item?.id}`} className="px-4 pb-4 pl-[4.5rem]">
          <div className="bg-secondary/50 rounded-lg p-4 border border-border">{renderContent}</div>
        </div>
      )}
    </div>
  );
};

CreationItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    prompt: PropTypes.string,
    type: PropTypes.string,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    created_at: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
  onToggleSelect: PropTypes.func,
};

export default CreationItem;
