import { memo } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, type TouchableOpacityProps } from 'react-native'
import { colors, radius, spacing, typography, touchTarget } from '../../theme/tokens'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface Props extends TouchableOpacityProps {
  label: string
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const sizeMap = {
  sm: { vertical: 10, horizontal: 14, fontSize: typography.sm },
  md: { vertical: 14, horizontal: 16, fontSize: typography.base },
  lg: { vertical: 16, horizontal: spacing.md, fontSize: typography.lg },
}

const variantMap = {
  primary: {
    bg: colors.primary700,
    border: colors.primary700,
    text: '#FFFFFF',
    disabledBg: '#93C5FD',
    disabledText: '#FFFFFF',
  },
  secondary: {
    bg: '#FFFFFF',
    border: colors.primary700,
    text: colors.primary700,
    disabledBg: '#FFFFFF',
    disabledText: colors.neutral400,
  },
  ghost: {
    bg: 'transparent',
    border: 'transparent',
    text: colors.primary700,
    disabledBg: 'transparent',
    disabledText: colors.neutral400,
  },
}

function ButtonBase({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  fullWidth = true,
  style,
  accessibilityLabel,
  ...props
}: Props) {
  const spec = sizeMap[size]
  const theme = variantMap[variant]
  const isDisabled = Boolean(disabled || loading)

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={accessibilityLabel ?? label}
      activeOpacity={0.9}
      disabled={isDisabled}
      style={[
        {
          minHeight: touchTarget.minHeight,
          backgroundColor: isDisabled ? theme.disabledBg : theme.bg,
          borderColor: theme.border,
          borderWidth: variant === 'ghost' ? 0 : 1.5,
          borderRadius: radius.lg,
          paddingVertical: spec.vertical,
          paddingHorizontal: spec.horizontal,
          alignItems: 'center',
          justifyContent: 'center',
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={theme.text} />
      ) : (
        <Text
          style={{
            color: isDisabled ? theme.disabledText : theme.text,
            fontSize: spec.fontSize,
            fontWeight: '700',
            letterSpacing: 0.3,
          }}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  )
}

export const Button = memo(ButtonBase)
