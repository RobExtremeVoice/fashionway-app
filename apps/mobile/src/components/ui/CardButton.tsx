import { memo, type ReactNode } from 'react'
import { TouchableOpacity, type TouchableOpacityProps } from 'react-native'
import { touchTarget } from '../../theme/tokens'

interface Props extends TouchableOpacityProps {
  children: ReactNode
}

function CardButtonBase({ children, style, activeOpacity = 0.92, ...props }: Props) {
  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      accessibilityRole="button"
      style={[
        {
          minHeight: touchTarget.minHeight,
          justifyContent: 'center',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </TouchableOpacity>
  )
}

export const CardButton = memo(CardButtonBase)
