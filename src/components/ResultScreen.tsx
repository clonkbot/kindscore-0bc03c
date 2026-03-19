import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ResultScreenProps {
  submissionId: Id<"submissions">;
  onClose: () => void;
  onTryAgain: () => void;
}

interface Feedback {
  title: string;
  category: string;
  description: string;
  pro_tips: string;
}

interface Exercise {
  title: string;
  category: string;
  description: string;
}

const CATEGORY_ICONS: Record<string, string> = {
  colors: "🎨",
  shapes: "⬡",
  lines: "✏️",
  composition: "🖼️",
  story: "📖",
  details: "🔍",
  perspective: "👁️",
  contrast: "⚫",
  creativity: "✨",
  pitch: "🎵",
  rhythm: "🥁",
  timing: "⏱️",
  expression: "💫",
  confidence: "💪",
  technique: "🎯",
  dynamics: "📊",
  musicality: "🎶",
  instrument: "🎸",
  tone: "🔔",
};

export function ResultScreen({ submissionId, onClose, onTryAgain }: ResultScreenProps) {
  const submission = useQuery(api.submissions.get, { id: submissionId });
  const [expandedGood, setExpandedGood] = useState<number | null>(0);
  const [expandedImprove, setExpandedImprove] = useState<number | null>(null);

  if (!submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-violet-50 to-amber-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const score = submission.score ?? 0;
  const stars = Math.round((score / 10) * 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-violet-50 to-amber-50">
      {/* Header */}
      <header className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800 font-medium">
            ← Back
          </button>
          <h1 className="font-bold text-gray-800" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Your Results
          </h1>
          <div className="w-12"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-32 space-y-6">
        {/* Score Card */}
        <div className="bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 rounded-3xl p-8 text-center shadow-2xl shadow-indigo-500/30">
          <div className="text-8xl font-bold text-white mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {score}
          </div>
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} className={`text-3xl ${i <= stars ? "" : "opacity-30"}`}>
                ⭐
              </span>
            ))}
          </div>
          <p className="text-white/90 text-lg">{submission.sceneSummary}</p>
        </div>

        {/* What You Did Great */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <span className="text-2xl">🌟</span> What You Did Great!
          </h2>
          <div className="space-y-3">
            {submission.goodFeedback?.map((feedback: Feedback, index: number) => (
              <button
                key={index}
                onClick={() => setExpandedGood(expandedGood === index ? null : index)}
                className="w-full bg-white rounded-2xl p-4 shadow-lg text-left transition-all hover:scale-[1.01]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{CATEGORY_ICONS[feedback.category] || "✨"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800">{feedback.title}</h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {feedback.category}
                    </span>
                  </div>
                  <span className={`text-gray-400 transition-transform ${expandedGood === index ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </div>

                {expandedGood === index && (
                  <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
                    <p className="text-gray-600 mb-3">{feedback.description}</p>
                    <div className="bg-amber-50 rounded-xl p-3">
                      <p className="text-sm text-amber-800">
                        <span className="font-semibold">💡 Pro Tip:</span> {feedback.pro_tips}
                      </p>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Try This Next Time */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
            <span className="text-2xl">🚀</span> Try This Next Time
          </h2>
          <div className="space-y-3">
            {submission.additionalFeedback?.map((feedback: Feedback, index: number) => (
              <button
                key={index}
                onClick={() => setExpandedImprove(expandedImprove === index ? null : index)}
                className="w-full bg-white rounded-2xl p-4 shadow-lg text-left transition-all hover:scale-[1.01]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{CATEGORY_ICONS[feedback.category] || "💡"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800">{feedback.title}</h3>
                    <span className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                      {feedback.category}
                    </span>
                  </div>
                  <span className={`text-gray-400 transition-transform ${expandedImprove === index ? "rotate-180" : ""}`}>
                    ▼
                  </span>
                </div>

                {expandedImprove === index && (
                  <div className="mt-4 pt-4 border-t border-gray-100 animate-fadeIn">
                    <p className="text-gray-600 mb-3">{feedback.description}</p>
                    <div className="bg-violet-50 rounded-xl p-3">
                      <p className="text-sm text-violet-800">
                        <span className="font-semibold">💡 Pro Tip:</span> {feedback.pro_tips}
                      </p>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Fun Exercises */}
        {submission.recommendedExercises && submission.recommendedExercises.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
              <span className="text-2xl">🎯</span> Fun Exercises
            </h2>
            <div className="grid gap-3">
              {submission.recommendedExercises.map((exercise: Exercise, index: number) => (
                <div
                  key={index}
                  className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl p-4 border-2 border-violet-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{exercise.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{exercise.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 p-4">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={onTryAgain}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Try Again
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
          >
            Done
          </button>
        </div>
        <div className="h-safe-bottom"></div>
      </div>
    </div>
  );
}
