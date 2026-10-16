/**
 * Shima Delivery Logomark
 * Stylized double-pin loop forming an 'S' in brand red (#CC0033)
 */
export const ShimaLogo = ({
  className = 'h-8 w-auto',
  color = '#CC0033',
  style,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 300 400"
      width="100%"
      height="100%"
      className={className}
      style={style}
      aria-label="Shima Delivery Logomark"
      {...props}
    >
      <defs>
        <style>
          {`.brand-red { fill: ${color}; }`}
        </style>
      </defs>

      <g transform="translate(150, 200)">
        {/* Top Pin / Loop */}
        <path
          className="brand-red"
          d="
            M 0 -170 
            C 45 -170, 75 -135, 75 -90 
            C 75 -40, 25 10, 0 45 
            C -25 10, -75 -40, -75 -90 
            C -75 -135, -45 -170, 0 -170 
            Z
            M 0 -125 
            C -20 -125, -35 -110, -35 -90 
            C -35 -70, -20 -55, 0 -55 
            C 20 -55, 35 -70, 35 -90 
            C 35 -110, 20 -125, 0 -125 
            Z"
        />

        {/* Bottom Pin / Loop (Inverted to form the stylized S) */}
        <path
          className="brand-red"
          d="
            M 0 170 
            C -45 170, -75 135, -75 90 
            C -75 40, -25 -10, 0 -45 
            C 25 -10, 75 40, 75 90 
            C 75 135, 45 170, 0 170 
            Z
            M 0 125 
            C 20 125, 35 110, 35 90 
            C 35 70, 20 55, 0 55 
            C -20 55, -35 70, -35 90 
            C -35 110, -20 125, 0 125 
            Z"
        />
      </g>
    </svg>
  )
}

export default ShimaLogo
