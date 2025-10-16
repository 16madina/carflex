import { Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProPlanPromo = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/subscription");
  };

  return (
    <button
      onClick={handleNavigate}
      className="fixed top-20 left-4 z-40 flex flex-col items-center gap-1 cursor-pointer group animate-fade-in"
    >
      <div className="bg-accent rounded-full p-2 shadow-elevated animate-bounce">
        <Crown className="w-5 h-5 text-accent-foreground" />
      </div>
      <span className="text-xs font-semibold text-accent group-hover:scale-110 transition-transform">
        Plan Pro
      </span>
    </button>
  );
};

export default ProPlanPromo;
