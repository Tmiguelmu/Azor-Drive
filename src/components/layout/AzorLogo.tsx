interface AzorLogoProps {
  size?: number;
}

export const AzorLogo = ({ size = 36 }: AzorLogoProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 40 40"
    width={size}
    height={size}
  >
    <rect width="40" height="40" rx="8" fill="#3B6CB4" />
    <text
      x="20"
      y="26"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
      fontSize="13"
      fontWeight="bold"
      fill="white"
      letterSpacing="1"
    >
      AZ
    </text>
    <path d="M6 30 L20 14 L34 30 L28 30 L20 20 L12 30 Z" fill="rgba(255,255,255,0.25)" />
  </svg>
);
