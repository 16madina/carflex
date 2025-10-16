import { useEffect, useState } from "react";

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
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-500 to-red-500 transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-center animate-scale-in">
        {/* Logo animé */}
        <div className="mb-8 animate-fade-in">
          <div className="inline-block">
            <h1 className="text-7xl font-bold tracking-tight">
              <span className="inline-block text-white drop-shadow-2xl animate-[fade-in_0.6s_ease-out]">
                Car
              </span>
              <span className="inline-block text-red-100 drop-shadow-2xl animate-[fade-in_0.6s_ease-out_0.2s_both]">
                Flex
              </span>
            </h1>
          </div>
        </div>

        {/* Slogan */}
        <p className="text-xl text-white/90 font-light animate-[fade-in_0.8s_ease-out_0.6s_both]">
          Votre marketplace automobile
        </p>

        {/* Animation de chargement */}
        <div className="mt-12 flex justify-center gap-2 animate-[fade-in_1s_ease-out_1s_both]">
          <div className="w-3 h-3 bg-white rounded-full animate-[bounce_1s_infinite_0s]"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-[bounce_1s_infinite_0.2s]"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-[bounce_1s_infinite_0.4s]"></div>
        </div>
      </div>
    </div>
  );
};
