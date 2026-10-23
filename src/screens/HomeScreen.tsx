import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomeScreen({ onReady }: { onReady: () => void }) {
  return (
    <SafeAreaView style={styles.screen} onLayout={onReady}>
      <Text accessibilityRole="header" style={styles.title}>
        Home
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEFDFD',
  },
  title: { fontFamily: 'Poppins-Medium', fontSize: 26, color: '#080808' },
});
