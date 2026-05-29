import Image from "next/image";

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
    <Image
      src={logoSrc[variant]}
      alt="Bloomport"
      width={186}
      height={40}
      className={`object-contain ${className}`}
      priority
    />
  );
}
