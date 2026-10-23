/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
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

test('onboarding opens authentication, and completed setup opens Home', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  ReactTestRenderer.act(() =>
    renderer.root.findByType(OnboardingScreen).props.onFinish(),
  );
  expect(renderer.root.findAllByType(HomeScreen)).toHaveLength(0);
  ReactTestRenderer.act(() =>
    renderer.root.findByType(AuthFlow).props.onComplete(),
  );
  expect(renderer.root.findAllByType(HomeScreen)).toHaveLength(1);
  ReactTestRenderer.act(() => renderer.unmount());
});
