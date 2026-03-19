import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { AVATARS } from "./AddChildScreen";
import { HomeTab } from "./HomeTab";
import { HistoryTab } from "./HistoryTab";
import { ContestsTab } from "./ContestsTab";
import { ProfileTab } from "./ProfileTab";
import { CaptureFlow } from "./CaptureFlow";
import { ResultScreen } from "./ResultScreen";

interface MainDashboardProps {
  activeChildId: Id<"children">;
  children: Array<{
    _id: Id<"children">;
    name: string;
    avatarId: number;
    coins: number;
    ageCategory: string;
  }>;
  onChildSelect: (id: Id<"children">) => void;
  onAddChild: () => void;
}

type Tab = "home" | "history" | "contests" | "profile";
type CaptureMode = "art" | "music" | null;

export function MainDashboard({ activeChildId, children, onChildSelect, onAddChild }: MainDashboardProps) {
  const { signOut } = useAuthActions();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [captureMode, setCaptureMode] = useState<CaptureMode>(null);
  const [showChildPicker, setShowChildPicker] = useState(false);
  const [viewingSubmissionId, setViewingSubmissionId] = useState<Id<"submissions"> | null>(null);

  const activeChild = children.find((c) => c._id === activeChildId);
  const seedContests = useMutation(api.contests.seedContests);

  // Seed demo contests on mount
  useEffect(() => {
    seedContests();
  }, []);

  if (!activeChild) return null;

  const avatar = AVATARS[activeChild.avatarId] || AVATARS[0];

  if (viewingSubmissionId) {
    return (
      <ResultScreen
        submissionId={viewingSubmissionId}
        onClose={() => setViewingSubmissionId(null)}
        onTryAgain={() => {
          setViewingSubmissionId(null);
          setCaptureMode("art");
        }}
      />
    );
  }

  if (captureMode) {
    return (
      <CaptureFlow
        mode={captureMode}
        childId={activeChildId}
        ageCategory={activeChild.ageCategory}
        onClose={() => setCaptureMode(null)}
        onComplete={(submissionId) => {
          setCaptureMode(null);
          setViewingSubmissionId(submissionId);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-indigo-50 to-amber-50 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowChildPicker(true)}
              className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatar.bg} flex items-center justify-center shadow-md hover:scale-105 transition-transform`}
            >
              <span className="text-lg">{avatar.emoji}</span>
            </button>
            <div>
              <p className="font-bold text-gray-800" style={{ fontFamily: "'Nunito', sans-serif" }}>
                {activeChild.name}
              </p>
              <p className="text-xs text-gray-400">Age {activeChild.ageCategory}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-amber-100 px-3 py-1.5 rounded-full">
              <span className="text-lg">🪙</span>
              <span className="font-bold text-amber-700">{activeChild.coins}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Child Picker Modal */}
      {showChildPicker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-sm p-6 animate-slide-up">
            <h3 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Switch Child
            </h3>
            <div className="space-y-2">
              {children.map((child) => {
                const av = AVATARS[child.avatarId] || AVATARS[0];
                return (
                  <button
                    key={child._id}
                    onClick={() => {
                      onChildSelect(child._id);
                      setShowChildPicker(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      child._id === activeChildId
                        ? "bg-indigo-50 ring-2 ring-indigo-400"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${av.bg} flex items-center justify-center`}>
                      <span className="text-2xl">{av.emoji}</span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">{child.name}</p>
                      <p className="text-sm text-gray-400">Age {child.ageCategory}</p>
                    </div>
                    {child._id === activeChildId && (
                      <span className="ml-auto text-indigo-500">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                setShowChildPicker(false);
                onAddChild();
              }}
              className="w-full mt-4 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-indigo-300 hover:text-indigo-500 transition-colors font-medium"
            >
              + Add Another Child
            </button>
            <button
              onClick={() => setShowChildPicker(false)}
              className="w-full mt-2 py-2 text-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-24">
        {activeTab === "home" && (
          <HomeTab
            childId={activeChildId}
            onScanArt={() => setCaptureMode("art")}
            onRecordMusic={() => setCaptureMode("music")}
            onViewSubmission={setViewingSubmissionId}
          />
        )}
        {activeTab === "history" && (
          <HistoryTab
            childId={activeChildId}
            onViewSubmission={setViewingSubmissionId}
          />
        )}
        {activeTab === "contests" && (
          <ContestsTab
            childId={activeChildId}
            ageCategory={activeChild.ageCategory}
          />
        )}
        {activeTab === "profile" && (
          <ProfileTab
            childId={activeChildId}
            childName={activeChild.name}
            avatarId={activeChild.avatarId}
            ageCategory={activeChild.ageCategory}
            coins={activeChild.coins}
            onSignOut={signOut}
          />
        )}
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 z-40">
        <div className="max-w-2xl mx-auto px-4 flex">
          {[
            { id: "home" as Tab, icon: "🏠", label: "Home" },
            { id: "history" as Tab, icon: "📜", label: "History" },
            { id: "contests" as Tab, icon: "🏆", label: "Contests" },
            { id: "profile" as Tab, icon: "👤", label: "Profile" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all ${
                activeTab === tab.id
                  ? "text-indigo-600"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <span className={`text-xl ${activeTab === tab.id ? "scale-110" : ""} transition-transform`}>
                {tab.icon}
              </span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
        {/* Safe area padding for mobile */}
        <div className="h-safe-bottom bg-white"></div>
      </nav>
    </div>
  );
}
