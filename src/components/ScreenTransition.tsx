import React, {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

type Frame = { key: string; content: ReactNode };

/** A short horizontal slide, with the previous screen underneath until it finishes. */
export function ScreenTransition({
  screenKey,
  direction = 1,
  children,
}: {
  screenKey: string;
  direction?: 1 | -1;
  children: ReactNode;
}) {
  const { width } = useWindowDimensions();
  const offset = useRef(new Animated.Value(0)).current;
  const viewportWidth = useRef(width);
  viewportWidth.current = width;
  const latest = useRef<Frame>({ key: screenKey, content: children });
  const reducedMotion = useRef(false);
  const [previous, setPrevious] = useState<Frame | null>(null);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then(enabled => {
      if (mounted) {
        reducedMotion.current = enabled;
      }
    });
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      enabled => {
        reducedMotion.current = enabled;
      },
    );
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useLayoutEffect(() => {
    if (latest.current.key === screenKey) {
      return;
    }
    if (reducedMotion.current) {
      offset.setValue(0);
      setPrevious(null);
      return;
    }
    setPrevious(latest.current);
    offset.setValue(direction === 1 ? 0 : -viewportWidth.current);
  }, [direction, offset, screenKey]);

  // The animated track stays mounted while its ordinary screen views change.
  useEffect(() => {
    if (!previous) {
      return;
    }
    const animation = Animated.timing(offset, {
      toValue: direction === 1 ? -width : 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished) {
        setPrevious(null);
      }
    });
    return () => animation.stop();
  }, [direction, offset, previous, width]);

  useLayoutEffect(() => {
    if (!previous) {
      offset.setValue(0);
    }
  }, [offset, previous]);

  useLayoutEffect(() => {
    latest.current = { key: screenKey, content: children };
  });

  const frames =
    previous && previous.key !== screenKey
      ? direction === 1
        ? [previous, { key: screenKey, content: children }]
        : [{ key: screenKey, content: children }, previous]
      : [{ key: screenKey, content: children }];
  return (
    <View style={styles.container} pointerEvents={previous ? 'none' : 'auto'}>
      <Animated.View
        style={[
          styles.track,
          { width: width * frames.length, transform: [{ translateX: offset }] },
        ]}
      >
        {frames.map(frame => {
          const leaving = frame.key !== screenKey;
          return (
            <View
              key={frame.key}
              pointerEvents={leaving ? 'none' : 'auto'}
              accessibilityElementsHidden={leaving}
              importantForAccessibility={
                leaving ? 'no-hide-descendants' : 'auto'
              }
              style={[styles.screen, { width }]}
            >
              {frame.content}
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', backgroundColor: '#FEFDFD' },
  track: { flex: 1, flexDirection: 'row' },
  screen: { flexShrink: 0, backgroundColor: '#FEFDFD' },
});
