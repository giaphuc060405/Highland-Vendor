import { useState, useEffect, useCallback } from "react";
import slide1Desktop from "../assets/slideshow/slide1-desktop.webp";
import slide1Mobile from "../assets/slideshow/slide1-mobile.webp";
import slide2Desktop from "../assets/slideshow/slide2-desktop.webp";
import slide2Mobile from "../assets/slideshow/slide2-mobile.webp";

interface SlideItem {
  id: number;
  desktopUrl: string;
  mobileUrl: string;
}

const images: SlideItem[] = [
  { id: 1, desktopUrl: slide1Desktop, mobileUrl: slide1Mobile },
  { id: 2, desktopUrl: slide2Desktop, mobileUrl: slide2Mobile },
];

export default function SlideShow() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const nextSlide = useCallback((): void => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      nextSlide();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="max-w-full h-125 w-full relative group">
      <div className="w-full h-full bg-center bg-cover duration-500 relative overflow-hidden shadow-xl">
        {images.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <picture className="block w-full h-full">
              <source media="(min-width: 768px)" srcSet={slide.desktopUrl} />
              <img
                src={slide.mobileUrl}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
                fetchPriority="high"
              />
            </picture>
             <div className="absolute inset-0 bg-black/60" />
            
          </div>
        ))}
         
            <div className="absolute top-45 left-10 text-white z-20 space-y-2 max-w-lg">
                <h2 className="text-2xl md:text-4xl font-bold drop-shadow-md my-4">Niềm tự hào của Tây Nguyên</h2>
                <p className="text-[12px] md:text-[16px] text-gray-200 drop-shadow">Tất cả những sản phẩm bạn muốn đều ở đây</p>
            </div>
      </div>
    </div>
  );
}