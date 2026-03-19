import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface AddChildScreenProps {
  onComplete: (childId: Id<"children">) => void;
  onCancel?: () => void;
}

const AVATARS = [
  { id: 0, emoji: "🦁", bg: "from-amber-400 to-orange-500" },
  { id: 1, emoji: "🐰", bg: "from-pink-400 to-rose-500" },
  { id: 2, emoji: "🐼", bg: "from-gray-400 to-gray-600" },
  { id: 3, emoji: "🦊", bg: "from-orange-400 to-red-500" },
  { id: 4, emoji: "🐸", bg: "from-green-400 to-emerald-500" },
  { id: 5, emoji: "🦄", bg: "from-purple-400 to-pink-500" },
  { id: 6, emoji: "🐱", bg: "from-yellow-400 to-amber-500" },
  { id: 7, emoji: "🐶", bg: "from-amber-500 to-yellow-600" },
  { id: 8, emoji: "🦋", bg: "from-sky-400 to-blue-500" },
  { id: 9, emoji: "🐙", bg: "from-violet-400 to-purple-500" },
  { id: 10, emoji: "🦖", bg: "from-teal-400 to-green-500" },
  { id: 11, emoji: "🌟", bg: "from-yellow-300 to-orange-400" },
];

export function AddChildScreen({ onComplete, onCancel }: AddChildScreenProps) {
  const createChild = useMutation(api.children.create);
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dateOfBirth) return;

    setIsLoading(true);
    setError(null);

    try {
      const childId = await createChild({
        name: name.trim(),
        dateOfBirth,
        avatarId: selectedAvatar,
      });
      onComplete(childId);
    } catch (err) {
      setError("Could not create profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const avatar = AVATARS[selectedAvatar];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-amber-50 flex flex-col">
      <div className="flex-1 px-6 py-8 max-w-md mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {onCancel && (
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
              ← Back
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-800 flex-1 text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Add Child Profile
          </h1>
          {onCancel && <div className="w-12"></div>}
        </div>

        {/* Preview Avatar */}
        <div className="flex justify-center mb-8">
          <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${avatar.bg} flex items-center justify-center shadow-xl`}>
            <span className="text-6xl">{avatar.emoji}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Child's Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              required
              className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-gray-100 focus:border-violet-400 focus:outline-none text-lg text-gray-800 shadow-sm"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              required
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-gray-100 focus:border-violet-400 focus:outline-none text-lg text-gray-800 shadow-sm"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Used to determine age category for contests
            </p>
          </div>

          {/* Avatar Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Choose an Avatar
            </label>
            <div className="grid grid-cols-4 gap-3">
              {AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatar(av.id)}
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${av.bg} flex items-center justify-center transition-all ${
                    selectedAvatar === av.id
                      ? "ring-4 ring-violet-400 ring-offset-2 scale-110"
                      : "hover:scale-105"
                  }`}
                >
                  <span className="text-2xl">{av.emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !name.trim() || !dateOfBirth}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold text-lg shadow-lg shadow-violet-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Creating...
              </span>
            ) : (
              "Create Profile"
            )}
          </button>
        </form>
      </div>

      <footer className="pb-6 text-center">
        <p className="text-xs text-gray-300">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}

export { AVATARS };
