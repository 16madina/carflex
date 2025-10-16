import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink } from "lucide-react";

interface AdBanner {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  click_count: number;
}

const AdBanner = () => {
  const [banner, setBanner] = useState<AdBanner | null>(null);

  useEffect(() => {
    fetchRandomBanner();
  }, []);

  const fetchRandomBanner = async () => {
    const { data, error } = await supabase
      .from("ad_banners")
      .select("*")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching banners:", error);
      return;
    }

    if (data && data.length > 0) {
      // Sélection aléatoire d'une bannière
      const randomBanner = data[Math.floor(Math.random() * data.length)];
      setBanner(randomBanner);
    }
  };

  const handleClick = async () => {
    if (!banner) return;

    // Incrémenter le compteur de clics
    const { error } = await supabase
      .from("ad_banners")
      .update({ click_count: banner.click_count + 1 })
      .eq("id", banner.id);

    if (error) {
      console.error("Error updating click count:", error);
    }

    // Ouvrir le lien dans un nouvel onglet
    window.open(banner.link_url, "_blank");
  };

  if (!banner) return null;

  return (
    <div 
      onClick={handleClick}
      className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-2 border-primary/20 hover:border-primary/40"
    >
      <div className="absolute top-2 right-2 z-10">
        <span className="bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-muted-foreground flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          Publicité
        </span>
      </div>
      
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={banner.image_url}
          alt={banner.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          {banner.title}
          <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
        </h3>
      </div>
    </div>
  );
};

export default AdBanner;
