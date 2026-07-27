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

async function webPathToFile(webPath: string, format?: string): Promise<File> {
  const response = await fetch(webPath);
  const blob = await response.blob();
  const ext = format || "jpg";
  const fileName = `photo_${Date.now()}.${ext}`;
  return new File([blob], fileName, { type: `image/${ext === "jpg" ? "jpeg" : ext}` });
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

  /** Take a new photo with the device camera (needs CAMERA only). */
  const handleNativeCamera = async () => {
    setShowDialog(false);
    setLoading(true);

    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        saveToGallery: false,
      });

      if (!image.webPath) {
        throw new Error("Aucune image sélectionnée");
      }

      const file = await webPathToFile(image.webPath, image.format);
      onImageSelect([file]);
      toast.success("Image sélectionnée avec succès");
    } catch (error: any) {
      if (error?.message !== "User cancelled photos app") {
        console.error("Error taking photo:", error);
        toast.error("Erreur lors de la prise de photo");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Pick from gallery via Android Photo Picker / iOS picker.
   * Does NOT require READ_MEDIA_IMAGES (Play policy compliant).
   */
  const handleNativeGallery = async () => {
    setShowDialog(false);
    setLoading(true);

    try {
      const remaining = Math.max(1, maxFiles - currentFilesCount);
      const limit = multiple ? remaining : 1;

      if (multiple || limit > 1) {
        const result = await Camera.pickImages({
          quality: 90,
          limit,
        });

        if (!result.photos?.length) {
          throw new Error("Aucune image sélectionnée");
        }

        const files: File[] = [];
        for (const photo of result.photos) {
          if (!photo.webPath) continue;
          files.push(await webPathToFile(photo.webPath, photo.format));
        }

        if (files.length === 0) {
          throw new Error("Aucune image sélectionnée");
        }

        onImageSelect(files);
        toast.success(
          files.length > 1
            ? `${files.length} images sélectionnées`
            : "Image sélectionnée avec succès"
        );
      } else {
        // Single image via Photo Picker (CameraSource.Photos → system picker on Cap 8+)
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Photos,
          saveToGallery: false,
        });

        if (!image.webPath) {
          throw new Error("Aucune image sélectionnée");
        }

        const file = await webPathToFile(image.webPath, image.format);
        onImageSelect([file]);
        toast.success("Image sélectionnée avec succès");
      }
    } catch (error: any) {
      if (error?.message !== "User cancelled photos app") {
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

    if (currentFilesCount + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images autorisées`);
      e.target.value = "";
      return;
    }

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error("Seules les images sont autorisées");
        e.target.value = "";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Taille maximale : 5MB par image");
        e.target.value = "";
        return;
      }
    }

    onImageSelect(files);
    e.target.value = "";
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
                Prenez une photo ou sélectionnez-en une via le sélecteur système
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={handleNativeCamera}
                className="w-full"
                disabled={loading}
              >
                <CameraIcon className="h-5 w-5 mr-2" />
                Prendre une photo
              </Button>
              <Button
                onClick={handleNativeGallery}
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
        onClick={() => document.getElementById("file-input")?.click()}
        disabled={disabled}
        className="h-8 w-8"
      >
        <CameraIcon className="h-5 w-5" />
      </Button>
    </div>
  );
};
