import React from 'react';

interface Card3DTiltProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  perspective?: number;
  scaleHover?: number;
  enableGlare?: boolean;
  style?: React.CSSProperties;
  id?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const Card3DTilt: React.FC<Card3DTiltProps> = ({
  children,
  className = '',
  style = {},
  id,
  onClick,
}) => {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};


