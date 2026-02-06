import { useEffect, useState } from "react";
import carflexLogo from "@/assets/carflex-logo.png";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Animation optimisée de 1.8 secondes avant le fadeout
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Attendre la fin de l'animation fadeout (300ms) avant de notifier la completion
      setTimeout(onComplete, 300);
    }, 1800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        background: 'linear-gradient(135deg, hsl(220 15% 10%), hsl(220 20% 18%), hsl(25 80% 45%))'
      }}
    >
      <div className="text-center space-y-8">
        {/* Logo CarFlex */}
        <div className="relative w-40 h-40 mx-auto animate-logo-entrance">
          <div className="absolute inset-0 bg-white/10 rounded-3xl blur-2xl animate-glow"></div>
          <div className="relative w-full h-full bg-white rounded-3xl flex items-center justify-center shadow-2xl p-6 animate-float">
            <img 
              src={carflexLogo} 
              alt="CarFlex Logo" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Texte Carflex */}
        <div className="space-y-3 animate-text-entrance">
          <h1 className="text-7xl font-bold tracking-tight">
            <span className="text-white drop-shadow-lg">CarFlex</span>
          </h1>
          <p className="text-white/90 text-xl font-medium animate-fade-slide-up">
            Votre marketplace automobile
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex justify-center gap-2.5 mt-10 animate-loader-entrance">
          <div className="w-2.5 h-2.5 bg-white/90 rounded-full animate-pulse-dot shadow-glow" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2.5 h-2.5 bg-white/90 rounded-full animate-pulse-dot shadow-glow" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2.5 h-2.5 bg-white/90 rounded-full animate-pulse-dot shadow-glow" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      <style>{`
        @keyframes logo-entrance {
          0% {
            transform: scale(0.5) translateY(-30px);
            opacity: 0;
          }
          60% {
            transform: scale(1.05) translateY(0);
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(2deg);
          }
        }

        @keyframes glow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.95);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }

        @keyframes text-entrance {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-slide-up {
          0% {
            opacity: 0;
            transform: translateY(15px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes loader-entrance {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes pulse-dot {
          0%, 60%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px) scale(1.2);
            opacity: 1;
          }
        }

        .animate-logo-entrance {
          animation: logo-entrance 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .animate-text-entrance {
          animation: text-entrance 0.6s ease-out 0.3s backwards;
        }

        .animate-fade-slide-up {
          animation: fade-slide-up 0.6s ease-out 0.5s backwards;
        }

        .animate-loader-entrance {
          animation: loader-entrance 0.4s ease-out 0.7s backwards;
        }

        .animate-pulse-dot {
          animation: pulse-dot 1.5s ease-in-out infinite;
        }

        .shadow-glow {
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
