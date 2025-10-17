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
        className="inline-flex items-center gap-2 bg-accent/20 hover:bg-accent/30 rounded-full px-3 py-1.5 cursor-pointer group transition-all animate-fade-in"
      >
        <Crown className="w-4 h-4 text-accent" />
        <span className="text-sm font-semibold text-accent">
          Plan Pro
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={handleNavigate}
      className="fixed top-20 left-4 z-40 flex flex-col items-center gap-1 cursor-pointer group"
    >
      <div className="bg-accent rounded-full p-2 shadow-elevated">
        <Crown className="w-5 h-5 text-accent-foreground" />
      </div>
      <span className="text-xs font-semibold text-accent group-hover:scale-110 transition-transform">
        Plan Pro
      </span>
    </button>
  );
};

export default ProPlanPromo;
