import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { AVATARS } from "./AddChildScreen";

interface ContestsTabProps {
  childId: Id<"children">;
  ageCategory: string;
}

interface Contest {
  _id: Id<"contests">;
  title: string;
  description: string;
  type: "art" | "music";
  ageCategories: string[];
  entryFee: number;
  endDate: number;
  status: "upcoming" | "active" | "judging" | "completed";
}

interface LeaderboardEntry {
  childName: string;
  avatarId: number;
  score: number;
}

export function ContestsTab({ childId, ageCategory }: ContestsTabProps) {
  const contests = useQuery(api.contests.list);
  const [selectedContest, setSelectedContest] = useState<Id<"contests"> | null>(null);

  const selectedContestData = contests?.find((c: Contest) => c._id === selectedContest);
  const leaderboard = useQuery(
    api.contests.getLeaderboard,
    selectedContest ? { contestId: selectedContest } : "skip"
  );

  const formatCountdown = (endDate: number) => {
    const now = Date.now();
    const diff = endDate - now;
    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  if (selectedContest && selectedContestData) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <button
          onClick={() => setSelectedContest(null)}
          className="text-indigo-600 font-medium mb-4 flex items-center gap-1"
        >
          ← Back to Contests
        </button>

        {/* Contest Header */}
        <div className={`rounded-3xl p-6 mb-6 ${
          selectedContestData.type === "art"
            ? "bg-gradient-to-br from-rose-400 to-orange-500"
            : "bg-gradient-to-br from-violet-500 to-indigo-600"
        }`}>
          <span className="text-5xl block mb-4">
            {selectedContestData.type === "art" ? "🖼️" : "🎼"}
          </span>
          <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {selectedContestData.title}
          </h1>
          <p className="text-white/90">{selectedContestData.description}</p>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
              {formatCountdown(selectedContestData.endDate)}
            </span>
            <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm">
              Ages: {selectedContestData.ageCategories.join(", ")}
            </span>
            {selectedContestData.entryFee === 0 && (
              <span className="bg-green-400/30 text-white px-3 py-1 rounded-full text-sm">
                Free Entry
              </span>
            )}
          </div>
        </div>

        {/* Eligibility Check */}
        {!selectedContestData.ageCategories.includes(ageCategory) && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
            <p className="text-amber-700 font-medium">
              This contest is for ages {selectedContestData.ageCategories.join(", ")}
            </p>
            <p className="text-amber-600 text-sm mt-1">
              Your age category ({ageCategory}) is not eligible for this contest.
            </p>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
            🏆 Leaderboard
          </h2>

          {leaderboard === undefined ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse"></div>
              ))}
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl block mb-2">🌟</span>
              <p className="text-gray-500">No entries yet!</p>
              <p className="text-gray-400 text-sm">Be the first to enter</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry: LeaderboardEntry, index: number) => {
                const avatar = AVATARS[entry.avatarId] || AVATARS[0];
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-xl ${
                      index === 0
                        ? "bg-gradient-to-r from-amber-100 to-yellow-100"
                        : index === 1
                        ? "bg-gradient-to-r from-gray-100 to-slate-100"
                        : index === 2
                        ? "bg-gradient-to-r from-orange-50 to-amber-50"
                        : "bg-gray-50"
                    }`}
                  >
                    <span className="text-lg font-bold text-gray-400 w-6">
                      {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                    </span>
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatar.bg} flex items-center justify-center`}>
                      <span className="text-lg">{avatar.emoji}</span>
                    </div>
                    <span className="flex-1 font-medium text-gray-700">{entry.childName}</span>
                    <span className="font-bold text-indigo-600">{entry.score}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Enter Button */}
        {selectedContestData.ageCategories.includes(ageCategory) && selectedContestData.status === "active" && (
          <button className="w-full mt-6 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold text-lg shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
            Enter Contest
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
        Contests
      </h1>

      {contests === undefined ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-gray-200 animate-pulse"></div>
          ))}
        </div>
      ) : contests.length === 0 ? (
        <div className="bg-white/60 rounded-2xl p-12 text-center">
          <span className="text-5xl block mb-3">🏆</span>
          <p className="text-gray-600 font-medium">No contests available</p>
          <p className="text-gray-400 text-sm mt-1">Check back soon for new competitions!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {contests.map((contest: Contest) => {
            const isEligible = contest.ageCategories.includes(ageCategory);
            const isActive = contest.status === "active";

            return (
              <button
                key={contest._id}
                onClick={() => setSelectedContest(contest._id)}
                className="w-full bg-white rounded-2xl p-5 shadow-lg text-left hover:scale-[1.01] transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    contest.type === "art"
                      ? "bg-gradient-to-br from-rose-400 to-orange-500"
                      : "bg-gradient-to-br from-violet-500 to-indigo-600"
                  }`}>
                    <span className="text-2xl">{contest.type === "art" ? "🖼️" : "🎼"}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800" style={{ fontFamily: "'Nunito', sans-serif" }}>
                      {contest.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {contest.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isActive
                          ? "bg-green-100 text-green-700"
                          : contest.status === "upcoming"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {contest.status === "active"
                          ? formatCountdown(contest.endDate)
                          : contest.status === "upcoming"
                          ? "Coming Soon"
                          : "Completed"}
                      </span>

                      {isEligible ? (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                          Eligible
                        </span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                          Ages {contest.ageCategories.join(", ")}
                        </span>
                      )}

                      {contest.entryFee === 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Free
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-gray-300 text-xl">→</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
