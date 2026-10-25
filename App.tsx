import React, { useCallback } from 'react';
import { NativeModules, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MainTabs } from './src/navigation/MainTabs';
import { EmployeeProvider } from './src/state/EmployeeContext';

// Keep the native splash visible until the main app has laid out.
const launch = NativeModules.PikuhrLaunch as
  | {
      hide: () => void;
    }
  | undefined;

export default function App() {
  const onReady = useCallback(() => launch?.hide(), []);

  return (
    <SafeAreaProvider>
      <View style={styles.root} onLayout={onReady}>
        <EmployeeProvider>
          <MainTabs />
        </EmployeeProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F5F5F5' },
});
