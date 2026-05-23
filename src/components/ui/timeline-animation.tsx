import { motion, useInView, type Variants } from "framer-motion";
import { type ElementType } from "react";

interface TimelineContentProps {
  as?: ElementType;
  className?: string;
  animationNum: number;
  customVariants: {
    visible: (i: number) => Record<string, unknown>;
    hidden: Record<string, unknown>;
  };
  timelineRef: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}

export function TimelineContent({
  as: Tag = "div",
  className,
  animationNum,
  customVariants,
  timelineRef,
  children,
}: TimelineContentProps) {
  const inView = useInView(timelineRef, {
    once: true,
    margin: "-50px",
  });

  const MotionTag = motion.create(Tag);

  return (
    <MotionTag
      className={className}
      custom={animationNum}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={customVariants}
    >
      {children}
    </MotionTag>
  );
}
