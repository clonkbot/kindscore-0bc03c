import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface HistoryTabProps {
  childId: Id<"children">;
  onViewSubmission: (id: Id<"submissions">) => void;
}

type Filter = "all" | "art" | "music";

interface Submission {
  _id: Id<"submissions">;
  type: "art" | "music";
  status: "pending" | "analyzing" | "done" | "failed";
  score?: number;
  sceneSummary?: string;
  createdAt: number;
}

export function HistoryTab({ childId, onViewSubmission }: HistoryTabProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const submissions = useQuery(api.submissions.list, { childId });

  const filteredSubmissions = submissions?.filter((s: Submission) => {
    if (filter === "all") return true;
    return s.type === filter;
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
        History
      </h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: "all" as Filter, label: "All" },
          { id: "art" as Filter, label: "🎨 Art" },
          { id: "music" as Filter, label: "🎵 Music" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              filter === tab.id
                ? "bg-indigo-500 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Submissions List */}
      {submissions === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-gray-200 animate-pulse"></div>
          ))}
        </div>
      ) : filteredSubmissions && filteredSubmissions.length === 0 ? (
        <div className="bg-white/60 rounded-2xl p-12 text-center">
          <span className="text-5xl block mb-3">
            {filter === "art" ? "🎨" : filter === "music" ? "🎵" : "📜"}
          </span>
          <p className="text-gray-600 font-medium">No submissions yet</p>
          <p className="text-gray-400 text-sm mt-1">
            {filter === "all"
              ? "Start creating to see your history!"
              : `No ${filter} submissions found`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSubmissions?.map((sub: Submission) => (
            <button
              key={sub._id}
              onClick={() => sub.status === "done" && onViewSubmission(sub._id)}
              disabled={sub.status !== "done"}
              className="w-full bg-white rounded-2xl p-4 shadow-md flex items-center gap-4 hover:scale-[1.01] transition-all text-left disabled:opacity-60"
            >
              {/* Thumbnail */}
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${
                sub.type === "art"
                  ? "bg-gradient-to-br from-rose-100 to-orange-100"
                  : "bg-gradient-to-br from-violet-100 to-indigo-100"
              }`}>
                <span className="text-3xl">{sub.type === "art" ? "🎨" : "🎵"}</span>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    sub.type === "art"
                      ? "bg-rose-100 text-rose-700"
                      : "bg-violet-100 text-violet-700"
                  }`}>
                    {sub.type === "art" ? "Artwork" : "Music"}
                  </span>
                  {sub.status === "analyzing" && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      Analyzing...
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1 truncate">
                  {sub.sceneSummary || (sub.status === "analyzing" ? "AI is analyzing your work..." : "Pending analysis")}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(sub.createdAt)}
                </p>
              </div>

              {/* Score Badge */}
              {sub.status === "done" && sub.score !== undefined && (
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex flex-col items-center justify-center text-white shadow-lg">
                  <span className="text-xl font-bold">{sub.score}</span>
                  <span className="text-xs opacity-80">score</span>
                </div>
              )}

              {sub.status === "analyzing" && (
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
