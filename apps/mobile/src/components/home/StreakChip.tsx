import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';

interface StreakChipProps {
  current: number;
  longest: number;
  cycleDay?: number | null;
  onPress?: () => void;
}

export function StreakChip({ current, longest, cycleDay, onPress }: StreakChipProps) {
  const theme = useTheme();
  const styles = createStyles(theme);

  // Regl döngüsüne göre özel tasarım
  const isPeriodWeek = cycleDay != null && cycleDay >= 1 && cycleDay <= 7;
  const isOvulationWeek = cycleDay != null && cycleDay >= 12 && cycleDay <= 16;

  // Streak seviyesine göre renk ve emoji
  const getStreakLevel = () => {
    if (isPeriodWeek) {
      return {
        colors: ['#FF6B9D', '#C44569'] as const,
        emoji: '🌸',
        label: 'Regl döneminde takiptesin',
        iconBg: '#FF6B9D20'
      };
    }
    if (isOvulationWeek) {
      return {
        colors: ['#A8E6CF', '#56AB91'] as const,
        emoji: '🌼',
        label: 'Yumurtlama döneminde',
        iconBg: '#A8E6CF20'
      };
    }
    if (current >= 30) return {
      colors: ['#FF6B35', '#FF8C42'] as const,
      emoji: '🔥',
      label: 'Muhteşem bir alışkanlık!',
      iconBg: '#FF6B3520'
    };
    if (current >= 14) return {
      colors: ['#FF8C42', '#FFA94D'] as const,
      emoji: '🔥',
      label: 'Harika ilerliyorsun!',
      iconBg: '#FF8C4220'
    };
    if (current >= 7) return {
      colors: ['#FFA94D', '#FFB84D'] as const,
      emoji: '🔥',
      label: 'Bir haftayı geçtin!',
      iconBg: '#FFA94D20'
    };
    if (current >= 3) return {
      colors: ['#FFB84D', '#FFD93D'] as const,
      emoji: '🔥',
      label: 'Güzel gidiyorsun!',
      iconBg: '#FFB84D20'
    };
    return {
      colors: ['#FFD93D', '#FFE66D'] as const,
      emoji: '✨',
      label: 'Yeni başlangıç',
      iconBg: '#FFD93D20'
    };
  };

  const level = getStreakLevel();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={level.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Decorative pattern for period week */}
        {isPeriodWeek && (
          <View style={styles.decorativePattern}>
            <Text style={styles.decorativeEmoji}>🌸</Text>
            <Text style={styles.decorativeEmoji}>🌸</Text>
            <Text style={styles.decorativeEmoji}>🌸</Text>
          </View>
        )}

        {/* Decorative pattern for ovulation week */}
        {isOvulationWeek && (
          <View style={styles.decorativePattern}>
            <Text style={styles.decorativeEmoji}>🌼</Text>
            <Text style={styles.decorativeEmoji}>🌼</Text>
            <Text style={styles.decorativeEmoji}>🌼</Text>
          </View>
        )}

        <View style={styles.content}>
          <View style={[styles.iconContainer, { backgroundColor: level.iconBg }]}>
            <Text style={styles.icon}>{level.emoji}</Text>
          </View>

          <View style={styles.textContainer}>
            <View style={styles.mainRow}>
              <Text style={styles.value}>{current}</Text>
              <Text style={styles.label}>gün üst üste</Text>
            </View>
            <Text style={styles.levelLabel}>{level.label}</Text>
            {cycleDay != null && cycleDay > 0 && (
              <Text style={styles.cycleInfo}>Döngünün {cycleDay}. günü</Text>
            )}
          </View>

          {/* Right side: Mascot and Record */}
          <View style={styles.rightSection}>
            <Image
              source={require('../../../assets/images/mascots/penregl.png')}
              style={styles.mascotImage}
              resizeMode="contain"
            />
            {longest > current && (
              <View style={styles.recordBadge}>
                <Text style={styles.recordLabel}>Rekor</Text>
                <Text style={styles.recordValue}>{longest}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      borderRadius: 20,
      overflow: 'visible',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    gradient: {
      borderRadius: 20,
      position: 'relative',
    },
    decorativePattern: {
      position: 'absolute',
      top: 0,
      right: 0,
      flexDirection: 'row',
      opacity: 0.15,
      transform: [{ rotate: '15deg' }],
    },
    decorativeEmoji: {
      fontSize: 40,
      marginLeft: -10,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      minHeight: 85,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    icon: {
      fontSize: 24,
    },
    textContainer: {
      flex: 1,
    },
    rightSection: {
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: -10,
      marginRight: -15,
    },
    mascotImage: {
      width: 160,
      height: 160,
      marginBottom: 2,
      marginTop: -20,
    },
    recordBadge: {
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 16,
      alignItems: 'center',
      minWidth: 70,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.5)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    mainRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 6,
    },
    value: {
      fontSize: 28,
      fontWeight: '900',
      color: '#FFFFFF',
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.9)',
    },
    levelLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: 'rgba(255, 255, 255, 0.95)',
      marginTop: 2,
      letterSpacing: 0.3,
    },
    cycleInfo: {
      fontSize: 10,
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: 3,
      letterSpacing: 0.2,
    },
    recordLabel: {
      fontSize: 11,
      color: 'rgba(255, 255, 255, 1)',
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    recordValue: {
      fontSize: 22,
      fontWeight: '900',
      color: '#FFFFFF',
      marginTop: 2,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },
  });
