import { memo } from 'react'
import { Text, View } from 'react-native'
import { colors } from '../../theme/tokens'

interface Props {
  current: number
  steps: string[]
}

function StepProgressBase({ current, steps }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 0, marginBottom: 28, alignItems: 'center' }}>
      {steps.map((step, i) => (
        <View key={step} style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 8 }}>
            {i > 0 && <View style={{ flex: 1, height: 2, backgroundColor: i <= current ? colors.primary700 : colors.neutral200 }} />}
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: i <= current ? colors.primary700 : colors.neutral200,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: i === current ? 3 : 0,
                borderColor: colors.primary100,
              }}
            >
              <Text style={{ color: i <= current ? '#fff' : colors.neutral400, fontSize: 11, fontWeight: '700' }}>
                {i < current ? '✓' : String(i + 1)}
              </Text>
            </View>
            {i < steps.length - 1 && (
              <View style={{ flex: 1, height: 2, backgroundColor: i < current ? colors.primary700 : colors.neutral200 }} />
            )}
          </View>
          <Text
            style={{
              fontSize: 10,
              fontWeight: '600',
              color: i <= current ? colors.primary700 : colors.neutral400,
              textAlign: 'center',
            }}
          >
            {step}
          </Text>
        </View>
      ))}
    </View>
  )
}

export const StepProgress = memo(StepProgressBase)
