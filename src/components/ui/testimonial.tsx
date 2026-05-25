"use client";
import React from "react";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { useRef } from "react";
import { Testimonials } from "./twitter-testimonial-cards";

function Testimonial() {
  const testimonialRef = useRef<HTMLDivElement>(null);

  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.2,
        duration: 0.4,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  return (
    <section className="w-full bg-black py-12">
      <section className="relative h-full container text-white mx-auto rounded-lg py-14 bg-black" ref={testimonialRef}>
        <div className="max-w-screen-md mx-auto text-center space-y-2">
          <TimelineContent
            as="h1"
            className="xl:text-4xl text-3xl font-medium"
            animationNum={0}
            customVariants={revealVariants}
            timelineRef={testimonialRef}
          >
            Trusted by Startups and the world's largest companies
          </TimelineContent>
          <TimelineContent
            as="p"
            className="mx-auto text-white/60"
            animationNum={1}
            customVariants={revealVariants}
            timelineRef={testimonialRef}
          >
            Let's hear how Bloomport clients feel about our service
          </TimelineContent>
        </div>

        <div className="flex min-h-[400px] w-full items-center justify-center py-16 sm:py-24 relative z-10">
          <Testimonials />
        </div>
      
    </section>
    </section>
  );
}

export default Testimonial;
