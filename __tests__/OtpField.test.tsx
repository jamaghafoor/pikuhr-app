import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { AuthField } from '../src/screens/auth/AuthLayout';

function Field() {
  const [value, setValue] = useState('');
  return (
    <AuthField
      label="OTP"
      otp
      value={value}
      onChangeText={setValue}
      maxLength={6}
    />
  );
}

test('OTP fills from the first slot, replaces its lines, and highlights the next position', async () => {
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(<Field />);
  });
  const input = () =>
    renderer.root.findAll(
      node =>
        node.props.accessibilityLabel === '6-digit OTP' &&
        typeof node.props.onChangeText === 'function',
    )[0];
  const find = (testID: string) => renderer.root.findAllByProps({ testID })[0];
  const lineColor = (index: number) =>
    StyleSheet.flatten(find(`otp-line-${index}`).props.style).backgroundColor;
  const slotText = (index: number) =>
    find(`otp-slot-${index}`)
      .findAllByType(Text)
      .map(node => node.props.children)
      .join('');
  const enter = (value: string) => act(() => input().props.onChangeText(value));

  expect(lineColor(0)).toBe('#408BF0');
  expect(lineColor(1)).toBe('#B8B8B8');
  enter('12');
  expect(slotText(0)).toBe('1');
  expect(slotText(1)).toBe('2');
  expect(find('otp-line-0')).toBeUndefined();
  expect(find('otp-line-1')).toBeUndefined();
  expect(lineColor(2)).toBe('#408BF0');
  expect(lineColor(3)).toBe('#B8B8B8');
  expect(input().props.caretHidden).toBe(true);
  expect(input().props.selection).toEqual({ start: 2, end: 2 });

  enter('1');
  expect(slotText(0)).toBe('1');
  expect(lineColor(1)).toBe('#408BF0');
  expect(lineColor(2)).toBe('#B8B8B8');

  enter('654321');
  expect(
    Array.from({ length: 6 }, (_, index) => slotText(index)).join(''),
  ).toBe('654321');
  expect(
    renderer.root.findAll(
      node =>
        typeof node.props.testID === 'string' &&
        node.props.testID.startsWith('otp-line-'),
    ),
  ).toHaveLength(0);
  enter('');
  expect(lineColor(0)).toBe('#408BF0');
  act(() => renderer.unmount());
});
