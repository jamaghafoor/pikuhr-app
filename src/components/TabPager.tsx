import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

/** Keep tab screens mounted while sliding the viewport to the selected page. */
export function TabPager({
  activeIndex,
  children,
}: {
  activeIndex: number;
  children: React.ReactNode;
}) {
  const { width } = useWindowDimensions();
  const offset = useRef(new Animated.Value(-activeIndex * width)).current;
  const previous = useRef({ activeIndex, width });
  const [reduceMotion, setReduceMotion] = useState(true);

  useEffect(() => {
    let mounted = true;
    let preferenceChanged = false;
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (mounted && !preferenceChanged) {
        setReduceMotion(enabled);
      }
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      enabled => {
        preferenceChanged = true;
        setReduceMotion(enabled);
      },
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useLayoutEffect(() => {
    const shouldSlide =
      !reduceMotion &&
      previous.current.width === width &&
      previous.current.activeIndex !== activeIndex;
    previous.current = { activeIndex, width };
    const toValue = -activeIndex * width;
    if (!shouldSlide) {
      offset.setValue(toValue);
      return;
    }
    const animation = Animated.timing(offset, {
      toValue,
      duration: 250,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    // A new selection continues from the current position, including rapid taps.
    return () => animation.stop();
  }, [activeIndex, offset, reduceMotion, width]);

  const pages = React.Children.toArray(children);
  return (
    <View style={styles.viewport}>
      <Animated.View
        style={[
          styles.track,
          {
            width: width * pages.length,
            transform: [{ translateX: offset }],
          },
        ]}
      >
        {pages.map((page, index) => (
          <View
            key={React.isValidElement(page) ? page.key : index}
            style={[styles.page, { width }]}
            pointerEvents={index === activeIndex ? 'auto' : 'none'}
            accessibilityElementsHidden={index !== activeIndex}
            importantForAccessibility={
              index === activeIndex ? 'auto' : 'no-hide-descendants'
            }
          >
            {page}
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1, overflow: 'hidden' },
  track: { flex: 1, flexDirection: 'row' },
  page: { flexShrink: 0, backgroundColor: '#F5F5F5' },
});
