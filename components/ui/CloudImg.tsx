interface CloudImgProps {
  src: string
  alt: string
  className?: string
  fallback?: React.ReactNode
}

export default function CloudImg({ src, alt, className = '', fallback }: CloudImgProps) {
  if (!src) return <>{fallback ?? null}</>
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />
}
