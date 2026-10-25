import React, { useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Dimensions,
  Pressable,
  Text,
} from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { TabPager } from '../src/components/TabPager';

afterEach(() => jest.restoreAllMocks());

function StatefulPage() {
  const [count, setCount] = useState(0);
  return (
    <Pressable onPress={() => setCount(value => value + 1)}>
      <Text>{count}</Text>
    </Pressable>
  );
}

function pages(activeIndex: number) {
  return (
    <TabPager activeIndex={activeIndex}>
      <StatefulPage key="home" />
      <Text key="salary">Salary</Text>
      <Text key="attendance">Attendance</Text>
      <Text key="profile">Profile</Text>
    </TabPager>
  );
}

test('slides in both directions, interrupts rapid selections, and retains tab state', async () => {
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(false);
  const animations: { start: jest.Mock; stop: jest.Mock; reset: jest.Mock }[] =
    [];
  const timing = jest.spyOn(Animated, 'timing').mockImplementation(() => {
    const animation = { start: jest.fn(), stop: jest.fn(), reset: jest.fn() };
    animations.push(animation);
    return animation;
  });
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(pages(0));
  });
  act(() =>
    renderer.root
      .findAll(node => typeof node.props.onPress === 'function')[0]
      .props.onPress(),
  );
  act(() => renderer.update(pages(3)));
  const width = Dimensions.get('window').width;
  expect(timing).toHaveBeenLastCalledWith(
    expect.anything(),
    expect.objectContaining({ toValue: -3 * width, useNativeDriver: true }),
  );
  act(() => renderer.update(pages(1)));
  expect(animations[0].stop).toHaveBeenCalled();
  expect(timing).toHaveBeenLastCalledWith(
    expect.anything(),
    expect.objectContaining({ toValue: -width, useNativeDriver: true }),
  );
  expect(
    renderer.root.findAllByProps({
      importantForAccessibility: 'no-hide-descendants',
    }).length,
  ).toBeGreaterThanOrEqual(3);
  act(() => renderer.update(pages(0)));
  expect(
    renderer.root.findByType(StatefulPage).findByType(Text).props.children,
  ).toBe(1);
  act(() => renderer.unmount());
  expect(animations[2].stop).toHaveBeenCalled();
});

test('respects the reduced motion preference when switching tabs', async () => {
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(true);
  const timing = jest.spyOn(Animated, 'timing');
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(pages(0));
  });
  act(() => renderer.update(pages(3)));
  expect(timing).not.toHaveBeenCalled();
  act(() => renderer.unmount());
});
