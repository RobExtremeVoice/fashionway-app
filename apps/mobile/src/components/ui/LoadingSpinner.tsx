import { memo } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'
import { colors, typography } from '../../theme/tokens'

interface Props {
  label?: string
}

function LoadingSpinnerBase({ label = 'Carregando...' }: Props) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      style={{ alignItems: 'center', paddingVertical: 24 }}
    >
      <ActivityIndicator size="large" color={colors.primary700} />
      <Text style={{ color: colors.neutral500, marginTop: 12, fontSize: typography.sm }}>{label}</Text>
    </View>
  )
}

export const LoadingSpinner = memo(LoadingSpinnerBase)
