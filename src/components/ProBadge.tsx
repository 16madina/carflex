import { Check } from "lucide-react";

const ProBadge = () => {
  return (
    <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shadow-md border-2 border-background">
      <span className="text-[10px] font-bold text-white leading-none">PRO</span>
      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
    </div>
  );
};

export default ProBadge;
