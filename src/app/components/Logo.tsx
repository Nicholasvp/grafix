// src/app/components/Logo.tsx
import Image from 'next/image'

interface LogoProps {
  variant: 'horizontal' | 'vertical'
  className?: string
  width?: number
  height?: number
}

export default function Logo({ variant, className = '', width, height }: LogoProps) {
  const isHorizontal = variant === 'horizontal'
  
  // Dimensões padrão baseadas no tipo
  const defaultWidth = isHorizontal ? 120 : 80
  const defaultHeight = isHorizontal ? 40 : 80
  
  const logoSrc = isHorizontal ? '/logo-horizontal.svg' : '/logo-vertical.svg'
  const altText = isHorizontal ? 'Grafix Logo Horizontal' : 'Grafix Logo Vertical'

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src={logoSrc}
        alt={altText}
        width={width || defaultWidth}
        height={height || defaultHeight}
        priority
        className="object-contain"
      />
    </div>
  )
}
