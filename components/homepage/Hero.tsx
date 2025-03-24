import { Button } from "../ui/button";
import HeroCarousel from "./HeroCarousel";
import Link from 'next/link';


type Props = {}

const Hero = () => {
  return (

    <section className='grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center px-4 py-12 md:px-8 md:py-16 lg:px-12 lg:py-20'>
      {/* 
          - Added padding and margin for all screen sizes using px, py.
          - Increased padding and margins on medium and large screens for better spacing.
          - Reduced gap on smaller screens.  gap-24 is quite large for mobile.
          - The grid will be single column by default (mobile), and two columns on large screens (lg:).
      */}
      <div>

        <h1 className='max-w-2xl font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight'>
          {/* 
            - Adjusted text sizes for different breakpoints.  
            - Start with text-3xl (large) for mobile.
            - Incrementally increase size for sm, md, and lg screens.
          */}
          More Magic Moments
        </h1>
        <p className='mt-4 md:mt-6 lg:mt-8 max-w-xl text-base md:text-lg leading-7 md:leading-8 text-muted-foreground'>
          {/*
            - Adjusted margin-top for different breakpoints for better visual flow.
            - Used text-base for mobile, text-lg for medium and larger.
            - Adjusted leading (line-height) for better readability.
          */}
          Remember the Magic Moment of 2023? It was wonderful to reconnect and simply be family! Now, get ready for more magic in 2025! Our theme says it all: Family, Food, and Love – just what the Wiley-Swift clan does best! We in the DMV are excited to host and are working hard to make this reunion the best one yet!.
        </p>
       
        <Button asChild size='lg' className='mt-6 md:mt-8 lg:mt-10'>
           {/* Adjusted margin-top for different breakpoints. */}
          <Link href='/products'>Get Started</Link>
        </Button>
      </div>
      
      <HeroCarousel /> {/* Assumed to be responsive */}
    </section>
  )
}

export default Hero;