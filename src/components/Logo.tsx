type LogoVariant = "light" | "dark";

const logoSrc: Record<LogoVariant, string> = {
  light: "/iconBk.png",
  dark: "/iconWh.png",
};

export function Logo({
  className = "h-8 w-auto",
  variant = "light",
}: {
  className?: string;
  variant?: LogoVariant;
}) {
  return (
    <img
      src={logoSrc[variant]}
      alt="Bloomport"
      className={`object-contain ${className}`}
    />
  );
}
