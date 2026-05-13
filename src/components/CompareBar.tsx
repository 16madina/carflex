import { useCompare } from "@/hooks/useCompare";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { GitCompare, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CompareBar = () => {
  const { items, clear } = useCompare();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {items.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-background/80 backdrop-blur-xl border border-border shadow-material-xl rounded-full px-4 py-2 flex items-center gap-3"
        >
          <GitCompare className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {items.length} sélectionné{items.length > 1 ? "s" : ""}
          </span>
          <Button
            size="sm"
            disabled={items.length < 2}
            onClick={() => navigate("/compare")}
          >
            Comparer
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={clear} aria-label="Vider">
            <X className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CompareBar;
