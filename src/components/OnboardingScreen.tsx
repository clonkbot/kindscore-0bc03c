import { useState } from "react";

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      emoji: "📸",
      title: "Capture Your Art",
      description: "Take photos of your beautiful artwork and let AI discover its magic!",
      bg: "from-rose-100 to-orange-100",
      accent: "text-rose-600",
    },
    {
      emoji: "🎵",
      title: "Record Your Music",
      description: "Share your musical talents! Play, sing, or perform your favorite piece.",
      bg: "from-violet-100 to-indigo-100",
      accent: "text-violet-600",
    },
    {
      emoji: "⭐",
      title: "Get AI Feedback",
      description: "Receive encouraging scores, helpful tips, and celebrate your creativity!",
      bg: "from-amber-100 to-yellow-100",
      accent: "text-amber-600",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${slide.bg} flex flex-col transition-all duration-500`}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-8 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">✨</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-indigo-600 bg-clip-text text-transparent" style={{ fontFamily: "'Nunito', sans-serif" }}>
            KindScore
          </span>
        </div>

        {/* Illustration */}
        <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center mb-8 shadow-xl animate-float">
          <span className="text-8xl md:text-9xl">{slide.emoji}</span>
        </div>

        {/* Content */}
        <h1 className={`text-3xl md:text-4xl font-bold ${slide.accent} text-center mb-4`} style={{ fontFamily: "'Nunito', sans-serif" }}>
          {slide.title}
        </h1>
        <p className="text-gray-600 text-center text-lg max-w-sm leading-relaxed">
          {slide.description}
        </p>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-12">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentSlide
                  ? "bg-indigo-500 w-8"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>

        {/* Button */}
        <button
          onClick={handleNext}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold text-lg shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
          style={{ fontFamily: "'Nunito', sans-serif" }}
        >
          {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
        </button>

        {currentSlide < slides.length - 1 && (
          <button
            onClick={onComplete}
            className="w-full py-3 text-gray-500 font-medium mt-2"
          >
            Skip
          </button>
        )}
      </div>

      {/* GASCA Badge */}
      <div className="pb-6 text-center">
        <p className="text-xs text-gray-400">
          Operated by <span className="font-semibold">GASCA</span>
        </p>
        <p className="text-xs text-gray-400">Global Arts Sports Culture Association</p>
      </div>
    </div>
  );
}
