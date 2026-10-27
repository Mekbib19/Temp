import shimaLogoPng from '../assets/logo/shima.png'

/**
 * Shima Delivery Logomark
 * Uses the custom uploaded brand logo
 */
export const ShimaLogo = ({
  className = 'h-8 w-auto',
  alt = 'Shima Delivery Logo',
  ...props
}) => {
  return (
    <img
      src={shimaLogoPng}
      alt={alt}
      className={`object-contain ${className}`}
      {...props}
    />
  )
}

export default ShimaLogo
