import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function HomeScreen() {
  return (
    <SafeAreaView style={styles.screen}>
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
