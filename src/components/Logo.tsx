type LogoVariant = "light" | "dark";

const logoSrc: Record<LogoVariant, string> = {
  light: "/iconBk.png",
  dark: "/iconWh.png",
};

export function Logo({
  className = "w-8 h-8",
  variant = "light",
}: {
  className?: string;
  variant?: LogoVariant;
}) {
  return (
    <img
      src={logoSrc[variant]}
      alt="Bloomport"
      className={className}
    />
  );
}
