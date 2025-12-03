// Onboarding Splash Screen - Auto-advancing carousel for non-authenticated users

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { baihubAnalytics } from '../../services/baihub-analytics.service';

type Props = NativeStackScreenProps<AuthStackParamList, 'OnboardingSplash'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AUTO_ADVANCE_INTERVAL = 3000; // 3 seconds

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  illustration: any;
}

const ONBOARDING_DATA: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Trusted Helpers',
    description:
      "Verified, background-checked helpers you can rely on.",
    illustration: require('../../../assets/onboarding/illustration-screen1.png'),
  },
  {
    id: '2',
    title: '30-Day Uninterrupted Service.',
    description:
      "Guaranteed continuity with instant backup support.",
    illustration: require('../../../assets/onboarding/illustration-screen2.png'),
  },
  {
    id: '3',
    title: 'Reliable Help, Always On Time.',
    description: 'Your helper arrives on time, every day. No more waiting or delays.',
    illustration: require('../../../assets/onboarding/illustration-screen3.png'),
  },
];

export default function OnboardingSplashScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance carousel
  useEffect(() => {
    startAutoAdvance();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentIndex]);

  const startAutoAdvance = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % ONBOARDING_DATA.length;
      scrollToIndex(nextIndex);
    }, AUTO_ADVANCE_INTERVAL);
  };

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
    setCurrentIndex(index);
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / SCREEN_WIDTH);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  };

  const handleGetStarted = async () => {
    await baihubAnalytics.logGetStartedClicked();
    navigation.navigate('Login');
  };

  const renderItem = ({ item, index }: { item: OnboardingSlide; index: number }) => (
    <View style={styles.slide}>
      {/* Background Shape */}
      <View style={styles.illustrationContainer}>
        <Image
          source={require('../../../assets/onboarding/background-shape.png')}
          style={[
            styles.backgroundShape,
            {
              transform: [
                { rotate: index === 0 ? '104deg' : index === 1 ? '73deg' : '100deg' },
              ],
            },
          ]}
        />
        <Image source={item.illustration} style={styles.illustration} resizeMode="contain" />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../../../assets/onboarding/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      />

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {ONBOARDING_DATA.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              currentIndex === index ? styles.paginationDotActive : styles.paginationDotInactive,
            ]}
          />
        ))}
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{ONBOARDING_DATA[currentIndex].title}</Text>
          <Text style={styles.description}>{ONBOARDING_DATA[currentIndex].description}</Text>
          
          <TouchableOpacity style={styles.button} onPress={handleGetStarted} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFCC00', // Brand yellow
  },
  logoContainer: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  logo: {
    width: 200,
    height: 72,
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationContainer: {
    width: SCREEN_WIDTH,
    height: 450,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backgroundShape: {
    position: 'absolute',
    width: 400,
    height: 280,
    opacity: 0.48,
  },
  illustration: {
    width: 350,
    height: 400,
    zIndex: 1,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 13,
    marginBottom: 20,
  },
  paginationDot: {
    borderRadius: 161,
  },
  paginationDotActive: {
    width: 59,
    height: 4,
    backgroundColor: '#000000', // Black
  },
  paginationDotInactive: {
    width: 4,
    height: 4,
    backgroundColor: '#FFFFFF', // White
  },
  bottomSheet: {
    backgroundColor: '#FFFAE6', // Cream color
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 40,
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
    paddingHorizontal: 24,
    minHeight: 270,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -16,
    },
    shadowOpacity: 0.16,
    shadowRadius: 48,
    elevation: 24,
  },
  contentContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: Platform.OS === 'ios' ? 'Inter-Bold' : 'Inter_700Bold',
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 14,
    maxWidth: 273,
  },
  description: {
    fontFamily: Platform.OS === 'ios' ? 'Inter-Light' : 'Inter_300Light',
    fontSize: 12,
    fontWeight: '300',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 40,
    maxWidth: 252,
  },
  button: {
    backgroundColor: '#000000', // Black
    borderRadius: 20,
    height: 72,
    width: 306,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontFamily: Platform.OS === 'ios' ? 'Inter-Regular' : 'Inter_400Regular',
    fontSize: 20,
    fontWeight: '400',
    color: '#FFCC00', // Brand yellow
  },
});



