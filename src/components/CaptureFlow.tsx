import { useState, useRef, useEffect } from "react";
import { useMutation, useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface CaptureFlowProps {
  mode: "art" | "music";
  childId: Id<"children">;
  ageCategory: string;
  onClose: () => void;
  onComplete: (submissionId: Id<"submissions">) => void;
}

export function CaptureFlow({ mode, childId, ageCategory, onClose, onComplete }: CaptureFlowProps) {
  const [stage, setStage] = useState<"capture" | "preview" | "analyzing">("capture");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<Id<"submissions"> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const createSubmission = useMutation(api.submissions.create);
  const analyzeArtwork = useAction(api.analyze.analyzeArtwork);
  const analyzeMusic = useAction(api.analyze.analyzeMusic);

  // Poll for completion
  const submission = useQuery(
    api.submissions.get,
    submissionId ? { id: submissionId } : "skip"
  );

  useEffect(() => {
    if (submission?.status === "done") {
      onComplete(submission._id);
    } else if (submission?.status === "failed") {
      setError("Analysis failed. Please try again.");
      setStage("capture");
    }
  }, [submission?.status]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedImage(event.target?.result as string);
      setStage("preview");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!capturedImage) return;

    setStage("analyzing");
    setError(null);

    try {
      // Create submission record
      const id = await createSubmission({
        childId,
        type: mode,
        fileId: `demo_${Date.now()}`, // In production, upload to Convex file storage
      });
      setSubmissionId(id);

      // Trigger analysis
      if (mode === "art") {
        await analyzeArtwork({
          submissionId: id,
          imageUrl: capturedImage,
          ageCategory,
        });
      } else {
        await analyzeMusic({
          submissionId: id,
          description: "Music performance",
          ageCategory,
        });
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setStage("capture");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white text-lg font-medium"
        >
          ✕ Cancel
        </button>
        <h1 className="text-white font-bold" style={{ fontFamily: "'Nunito', sans-serif" }}>
          {mode === "art" ? "📸 Scan Artwork" : "🎵 Record Music"}
        </h1>
        <div className="w-16"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        {stage === "capture" && (
          <>
            <div className="w-72 h-72 md:w-96 md:h-96 rounded-3xl border-4 border-dashed border-white/30 flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm">
              {mode === "art" ? (
                <>
                  <span className="text-6xl mb-4">🎨</span>
                  <p className="text-white/80 text-center px-4">
                    Place your artwork in the center of the frame
                  </p>
                </>
              ) : (
                <>
                  <span className="text-6xl mb-4">🎹</span>
                  <p className="text-white/80 text-center px-4">
                    Get ready to record your performance
                  </p>
                </>
              )}
            </div>

            {error && (
              <div className="mt-4 bg-rose-500/20 text-rose-200 px-4 py-2 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="mt-8 flex flex-col gap-4 w-full max-w-xs">
              <input
                ref={fileInputRef}
                type="file"
                accept={mode === "art" ? "image/*" : "video/*,audio/*"}
                capture={mode === "art" ? "environment" : undefined}
                onChange={handleFileSelect}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  mode === "art"
                    ? "bg-gradient-to-r from-rose-500 to-orange-500 shadow-rose-500/30"
                    : "bg-gradient-to-r from-violet-500 to-indigo-600 shadow-violet-500/30"
                }`}
                style={{ fontFamily: "'Nunito', sans-serif" }}
              >
                {mode === "art" ? "📷 Take Photo" : "🎬 Record Video"}
              </button>

              <button
                onClick={() => {
                  // Reset capture mode to allow gallery selection
                  if (fileInputRef.current) {
                    fileInputRef.current.removeAttribute("capture");
                    fileInputRef.current.click();
                  }
                }}
                className="w-full py-3 rounded-2xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
              >
                Choose from Library
              </button>
            </div>

            <p className="mt-8 text-white/50 text-sm text-center max-w-xs">
              {mode === "art"
                ? "Make sure your artwork is well-lit and fills the frame"
                : "Record 5-60 seconds of your best performance"}
            </p>
          </>
        )}

        {stage === "preview" && capturedImage && (
          <>
            <div className="w-72 h-72 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={capturedImage}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>

            <p className="mt-6 text-white/80 text-center">
              Does this look good?
            </p>

            <div className="mt-6 flex gap-4 w-full max-w-xs">
              <button
                onClick={() => {
                  setCapturedImage(null);
                  setStage("capture");
                }}
                className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
              >
                Retake
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Submit
              </button>
            </div>
          </>
        )}

        {stage === "analyzing" && (
          <div className="text-center">
            {/* Animated loader */}
            <div className="relative w-32 h-32 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-400 animate-spin"></div>
              <div className="absolute inset-4 rounded-full border-4 border-t-violet-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl animate-pulse">
                  {mode === "art" ? "🎨" : "🎵"}
                </span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Nunito', sans-serif" }}>
              {mode === "art" ? "Analyzing Your Artwork" : "Analyzing Your Performance"}
            </h2>
            <p className="text-white/60">
              Our AI is carefully reviewing your {mode === "art" ? "artwork" : "music"}...
            </p>

            <div className="mt-8 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                ></div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-xs text-white/30">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}
