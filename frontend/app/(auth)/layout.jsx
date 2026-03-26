// app/(auth)/layout.jsx

import Image from 'next/image';
import BackgroundImage from '@/public/image/vi3bg.png';
export default function AuthLayout({ children }) {

  return (
    <div className="relative min-h-screen min-w-full bg-black ">
      
      {/* 1. Next/Image Component for Optimization */}
      <Image 
        src={BackgroundImage}
        alt="ViStream Auth Background"
        fill // makes the image fill the parent
        priority // loads the image immediately
        className="object-fill z-0"
         // cover the container, send to back
      />

      {/* 2. Overlay Container for your Centered Content */}
      <div className="relative h-screen z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}