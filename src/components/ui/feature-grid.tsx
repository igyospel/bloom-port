import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export interface Feature {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  href: string;
}

export interface FeatureGridProps {
  features: Feature[];
  className?: string;
}

const FeatureCard: React.FC<{ feature: Feature }> = ({ feature }) => (
  <a
    href={feature.href}
    className={cn(
      "group",
      "flex flex-col sm:flex-row items-start gap-6",
      "p-6 rounded-lg border border-white/10",
      "bg-white/5 text-white backdrop-blur-sm",
      "transition-all duration-300",
      "hover:shadow-md hover:-translate-y-1 hover:bg-white/10",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2"
    )}
  >
    <div className="flex-shrink-0">
      <img
        src={feature.imageSrc}
        alt={feature.imageAlt}
        className="h-24 w-24 object-contain"
      />
    </div>
    <div className="flex flex-1 flex-col justify-between h-full">
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">
          {feature.title}
        </h3>
        <p className="text-sm text-white/70">
          {feature.description}
        </p>
      </div>
      <div className="flex justify-end mt-4">
        <ArrowRight className="h-5 w-5 text-white/50 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-white" />
      </div>
    </div>
  </a>
);

const FeatureGrid = React.forwardRef<HTMLDivElement, FeatureGridProps>(
  ({ features, className }, ref) => {
    if (!features || features.length === 0) {
      return null;
    }
    return (
      <div
        ref={ref}
        className={cn(
          "grid grid-cols-1 gap-6 lg:grid-cols-2",
          className
        )}
      >
        {features.map((feature, index) => (
          <FeatureCard key={index} feature={feature} />
        ))}
      </div>
    );
  }
);

FeatureGrid.displayName = "FeatureGrid";

export { FeatureGrid };
