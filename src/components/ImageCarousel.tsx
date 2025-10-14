import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

const ImageCarousel = ({ images, alt }: ImageCarouselProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="w-full h-[400px] bg-gradient-card rounded-lg flex items-center justify-center">
        <span className="text-muted-foreground">Image non disponible</span>
      </div>
    );
  }

  return (
    <>
      <Carousel className="w-full" opts={{ loop: true }}>
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div 
                className="relative cursor-pointer"
                onClick={() => {
                  setSelectedIndex(index);
                  setLightboxOpen(true);
                }}
              >
                <img
                  src={image}
                  alt={`${alt} - Image ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
                {images.length > 1 && (
                  <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                    {index + 1} / {images.length}
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </>
        )}
      </Carousel>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0">
          <Carousel 
            className="w-full" 
            opts={{ 
              loop: true,
              startIndex: selectedIndex 
            }}
          >
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <img
                    src={image}
                    alt={`${alt} - Image ${index + 1}`}
                    className="w-full max-h-[80vh] object-contain"
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </>
            )}
          </Carousel>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageCarousel;
