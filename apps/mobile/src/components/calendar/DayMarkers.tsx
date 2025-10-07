import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export type MarkerType =
  | 'period'
  | 'fertile'
  | 'ovulation'
  | 'sex'
  | 'symptom'
  | 'medication'
  | 'appointment'
  | 'mood';

interface DayMarkersProps {
  markers: MarkerType[];
  isPredicted?: boolean;
  maxVisible?: number;
  mood?: string[]; // Array of moods for the day
}

export function DayMarkers({ markers, isPredicted, maxVisible = 4, mood }: DayMarkersProps) {
  const theme = useTheme();

  // Calculate mood emoji based on selections
  const getMoodEmoji = (moods: string[]): string | null => {
    if (!moods || moods.length === 0) return null;

    console.log('DayMarkers - Processing moods:', moods);

    const positiveMoods = ['Mutlu', 'Enerjik', 'Sakin'];
    const negativeMoods = ['Üzgün', 'Sinirli', 'Anksiyetli', 'Huzursuz'];

    const positiveCount = moods.filter(m => positiveMoods.includes(m)).length;
    const negativeCount = moods.filter(m => negativeMoods.includes(m)).length;

    console.log('DayMarkers - Positive count:', positiveCount, 'Negative count:', negativeCount);

    // If only positive moods selected
    if (positiveCount > 0 && negativeCount === 0) {
      console.log('DayMarkers - Returning positive emoji');
      return '😊';
    }

    // If only negative moods selected
    if (negativeCount > 0 && positiveCount === 0) {
      console.log('DayMarkers - Returning negative emoji');
      return '😔';
    }

    // If mixed selection
    if (positiveCount > 0 && negativeCount > 0) {
      console.log('DayMarkers - Returning neutral emoji');
      return '😐';
    }

    console.log('DayMarkers - No mood emoji returned');
    return null;
  };

  const moodEmoji = getMoodEmoji(mood || []);
  console.log('DayMarkers - Final mood emoji:', moodEmoji, 'for moods:', mood);

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
      case 'mood':
        return moodEmoji || '😐';
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
      {/* Show mood emoji first if available */}
      {moodEmoji && (
        <Text style={styles.moodMarker}>
          {moodEmoji}
        </Text>
      )}
      {visibleMarkers.filter(m => m !== 'mood').map((marker, index) => (
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
    minHeight: 14,
  },
  moodMarker: {
    fontSize: 12,
    marginHorizontal: 1,
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
