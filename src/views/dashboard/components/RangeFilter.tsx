import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { Typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import type { TimeRange } from '../types';

type RangeFilterProps = {
  ranges: TimeRange[];
  selectedRange: TimeRange;
  onSelectRange: (range: TimeRange) => void;
};

export function RangeFilter({ ranges, selectedRange, onSelectRange }: RangeFilterProps) {
  const { colors, isDark } = useTheme();
  const activeBackground = isDark ? colors['secondary-container'] : colors.primary;
  const activeText = isDark ? colors['on-surface'] : colors['on-primary'];
  const outlineColor = isDark ? colors.primary : colors.primary;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.rangeScroller}
      contentContainerStyle={styles.rangeList}>
      {ranges.map((range) => {
        const active = range === selectedRange;

        return (
          <Pressable
            key={range}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onSelectRange(range)}
            style={[
              styles.rangeChip,
              {
                backgroundColor: active ? activeBackground : 'transparent',
                borderColor: outlineColor,
              },
            ]}>
            <Text style={[styles.rangeText, { color: active ? activeText : colors.primary }]}>
              {range}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rangeScroller: {
    width: '100%',
  },
  rangeList: {
    flexDirection: 'row',
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: 8,
    paddingTop: 23,
    paddingBottom: 19,
  },
  rangeChip: {
    minWidth: 42,
    height: 25,
    borderRadius: 20,
    borderWidth: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  rangeText: {
    ...Typography.body,
    fontFamily: Typography.screenTitle.fontFamily,
    fontSize: 13,
    lineHeight: 16,
  },
});
