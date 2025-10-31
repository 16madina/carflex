import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProPlanPromoProps {
  inline?: boolean;
}

const ProPlanPromo = ({ inline = false }: ProPlanPromoProps) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/subscription");
  };

  if (inline) {
    return (
      <button
        onClick={handleNavigate}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl px-4 py-2.5 cursor-pointer group transition-all animate-pulse-slow shadow-lg shadow-amber-500/30 active-press"
      >
        <Crown className="w-5 h-5" />
        <span className="text-sm font-bold">
          Plan Pro
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleNavigate}
      className="fixed top-24 left-4 z-40 flex flex-col items-center gap-2 cursor-pointer group active-press"
    >
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-3 shadow-native-lg shadow-amber-500/30 animate-pulse-slow">
        <Crown className="w-6 h-6 text-white" />
      </div>
      <span className="text-xs font-bold text-accent group-hover:scale-110 transition-transform">
        Plan Pro
      </span>
    </button>
  );
};

export default ProPlanPromo;
