import React from 'react';
import { AccessibilityInfo, Image } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { OnboardingScreen } from '../src/screens/OnboardingScreen';

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

beforeEach(() => {
  jest.useFakeTimers();
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(false);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

async function renderScreen() {
  const onFinish = jest.fn();
  const onReady = jest.fn();
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(
      <OnboardingScreen onFinish={onFinish} onReady={onReady} />,
    );
  });
  const button = (label: string) =>
    renderer.root.findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    )[0];
  return { renderer, onFinish, onReady, button };
}

test('Next advances once per transition, and Start Now finishes', async () => {
  const { renderer, onFinish, button } = await renderScreen();
  const next = button('Next').props.onPress;
  act(() => {
    next();
    next();
  });
  expect(button('Next').props.disabled).toBe(true);
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: 'Page 2 of 3' }).length,
  ).toBeGreaterThan(0);
  expect(onFinish).not.toHaveBeenCalled();
  act(() => {
    button('Next').props.onPress();
  });
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
  expect(button('Skip onboarding')).toBeUndefined();
  act(() => {
    button('Start Now').props.onPress();
  });
  expect(onFinish).toHaveBeenCalledTimes(1);
  act(() => renderer.unmount());
});

test('Skip finishes immediately from either of the first two pages', async () => {
  const { renderer, onFinish, button } = await renderScreen();
  act(() => {
    button('Skip onboarding').props.onPress();
  });
  expect(onFinish).toHaveBeenCalledTimes(1);
  act(() => {
    button('Next').props.onPress();
  });
  await act(async () => {
    jest.advanceTimersByTime(500);
  });
  act(() => {
    button('Skip onboarding').props.onPress();
  });
  expect(onFinish).toHaveBeenCalledTimes(2);
  act(() => renderer.unmount());
});

test('keeps the native splash until layout and the first illustration are ready', async () => {
  const { renderer, onReady } = await renderScreen();
  act(() => {
    renderer.root.findAllByType(Image)[0].props.onLoad();
  });
  expect(onReady).not.toHaveBeenCalled();
  const pager = renderer.root
    .findAll(node => typeof node.props.onLayout === 'function')
    .find(node => node.props.onMoveShouldSetResponder)!;
  act(() => {
    pager.props.onLayout();
  });
  expect(onReady).toHaveBeenCalledTimes(1);
  act(() => renderer.unmount());
});
