import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid email or password" : "Could not create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    try {
      await signIn("anonymous");
    } catch (err) {
      setError("Could not continue as guest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-amber-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-xl mb-4">
            <span className="text-white text-4xl">✨</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent" style={{ fontFamily: "'Nunito', sans-serif" }}>
            KindScore
          </h1>
          <p className="text-gray-500 mt-1">Where creativity shines!</p>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-sm bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-6" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {flow === "signIn" ? "Welcome Back!" : "Join the Fun!"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-indigo-400 focus:bg-white focus:outline-none transition-all text-gray-800"
                placeholder="parent@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border-2 border-transparent focus:border-indigo-400 focus:bg-white focus:outline-none transition-all text-gray-800"
                placeholder="••••••••"
              />
            </div>

            <input name="flow" type="hidden" value={flow} />

            {error && (
              <div className="bg-rose-50 text-rose-600 text-sm px-4 py-2 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Please wait...
                </span>
              ) : flow === "signIn" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="w-full py-2 text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
            >
              {flow === "signIn" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 text-gray-400">or</span>
            </div>
          </div>

          <button
            onClick={handleAnonymous}
            disabled={isLoading}
            className="mt-6 w-full py-3.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            Continue as Guest
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="pb-6 text-center">
        <p className="text-xs text-gray-400">
          Operated by <span className="font-semibold">GASCA</span> · Global Arts Sports Culture Association
        </p>
        <p className="text-xs text-gray-300 mt-2">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}
