import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const pages = [
  {
    title: 'Welcome to Pikuhr.com',
    description:
      'Discover a smarter way to manage your tasks, stay organized, and boost your daily productivity effortlessly.',
    image: require('../../assets/images/onboarding-welcome.png'),
    width: 320,
    height: 323,
  },
  {
    title: 'Access Anywhere,\nAnytime',
    description:
      'Your data syncs automatically across your phone, tablet, and laptop so you never lose track of your work.',
    image: require('../../assets/images/onboarding-anywhere.png'),
    width: 260,
    height: 288,
  },
  {
    title: 'Your All-In-One\nWorkspace',
    description:
      'Say goodbye to cluttered apps. Experience the ultimate, unified platform designed just for you.',
    image: require('../../assets/images/onboarding-workspace.png'),
    width: 338,
    height: 273,
  },
];

type Props = { onFinish: () => void; onReady: () => void };

export function OnboardingScreen({ onFinish, onReady }: Props) {
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scale = Math.min(width / 375, 1.2);
  const [page, setPage] = useState(0);
  const [animating, setAnimating] = useState(false);
  const progress = useRef(new Animated.Value(0)).current;
  const translateX = useMemo(
    () => Animated.multiply(progress, -width),
    [progress, width],
  );
  const currentPage = useRef(0);
  const transitioning = useRef(false);
  const reduceMotion = useRef(false);
  const [imageReady, setImageReady] = useState(false);
  const [layoutReady, setLayoutReady] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (mounted) {
        reduceMotion.current = enabled;
      }
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      enabled => (reduceMotion.current = enabled),
    );
    return () => {
      mounted = false;
      subscription.remove();
      progress.stopAnimation();
    };
  }, [progress]);

  useEffect(() => {
    if (imageReady && layoutReady) {
      onReady();
    }
  }, [imageReady, layoutReady, onReady]);

  const goToPage = useCallback(
    (next: number) => {
      if (transitioning.current || next < 0 || next >= pages.length) {
        return;
      }
      transitioning.current = true;
      setAnimating(true);
      Animated.timing(progress, {
        toValue: next,
        duration: reduceMotion.current ? 0 : 420,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          currentPage.current = next;
          setPage(next);
          AccessibilityInfo.announceForAccessibility(
            `${next + 1} of ${pages.length}. ${pages[next].title.replace(
              '\n',
              ' ',
            )}`,
          );
        }
        transitioning.current = false;
        setAnimating(false);
      });
    },
    [progress],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 18 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
        onPanResponderRelease: (_, gesture) => {
          if (Math.abs(gesture.dx) > 45) {
            goToPage(currentPage.current + (gesture.dx < 0 ? 1 : -1));
          }
        },
      }),
    [goToPage],
  );

  const lastPage = page === pages.length - 1;
  // Scroll only on compact displays or with enlarged accessibility text.
  const contentHeight = Math.max(
    viewportHeight || height - insets.top - insets.bottom,
    650 * scale + Math.max(fontScale - 1, 0) * 190,
  );

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        onLayout={event => setViewportHeight(event.nativeEvent.layout.height)}
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ minHeight: contentHeight }}
      >
        <View
          style={[styles.pager, { minHeight: contentHeight - 160 * scale }]}
          onLayout={() => setLayoutReady(true)}
          {...panResponder.panHandlers}
        >
          <Animated.View
            style={[
              styles.track,
              {
                width: width * pages.length,
                transform: [{ translateX }],
              },
            ]}
          >
            {pages.map((item, index) => (
              <View
                key={item.title}
                style={[styles.page, { width }]}
                accessibilityElementsHidden={index !== page}
                importantForAccessibility={
                  index === page ? 'auto' : 'no-hide-descendants'
                }
              >
                <View style={styles.artwork}>
                  <Image
                    source={item.image}
                    style={{
                      width: item.width * scale,
                      height: item.height * scale,
                    }}
                    resizeMode="contain"
                    accessible={false}
                    fadeDuration={0}
                    onLoad={index === 0 ? () => setImageReady(true) : undefined}
                  />
                </View>
                <View style={[styles.copy, { paddingHorizontal: 27 * scale }]}>
                  <View
                    style={[
                      styles.titleSlot,
                      {
                        minHeight: 62 * scale * fontScale,
                      },
                    ]}
                  >
                    <Text
                      accessibilityRole="header"
                      style={[
                        styles.title,
                        { fontSize: 24 * scale, lineHeight: 30 * scale },
                      ]}
                    >
                      {item.title}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.description,
                      {
                        fontSize: 15 * scale,
                        lineHeight: 23 * scale,
                        marginTop: 11 * scale,
                        minHeight: 69 * scale * fontScale,
                      },
                    ]}
                  >
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </Animated.View>
        </View>
        <View
          style={[
            styles.footer,
            { height: 160 * scale, paddingHorizontal: 27 * scale },
          ]}
        >
          <View
            style={styles.dots}
            accessible
            accessibilityLabel={`Page ${page + 1} of ${pages.length}`}
          >
            {pages.map((item, index) => (
              <View
                key={item.title}
                style={[styles.dot, index === page && styles.activeDot]}
              />
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={lastPage ? 'Start Now' : 'Next'}
            accessibilityState={{ disabled: animating }}
            disabled={animating}
            onPress={() => (lastPage ? onFinish() : goToPage(page + 1))}
            style={({ pressed }) => [
              styles.next,
              {
                height: 50 * scale,
                borderRadius: 30 * scale,
                marginTop: 33 * scale,
              },
              pressed && styles.pressed,
            ]}
          >
            <Text style={[styles.nextLabel, { fontSize: 15 * scale }]}>
              {lastPage ? 'Start Now' : 'Next'}
            </Text>
          </Pressable>
          <View style={[styles.skipSlot, { marginTop: 24 * scale }]}>
            {!lastPage && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Skip onboarding"
                hitSlop={8}
                onPress={onFinish}
                style={({ pressed }) => [
                  styles.skip,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={[styles.skipLabel, { fontSize: 18 * scale }]}>
                  Skip
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FEFDFD' },
  pager: { overflow: 'hidden' },
  track: { flex: 1, flexDirection: 'row' },
  page: { alignItems: 'center' },
  artwork: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
  },
  copy: { width: '100%', paddingBottom: 28 },
  titleSlot: { justifyContent: 'flex-end' },
  title: {
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    color: '#080808',
    includeFontPadding: false,
  },
  description: {
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    color: '#595959',
    includeFontPadding: false,
  },
  footer: { alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 6, height: 9, alignItems: 'center' },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#D9D9D9' },
  activeDot: { backgroundColor: '#408BF0' },
  next: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#408BF0',
    backgroundImage: 'linear-gradient(90deg, #4285EC 0%, #14DEDF 100%)',
  },
  nextLabel: {
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
    includeFontPadding: false,
  },
  skipSlot: { height: 44 },
  skip: {
    minWidth: 64,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipLabel: {
    fontFamily: 'Poppins-Regular',
    color: '#408BF0',
    textDecorationLine: 'underline',
    includeFontPadding: false,
  },
  pressed: { opacity: 0.75 },
});
