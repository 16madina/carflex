import { useEffect, useState } from "react";
import { Car } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Lancer l'animation de sortie après 2.5 secondes
    const timer = setTimeout(() => {
      setFadeOut(true);
      // Appeler onComplete après l'animation de sortie
      setTimeout(onComplete, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-50/50 via-background to-red-50/50 dark:from-blue-950/30 dark:via-background dark:to-red-950/30 transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative">
        {/* Glassmorphic container */}
        <div className="backdrop-blur-xl bg-white/10 dark:bg-black/10 rounded-3xl p-12 border border-white/20 dark:border-white/10 shadow-2xl animate-scale-in">
          <div className="text-center">
            {/* Icône de voiture animée en haut */}
            <div className="mb-6 flex justify-center animate-[fade-in_0.5s_ease-out]">
              <div className="relative">
                <Car 
                  size={64} 
                  className="text-blue-600 animate-[slide-in-right_1s_ease-out]" 
                  strokeWidth={2}
                />
                {/* Roues qui tournent */}
                <div className="absolute -bottom-1 left-3 w-3 h-3 bg-gray-800 dark:bg-gray-200 rounded-full animate-spin"></div>
                <div className="absolute -bottom-1 right-3 w-3 h-3 bg-gray-800 dark:bg-gray-200 rounded-full animate-spin"></div>
              </div>
            </div>

            {/* Logo CarFlex */}
            <div className="mb-4">
              <h1 className="text-7xl font-bold tracking-tight">
                <span className="text-blue-600 drop-shadow-lg animate-[fade-in_0.6s_ease-out_0.3s_both]">
                  Car
                </span>
                <span className="text-red-600 drop-shadow-lg animate-[fade-in_0.6s_ease-out_0.5s_both]">
                  Flex
                </span>
              </h1>
            </div>

            {/* Slogan */}
            <p className="text-lg text-muted-foreground font-light animate-[fade-in_0.8s_ease-out_0.8s_both]">
              Votre marketplace automobile
            </p>

            {/* Points de chargement */}
            <div className="mt-8 flex justify-center gap-2 animate-[fade-in_1s_ease-out_1.2s_both]">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-[bounce_1s_infinite_0s]"></div>
              <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-[bounce_1s_infinite_0.2s]"></div>
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-[bounce_1s_infinite_0.4s]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
