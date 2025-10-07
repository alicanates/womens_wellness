import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export type MarkerType =
  | 'period'
  | 'fertile'
  | 'ovulation'
  | 'sex'
  | 'symptom'
  | 'medication'
  | 'appointment';

interface DayMarkersProps {
  markers: MarkerType[];
  isPredicted?: boolean;
  maxVisible?: number;
}

export function DayMarkers({ markers, isPredicted, maxVisible = 4 }: DayMarkersProps) {
  const theme = useTheme();
  const visibleMarkers = markers.slice(0, maxVisible);
  const overflowCount = markers.length - maxVisible;

  const getMarkerIcon = (type: MarkerType): string => {
    switch (type) {
      case 'period':
        return '●';
      case 'fertile':
        return '○';
      case 'ovulation':
        return '⭐';
      case 'sex':
        return '♥';
      case 'symptom':
        return '😐';
      case 'medication':
        return '💊';
      case 'appointment':
        return '📅';
      default:
        return '•';
    }
  };

  const getMarkerColor = (type: MarkerType): string => {
    switch (type) {
      case 'period':
        return '#FF1493';
      case 'fertile':
        return '#9C27B0';
      case 'ovulation':
        return '#FFD700';
      case 'sex':
        return '#FF69B4';
      case 'symptom':
        return '#FFA500';
      case 'medication':
        return '#00CED1';
      case 'appointment':
        return '#4CAF50';
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <View style={styles.markersContainer}>
      {visibleMarkers.map((marker, index) => (
        <Text
          key={`${marker}-${index}`}
          style={[
            styles.marker,
            { color: getMarkerColor(marker) },
          ]}
        >
          {getMarkerIcon(marker)}
        </Text>
      ))}
      {overflowCount > 0 && (
        <Text style={[styles.overflow, { color: theme.colors.textSecondary }]}>
          +{overflowCount}
        </Text>
      )}
      {isPredicted && (
        <View style={[styles.predictedBadge, { borderColor: '#FF69B4' }]} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  markersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
    minHeight: 12,
  },
  marker: {
    fontSize: 8,
    marginHorizontal: 1,
  },
  overflow: {
    fontSize: 7,
    fontWeight: '600',
    marginLeft: 1,
  },
  predictedBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
  },
});
