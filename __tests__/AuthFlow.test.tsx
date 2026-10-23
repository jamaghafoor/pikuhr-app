import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AuthFlow } from '../src/screens/auth/AuthFlow';
import { SignInScreen } from '../src/screens/auth/SignInScreen';
import { SignUpScreen } from '../src/screens/auth/SignUpScreen';
import { OtpScreen } from '../src/screens/auth/OtpScreen';
import { ShopkeeperDetailsScreen } from '../src/screens/auth/ShopkeeperDetailsScreen';

jest.mock('../src/components/ScreenTransition', () => ({
  ScreenTransition: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

async function setup() {
  const complete = jest.fn();
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(<AuthFlow onComplete={complete} />);
  });
  const action = (label: string) =>
    renderer.root.findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    )[0];
  const field = (label: string) =>
    renderer.root.findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onChangeText === 'function',
    )[0];
  const tap = (label: string) => act(() => action(label).props.onPress());
  const enter = (label: string, value: string) =>
    act(() => field(label).props.onChangeText(value));
  return { renderer, complete, tap, enter };
}

test('a verified dummy OTP opens required details before completing the flow', async () => {
  const { renderer, complete, tap, enter } = await setup();
  tap('Send OTP');
  expect(renderer.root.findByType(SignInScreen).props.error).toBe(
    'Enter a mobile number.',
  );
  enter('Mobile Number', '123');
  tap('Send OTP');
  expect(renderer.root.findByType(OtpScreen).props.mobile).toBe('123');
  enter('6-digit OTP', '000000');
  tap('Verify');
  expect(complete).not.toHaveBeenCalled();
  expect(renderer.root.findAllByType(ShopkeeperDetailsScreen)).toHaveLength(1);
  enter('Shopkeeper Name', 'Asha Sharma');
  enter('Shop Name', 'Asha Store');
  tap('State');
  tap('Maharashtra');
  tap('City');
  tap('Pune');
  tap('Next');
  expect(complete).toHaveBeenCalledTimes(1);
  act(() => renderer.unmount());
});

test('sign-up OTP returns to sign up and preserves the number', async () => {
  const { renderer, tap, enter } = await setup();
  tap('Sign Up');
  enter('Mobile Number', '03001234987');
  tap('Send OTP');
  enter('6-digit OTP', '123');
  tap('Change Mobile Number');
  expect(renderer.root.findByType(SignUpScreen).props.mobile).toBe(
    '03001234987',
  );
  enter('Mobile Number', '555');
  tap('Send OTP');
  expect(renderer.root.findByType(OtpScreen).props.code).toBe('');
  expect(renderer.root.findByType(OtpScreen).props.mobile).toBe('555');
  tap('Go back');
  tap('Sign In');
  expect(renderer.root.findAllByType(SignInScreen)).toHaveLength(1);
  act(() => renderer.unmount());
});

test('verification rejects incomplete codes and supports pasting six digits', async () => {
  const { renderer, complete, tap, enter } = await setup();
  enter('Mobile Number', '0000');
  tap('Send OTP');
  enter('6-digit OTP', '12abc');
  tap('Verify');
  expect(complete).not.toHaveBeenCalled();
  expect(renderer.root.findByType(OtpScreen).props.error).toBe(
    'Enter a 6-digit code.',
  );
  enter('6-digit OTP', '654321');
  expect(renderer.root.findByType(OtpScreen).props.code).toBe('654321');
  tap('Verify');
  expect(complete).not.toHaveBeenCalled();
  expect(renderer.root.findAllByType(ShopkeeperDetailsScreen)).toHaveLength(1);
  enter('Shop Name', 'Demo Shop');
  tap('Go back');
  expect(renderer.root.findAllByType(OtpScreen)).toHaveLength(1);
  tap('Verify');
  expect(
    renderer.root.findByType(ShopkeeperDetailsScreen).props.values.shopName,
  ).toBe('Demo Shop');
  act(() => renderer.unmount());
});
