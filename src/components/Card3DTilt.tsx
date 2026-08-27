import React, { useRef, useState, useEffect } from 'react';

interface Card3DTiltProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // max tilt in degrees (default: 8)
  perspective?: number; // perspective in px (default: 1000)
  scaleHover?: number; // hover scale (default: 1.015)
  enableGlare?: boolean; // dynamic specular sheen glare
  style?: React.CSSProperties;
  id?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const Card3DTilt: React.FC<Card3DTiltProps> = ({
  children,
  className = '',
  maxTilt = 8,
  perspective = 1000,
  scaleHover = 1.015,
  enableGlare = true,
  style = {},
  id,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotX, setRotX] = useState<number>(0);
  const [rotY, setRotY] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [glarePos, setGlarePos] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const targetRotRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const currentRotRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animFrameRef = useRef<number | null>(null);

  // Smooth lerp animation loop for organic spring physics
  useEffect(() => {
    let lastX = 0;
    let lastY = 0;

    const loop = () => {
      const k = 0.14; // Lerp stiffness
      currentRotRef.current.x += (targetRotRef.current.x - currentRotRef.current.x) * k;
      currentRotRef.current.y += (targetRotRef.current.y - currentRotRef.current.y) * k;

      const diffX = Math.abs(currentRotRef.current.x - lastX);
      const diffY = Math.abs(currentRotRef.current.y - lastY);

      if (diffX > 0.02 || diffY > 0.02) {
        lastX = currentRotRef.current.x;
        lastY = currentRotRef.current.y;
        setRotX(lastX);
        setRotY(lastY);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const px = x / rect.width; // 0 to 1
    const py = y / rect.height; // 0 to 1

    const tiltX = (py - 0.5) * -maxTilt * 2;
    const tiltY = (px - 0.5) * maxTilt * 2;

    targetRotRef.current = { x: tiltX, y: tiltY };

    if (enableGlare) {
      setGlarePos({
        x: px * 100,
        y: py * 100,
        opacity: 0.28,
      });
    }
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
    setScale(scaleHover);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setScale(1);
    targetRotRef.current = { x: 0, y: 0 };
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  // Shadow deflection based on tilt
  const shadowX = -rotY * 0.8;
  const shadowY = rotX * 0.8 + (isHovered ? 8 : 4);
  const shadowBlur = isHovered ? 24 : 12;

  return (
    <div
      ref={cardRef}
      id={id}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className={`relative transition-shadow duration-300 ${className}`}
      style={{
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      <div
        className="w-full h-full relative rounded-xs transition-transform duration-75"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(${scale}, ${scale}, 1)`,
          boxShadow: `${shadowX.toFixed(1)}px ${shadowY.toFixed(1)}px ${shadowBlur}px rgba(35, 28, 23, ${
            isHovered ? 0.18 : 0.08
          }), 0 1px 3px rgba(35, 28, 23, 0.12)`,
        }}
      >
        {children}

        {/* Dynamic Specular Sheen Glare */}
        {enableGlare && (
          <div
            className="absolute inset-0 pointer-events-none rounded-xs transition-opacity duration-300 overflow-hidden"
            style={{
              opacity: glarePos.opacity,
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 245, 215, 0.5) 0%, rgba(255, 215, 100, 0.15) 35%, transparent 70%)`,
              mixBlendMode: 'color-dodge',
            }}
          />
        )}
      </div>
    </div>
  );
};
