import { memo } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { colors, typography } from '../../theme/tokens'

export interface BreadcrumbItem {
  label: string
  onPress?: () => void
}

interface Props {
  items: BreadcrumbItem[]
}

function BreadcrumbBase({ items }: Props) {
  return (
    <View accessibilityRole="summary" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <View key={`${item.label}-${index}`} style={{ flexDirection: 'row', alignItems: 'center' }}>
            {item.onPress && !isLast ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Ir para ${item.label}`}
                onPress={item.onPress}
              >
                <Text style={{ color: colors.primary700, fontSize: typography.sm, fontWeight: '600' }}>{item.label}</Text>
              </TouchableOpacity>
            ) : (
              <Text style={{ color: isLast ? colors.neutral700 : colors.neutral500, fontSize: typography.sm }}>
                {item.label}
              </Text>
            )}
            {!isLast && <Text style={{ color: colors.neutral400, marginHorizontal: 6 }}>{'>'}</Text>}
          </View>
        )
      })}
    </View>
  )
}

export const Breadcrumb = memo(BreadcrumbBase)
