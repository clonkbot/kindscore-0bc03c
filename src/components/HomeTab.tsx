import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useEffect } from "react";

interface HomeTabProps {
  childId: Id<"children">;
  onScanArt: () => void;
  onRecordMusic: () => void;
  onViewSubmission: (id: Id<"submissions">) => void;
}

interface Submission {
  _id: Id<"submissions">;
  type: "art" | "music";
  status: "pending" | "analyzing" | "done" | "failed";
  score?: number;
}

interface Contest {
  _id: Id<"contests">;
  title: string;
  description: string;
  type: "art" | "music";
  entryFee: number;
  endDate: number;
}

interface Achievement {
  _id: Id<"achievements">;
  title: string;
  iconName: string;
}

export function HomeTab({ childId, onScanArt, onRecordMusic, onViewSubmission }: HomeTabProps) {
  const recentSubmissions = useQuery(api.submissions.getRecent, { childId, limit: 5 });
  const achievements = useQuery(api.achievements.list, { childId });
  const contests = useQuery(api.contests.getActive);
  const checkAchievements = useMutation(api.achievements.checkAndAward);

  // Check for new achievements periodically
  useEffect(() => {
    checkAchievements({ childId });
  }, [recentSubmissions]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Action Cards */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onScanArt}
          className="relative overflow-hidden bg-gradient-to-br from-rose-400 to-orange-500 rounded-3xl p-6 text-left shadow-xl shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-x-4 -translate-y-8"></div>
          <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">📸</span>
          <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Scan Artwork
          </h3>
          <p className="text-white/80 text-sm mt-1">Take a photo</p>
        </button>

        <button
          onClick={onRecordMusic}
          className="relative overflow-hidden bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl p-6 text-left shadow-xl shadow-violet-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all group"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-x-4 -translate-y-8"></div>
          <span className="text-4xl block mb-3 group-hover:scale-110 transition-transform">🎵</span>
          <h3 className="text-white font-bold text-lg" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Record Music
          </h3>
          <p className="text-white/80 text-sm mt-1">Video performance</p>
        </button>
      </div>

      {/* Recent Scores */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>
          Recent Scores
        </h2>
        {recentSubmissions === undefined ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-24 h-32 rounded-2xl bg-gray-200 animate-pulse flex-shrink-0"></div>
            ))}
          </div>
        ) : recentSubmissions.length === 0 ? (
          <div className="bg-white/60 rounded-2xl p-8 text-center">
            <span className="text-4xl block mb-2">🎨</span>
            <p className="text-gray-500">No submissions yet!</p>
            <p className="text-gray-400 text-sm">Create your first artwork or music</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {recentSubmissions.map((sub: Submission) => (
              <button
                key={sub._id}
                onClick={() => sub.status === "done" && onViewSubmission(sub._id)}
                disabled={sub.status !== "done"}
                className="w-24 flex-shrink-0 bg-white rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition-transform disabled:opacity-60"
              >
                <div className={`h-16 flex items-center justify-center ${
                  sub.type === "art"
                    ? "bg-gradient-to-br from-rose-100 to-orange-100"
                    : "bg-gradient-to-br from-violet-100 to-indigo-100"
                }`}>
                  <span className="text-3xl">{sub.type === "art" ? "🎨" : "🎵"}</span>
                </div>
                <div className="p-2 text-center">
                  {sub.status === "done" ? (
                    <>
                      <div className="text-2xl font-bold text-indigo-600">{sub.score}</div>
                      <div className="text-xs text-gray-400">score</div>
                    </>
                  ) : sub.status === "analyzing" ? (
                    <div className="py-1">
                      <div className="w-6 h-6 mx-auto border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 py-2">Pending</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Active Contests */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>
          Active Contests
        </h2>
        {contests === undefined ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-gray-200 animate-pulse"></div>
            ))}
          </div>
        ) : contests.length === 0 ? (
          <div className="bg-white/60 rounded-2xl p-6 text-center">
            <span className="text-3xl block mb-2">🏆</span>
            <p className="text-gray-500">No active contests right now</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contests.slice(0, 2).map((contest: Contest) => {
              const daysLeft = Math.ceil((contest.endDate - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <div
                  key={contest._id}
                  className="bg-white rounded-2xl p-4 shadow-lg flex items-center gap-4"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    contest.type === "art"
                      ? "bg-gradient-to-br from-rose-400 to-orange-500"
                      : "bg-gradient-to-br from-violet-500 to-indigo-600"
                  }`}>
                    <span className="text-2xl">{contest.type === "art" ? "🖼️" : "🎼"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate" style={{ fontFamily: "'Nunito', sans-serif" }}>
                      {contest.title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{contest.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                        {daysLeft} days left
                      </span>
                      {contest.entryFee === 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          Free
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Achievements */}
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3" style={{ fontFamily: "'Nunito', sans-serif" }}>
          Achievements
        </h2>
        {achievements === undefined ? (
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-16 h-16 rounded-2xl bg-gray-200 animate-pulse"></div>
            ))}
          </div>
        ) : achievements.length === 0 ? (
          <div className="bg-white/60 rounded-2xl p-6 text-center">
            <span className="text-3xl block mb-2">🏅</span>
            <p className="text-gray-500">No achievements yet</p>
            <p className="text-gray-400 text-sm">Keep creating to earn badges!</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {achievements.map((ach: Achievement) => (
              <div
                key={ach._id}
                className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg"
                title={ach.title}
              >
                <span className="text-2xl">
                  {ach.iconName === "star" && "⭐"}
                  {ach.iconName === "palette" && "🎨"}
                  {ach.iconName === "music" && "🎵"}
                  {ach.iconName === "trophy" && "🏆"}
                  {ach.iconName === "sparkles" && "✨"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="pt-6 text-center">
        <p className="text-xs text-gray-300">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}
