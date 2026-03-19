import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { AVATARS } from "./AddChildScreen";

interface ProfileTabProps {
  childId: Id<"children">;
  childName: string;
  avatarId: number;
  ageCategory: string;
  coins: number;
  onSignOut: () => void;
}

interface Achievement {
  type: string;
}

export function ProfileTab({ childId, childName, avatarId, ageCategory, coins, onSignOut }: ProfileTabProps) {
  const stats = useQuery(api.submissions.getStats, { childId });
  const achievements = useQuery(api.achievements.list, { childId });

  const avatar = AVATARS[avatarId] || AVATARS[0];

  const allAchievementTypes = [
    { type: "first_steps", title: "First Steps", icon: "⭐", description: "Complete your first submission" },
    { type: "art_explorer", title: "Art Explorer", icon: "🎨", description: "Submit 5 artworks" },
    { type: "music_star", title: "Music Star", icon: "🎵", description: "Submit 5 music performances" },
    { type: "perfect_10", title: "Perfect 10", icon: "🏆", description: "Receive a perfect score" },
    { type: "creative_superstar", title: "Creative Superstar", icon: "✨", description: "Complete 20 submissions" },
  ];

  const earnedTypes = new Set(achievements?.map((a: Achievement) => a.type) || []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 shadow-lg text-center">
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${avatar.bg} flex items-center justify-center mx-auto mb-4 shadow-xl`}>
          <span className="text-5xl">{avatar.emoji}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800" style={{ fontFamily: "'Nunito', sans-serif" }}>
          {childName}
        </h1>
        <p className="text-gray-500">Age Category: {ageCategory}</p>

        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-2xl">🪙</span>
          <span className="text-2xl font-bold text-amber-600">{coins}</span>
          <span className="text-gray-400">coins</span>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
          📊 Statistics
        </h2>

        {stats === undefined ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-indigo-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-indigo-600">{stats.totalSubmissions}</div>
              <div className="text-sm text-gray-500">Total Submissions</div>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-amber-600">{stats.averageScore || "—"}</div>
              <div className="text-sm text-gray-500">Average Score</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <div className="text-3xl font-bold text-green-600">{stats.highestScore || "—"}</div>
              <div className="text-sm text-gray-500">Highest Score</div>
            </div>
            <div className="bg-rose-50 rounded-xl p-4 text-center">
              <div className="flex justify-center gap-2 text-2xl">
                <span>🎨 {stats.artCount}</span>
                <span>🎵 {stats.musicCount}</span>
              </div>
              <div className="text-sm text-gray-500">Art / Music</div>
            </div>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
          🏅 Achievements
        </h2>

        <div className="grid grid-cols-1 gap-3">
          {allAchievementTypes.map((ach) => {
            const isEarned = earnedTypes.has(ach.type);
            return (
              <div
                key={ach.type}
                className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                  isEarned
                    ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200"
                    : "bg-gray-50 opacity-50"
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isEarned
                    ? "bg-gradient-to-br from-amber-400 to-yellow-500 shadow-md"
                    : "bg-gray-200"
                }`}>
                  <span className="text-2xl">{isEarned ? ach.icon : "🔒"}</span>
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold ${isEarned ? "text-gray-800" : "text-gray-500"}`}>
                    {ach.title}
                  </h3>
                  <p className="text-sm text-gray-400">{ach.description}</p>
                </div>
                {isEarned && (
                  <span className="text-green-500 text-xl">✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-lg font-bold text-gray-800 mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
          ⚙️ Settings
        </h2>

        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left">
            <span className="text-xl">📱</span>
            <span className="text-gray-700">Notification Preferences</span>
            <span className="ml-auto text-gray-300">→</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left">
            <span className="text-xl">📄</span>
            <span className="text-gray-700">Privacy Policy</span>
            <span className="ml-auto text-gray-300">→</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left">
            <span className="text-xl">ℹ️</span>
            <span className="text-gray-700">About KindScore</span>
            <span className="ml-auto text-gray-300">→</span>
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <button
        onClick={onSignOut}
        className="w-full py-4 rounded-2xl bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-colors"
      >
        Sign Out
      </button>

      {/* Footer */}
      <footer className="text-center pt-4 pb-8">
        <p className="text-xs text-gray-400">
          Operated by <span className="font-semibold">GASCA</span>
        </p>
        <p className="text-xs text-gray-400">Global Arts Sports Culture Association</p>
        <p className="text-xs text-gray-300 mt-2">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}
