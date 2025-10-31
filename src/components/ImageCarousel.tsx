import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface ImageCarouselProps {
  images: string[];
  alt: string;
  showNavigation?: boolean;
}

const ImageCarousel = ({ images, alt, showNavigation = true }: ImageCarouselProps) => {
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
                  className="w-full h-48 object-cover rounded-t-2xl"
                />
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 glass-native px-3 py-2 rounded-2xl">
                    {images.map((_, dotIndex) => (
                      <div
                        key={dotIndex}
                        className={`transition-all duration-300 rounded-full ${
                          dotIndex === index
                            ? 'h-2 w-8 bg-primary'
                            : 'h-2 w-2 bg-muted-foreground/40'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {showNavigation && images.length > 1 && (
          <>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </>
        )}
      </Carousel>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-2">
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
