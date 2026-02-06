import { useState } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera as CameraIcon, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImagePickerProps {
  onImageSelect: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  disabled?: boolean;
  className?: string;
  maxFiles?: number;
  currentFilesCount?: number;
  iconOnly?: boolean;
}

export const ImagePicker = ({
  onImageSelect,
  multiple = false,
  accept = "image/*",
  disabled = false,
  className = "",
  maxFiles = 10,
  currentFilesCount = 0,
  iconOnly = false,
}: ImagePickerProps) => {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const handleNativeImagePick = async (source: CameraSource) => {
    setShowDialog(false);
    setLoading(true);

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: source,
      });

      if (!image.webPath) {
        throw new Error("Aucune image sélectionnée");
      }

      // Convert to blob
      const response = await fetch(image.webPath);
      const blob = await response.blob();
      
      // Create File object
      const fileName = `photo_${Date.now()}.${image.format || 'jpg'}`;
      const file = new File([blob], fileName, { type: `image/${image.format || 'jpeg'}` });

      onImageSelect([file]);
      toast.success("Image sélectionnée avec succès");
    } catch (error: any) {
      if (error.message !== "User cancelled photos app") {
        console.error("Error picking image:", error);
        toast.error("Erreur lors de la sélection de l'image");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleWebImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Check total count
    if (currentFilesCount + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images autorisées`);
      e.target.value = '';
      return;
    }

    // Validate each file
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error("Seules les images sont autorisées");
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Taille maximale : 5MB par image");
        e.target.value = '';
        return;
      }
    }

    onImageSelect(files);
    e.target.value = '';
  };

  const handleClick = () => {
    if (isNative) {
      setShowDialog(true);
    }
  };

  if (isNative) {
    return (
      <>
        <Button
          type="button"
          variant={iconOnly ? "secondary" : "outline"}
          size={iconOnly ? "icon" : "default"}
          onClick={handleClick}
          disabled={disabled || loading}
          className={iconOnly ? `h-10 w-10 rounded-full shadow-lg ${className}` : className}
        >
          {loading ? (
            <Loader2 className={iconOnly ? "h-5 w-5 animate-spin" : "h-4 w-4 mr-2 animate-spin"} />
          ) : iconOnly ? (
            <CameraIcon className="h-5 w-5" />
          ) : (
            <>
              <CameraIcon className="h-4 w-4 mr-2" />
              {multiple ? "Ajouter des photos" : "Choisir une photo"}
            </>
          )}
        </Button>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Choisir une source</DialogTitle>
              <DialogDescription>
                Prenez une photo ou sélectionnez-en une depuis votre galerie
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={() => handleNativeImagePick(CameraSource.Camera)}
                className="w-full"
                disabled={loading}
              >
                <CameraIcon className="h-5 w-5 mr-2" />
                Prendre une photo
              </Button>
              <Button
                onClick={() => handleNativeImagePick(CameraSource.Photos)}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                <ImageIcon className="h-5 w-5 mr-2" />
                Choisir depuis la galerie
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Web version: use standard file input with hidden input
  return (
    <div className={className}>
      <Input
        id="file-input"
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleWebImagePick}
        disabled={disabled}
        className="hidden"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => document.getElementById('file-input')?.click()}
        disabled={disabled}
        className="h-8 w-8"
      >
        <CameraIcon className="h-5 w-5" />
      </Button>
    </div>
  );
};
