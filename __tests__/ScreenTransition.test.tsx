import React from 'react';
import { AccessibilityInfo, Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { ScreenTransition } from '../src/components/ScreenTransition';

beforeEach(() => {
  jest.useFakeTimers();
});
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('slides between screens, removes the outgoing view, and supports going back', async () => {
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(false);
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(
      <ScreenTransition screenKey="first">
        <Text>First</Text>
      </ScreenTransition>,
    );
  });
  act(() => {
    renderer.update(
      <ScreenTransition screenKey="second">
        <Text>Second</Text>
      </ScreenTransition>,
    );
  });
  expect(
    renderer.root.findAllByType(Text).map(node => node.props.children),
  ).toEqual(['First', 'Second']);
  expect(
    renderer.root.findAllByProps({
      importantForAccessibility: 'no-hide-descendants',
    }).length,
  ).toBeGreaterThan(0);
  await act(async () => {
    jest.advanceTimersByTime(300);
  });
  expect(
    renderer.root.findAllByType(Text).map(node => node.props.children),
  ).toEqual(['Second']);
  act(() => {
    renderer.update(
      <ScreenTransition screenKey="first" direction={-1}>
        <Text>First</Text>
      </ScreenTransition>,
    );
  });
  await act(async () => {
    jest.advanceTimersByTime(300);
  });
  expect(
    renderer.root.findAllByType(Text).map(node => node.props.children),
  ).toEqual(['First']);
  act(() => renderer.unmount());
});

test('switches immediately when reduced motion is enabled', async () => {
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(true);
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(
      <ScreenTransition screenKey="first">
        <Text>First</Text>
      </ScreenTransition>,
    );
  });
  act(() => {
    renderer.update(
      <ScreenTransition screenKey="second">
        <Text>Second</Text>
      </ScreenTransition>,
    );
  });
  expect(
    renderer.root.findAllByType(Text).map(node => node.props.children),
  ).toEqual(['Second']);
  act(() => renderer.unmount());
});
