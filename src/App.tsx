import { useConvexAuth } from "convex/react";
import { useState, useEffect } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { OnboardingScreen } from "./components/OnboardingScreen";
import { AddChildScreen } from "./components/AddChildScreen";
import { MainDashboard } from "./components/MainDashboard";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeChildId, setActiveChildId] = useState<Id<"children"> | null>(null);
  const [showAddChild, setShowAddChild] = useState(false);

  const children = useQuery(api.children.list);

  useEffect(() => {
    const seen = localStorage.getItem("kindscore_onboarding_seen");
    if (seen) setShowOnboarding(false);
  }, []);

  useEffect(() => {
    if (children && children.length > 0 && !activeChildId) {
      setActiveChildId(children[0]._id);
    }
  }, [children, activeChildId]);

  const handleOnboardingComplete = () => {
    localStorage.setItem("kindscore_onboarding_seen", "true");
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-amber-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 animate-pulse flex items-center justify-center">
            <span className="text-3xl">🎨</span>
          </div>
          <p className="text-indigo-600 font-medium animate-pulse">Loading KindScore...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding && !isAuthenticated) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (children === undefined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-amber-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (children.length === 0 || showAddChild) {
    return (
      <AddChildScreen
        onComplete={(childId) => {
          setActiveChildId(childId);
          setShowAddChild(false);
        }}
        onCancel={children.length > 0 ? () => setShowAddChild(false) : undefined}
      />
    );
  }

  return (
    <MainDashboard
      activeChildId={activeChildId!}
      children={children}
      onChildSelect={setActiveChildId}
      onAddChild={() => setShowAddChild(true)}
    />
  );
}
