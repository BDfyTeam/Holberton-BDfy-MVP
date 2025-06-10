declare module '@splidejs/react-splide' {
    import * as React from 'react';
  
    export interface SplideProps {
      options?: Record<string, any>;
      hasTrack?: boolean;
      tag?: string;
      className?: string;
      children?: React.ReactNode;
    }
  
    export const Splide: React.FC<SplideProps>;
  
    export interface SplideSlideProps {
      tag?: string;
      className?: string;
      children?: React.ReactNode;
    }
  
    export const SplideSlide: React.FC<SplideSlideProps>;
  }
  