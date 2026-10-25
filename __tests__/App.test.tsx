/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { View } from 'react-native';
import App from '../App';
import { OnboardingScreen } from '../src/screens/OnboardingScreen';
import { AuthFlow } from '../src/screens/auth/AuthFlow';
import { HomeScreen } from '../src/screens/HomeScreen';

jest.mock('../src/components/ScreenTransition', () => ({
  ScreenTransition: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

test('launch opens Home directly and the remaining tabs open their screens', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  expect(renderer.root.findAllByType(OnboardingScreen)).toHaveLength(0);
  expect(renderer.root.findAllByType(AuthFlow)).toHaveLength(0);
  expect(renderer.root.findAllByType(HomeScreen)).toHaveLength(1);
  const tabs = () =>
    ['Home', 'Salary', 'Attendance', 'Profile'].map(
      label =>
        renderer.root.findAll(
          node =>
            node.props.accessibilityRole === 'tab' &&
            node.props.accessibilityLabel === label &&
            typeof node.props.onPress === 'function',
        )[0],
    );
  expect(tabs().map(tab => tab.props.accessibilityLabel)).toEqual([
    'Home',
    'Salary',
    'Attendance',
    'Profile',
  ]);
  for (const [index, key] of ['salary', 'attendance', 'profile'].entries()) {
    ReactTestRenderer.act(() => tabs()[index + 1].props.onPress());
    expect(tabs()[index + 1].props.accessibilityState.selected).toBe(true);
    const screen = renderer.root
      .findAllByType(View)
      .find(node => node.props.testID === `${key}-screen`);
    expect(screen).toBeDefined();
    expect(screen?.props.children).toBeDefined();
  }
  ReactTestRenderer.act(() => tabs()[0].props.onPress());
  expect(tabs()[0].props.accessibilityState.selected).toBe(true);
  expect(renderer.root.findAllByType(HomeScreen)).toHaveLength(1);
  expect(
    tabs()
      .slice(1)
      .every(tab => !tab.props.accessibilityState.selected),
  ).toBe(true);
  ReactTestRenderer.act(() => renderer.unmount());
});
