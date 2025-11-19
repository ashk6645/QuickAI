import React, { useMemo, useState } from "react";
import Markdown from "react-markdown";
import { Trash2 } from "lucide-react";
import PropTypes from "prop-types";

const CreationItem = ({ item, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const formatContentAsMarkdown = (raw) => {
    if (!raw) return "";

    if (item.type === "job-opportunities") {
      try {
        const jobTitles = JSON.parse(raw);
        if (Array.isArray(jobTitles)) {
          return jobTitles.map((t) => `- ${t}`).join("\n");
        }
      } catch {
        return raw;
      }
    }

    if (item.type === "learning-resources") {
      try {
        const resources = JSON.parse(raw);
        if (resources?.skills && Array.isArray(resources.skills)) {
          let md = "";
          resources.skills.forEach((skill, index) => {
            md += `## ${index + 1}. ${skill.skillName}\n\n`;

            if (skill.resources?.youtube?.length) {
              md += `### YouTube Videos\n\n`;
              skill.resources.youtube.forEach((v) => {
                md += `- [${v.title}](${v.url})`;
                if (v.description) md += ` - ${v.description}`;
                md += "\n";
              });
              md += "\n";
            }

            if (skill.resources?.articles?.length) {
              md += `### Articles & Tutorials\n\n`;
              skill.resources.articles.forEach((a) => {
                md += `- [${a.title}](${a.url})`;
                if (a.source) md += ` (${a.source})`;
                if (a.description) md += ` - ${a.description}`;
                md += "\n";
              });
              md += "\n";
            }
          });
          return md;
        }
      } catch {
        return raw;
      }
    }

    // default
    return raw;
  };

  // memoize formatted markdown so we don't re-parse on every render
  const formattedContent = useMemo(
    () => formatContentAsMarkdown(item.content),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item.content, item.type] // safe dependency list
  );

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this creation?")) {
      onDelete(item.id);
    }
  };

  return (
    <div
      className="p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 transition"
      aria-expanded={expanded}
    >
      <div
        className="flex justify-between items-center gap-4"
        onClick={() => setExpanded((s) => !s)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((s) => !s);
          }
        }}
      >
        <div className="flex-1">
          <h2 className="font-medium">{item.prompt}</h2>
          <p className="text-gray-500">
            {item.type} - {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full">
            {item.type}
          </button>

          <button
            onClick={handleDelete}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
            title="Delete creation"
            aria-label="Delete creation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div>
          {item.type === "image" ? (
            <div>
              <img
                src={item.content}
                alt={item.prompt || "creation image"}
                className="mt-3 w-full max-w-md object-contain"
              />
            </div>
          ) : (
            <div className="mt-3 max-h-64 overflow-y-auto text-sm text-slate-700">
              <div className="reset-tw">
                <Markdown
                  // ensure links open safely
                  components={{
                    a: ({ node, ...props }) => (
                      <a {...props} target="_blank" rel="noopener noreferrer" />
                    ),
                  }}
                >
                  {formattedContent}
                </Markdown>
              </div>
            </div>
          )}
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
    content: PropTypes.string,
    created_at: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default CreationItem;
