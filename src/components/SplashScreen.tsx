import { useEffect, useState } from "react";
import { Car } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Animation de 2.5 secondes avant de commencer le fadeout
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Attendre la fin de l'animation fadeout avant de notifier la completion
      setTimeout(onComplete, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-primary via-primary/90 to-accent transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-center space-y-6 animate-fade-in">
        {/* Logo/Icône */}
        <div className="relative w-24 h-24 mx-auto mb-8 animate-bounce-slow">
          <div className="absolute inset-0 bg-white/20 rounded-2xl rotate-12 animate-pulse"></div>
          <div className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
            <Car className="w-16 h-16 text-primary" strokeWidth={2.5} />
          </div>
        </div>

        {/* Texte Carflex */}
        <div className="space-y-2">
          <h1 className="text-6xl font-bold tracking-tight animate-scale-in">
            <span className="text-blue-500">Car</span>
            <span className="text-red-500">flex</span>
          </h1>
          <p className="text-white/80 text-lg animate-fade-in-delayed">
            Votre marketplace automobile
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex justify-center gap-2 mt-8 animate-fade-in-delayed">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce-dot" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce-dot" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-white rounded-full animate-bounce-dot" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>

      <style>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
          }
        }
        
        @keyframes scale-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fade-in-delayed {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-dot {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-8px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-scale-in {
          animation: scale-in 0.6s ease-out;
        }

        .animate-fade-in-delayed {
          animation: fade-in-delayed 0.8s ease-out 0.3s both;
        }

        .animate-bounce-dot {
          animation: bounce-dot 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
