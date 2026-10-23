import React, { useCallback, useState } from 'react';
import { NativeModules, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/screens/HomeScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { AuthFlow } from './src/screens/auth/AuthFlow';
import { ScreenTransition } from './src/components/ScreenTransition';

// Android reads completion before the first JS render, avoiding an onboarding flash.
const launch = NativeModules.PikuhrLaunch as
  | {
      hasCompletedOnboarding: boolean;
      hide: () => void;
      completeOnboarding: () => void;
    }
  | undefined;

export default function App() {
  const [screen, setScreen] = useState<'onboarding' | 'auth' | 'home'>(
    launch?.hasCompletedOnboarding ? 'auth' : 'onboarding',
  );
  const finishOnboarding = useCallback(() => {
    launch?.completeOnboarding();
    setScreen('auth');
  }, []);
  const onReady = useCallback(() => launch?.hide(), []);

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={screen === 'auth' ? 'light-content' : 'dark-content'}
      />
      <View
        style={styles.root}
        onLayout={screen === 'onboarding' ? undefined : onReady}
      >
        <ScreenTransition screenKey={screen}>
          {screen === 'home' ? (
            <HomeScreen />
          ) : screen === 'auth' ? (
            <AuthFlow onComplete={() => setScreen('home')} />
          ) : (
            <OnboardingScreen onFinish={finishOnboarding} onReady={onReady} />
          )}
        </ScreenTransition>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FEFDFD' },
});
