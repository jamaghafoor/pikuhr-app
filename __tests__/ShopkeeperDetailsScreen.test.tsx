import React, { useState } from 'react';
import { Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import {
  ShopkeeperDetailsScreen,
  type ShopkeeperDetails,
} from '../src/screens/auth/ShopkeeperDetailsScreen';

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

async function setup(initial?: Partial<ShopkeeperDetails>) {
  const complete = jest.fn();
  function Form() {
    const [values, setValues] = useState<ShopkeeperDetails>({
      shopkeeperName: '',
      shopName: '',
      state: '',
      city: '',
      ...initial,
    });
    return (
      <ShopkeeperDetailsScreen
        values={values}
        onChange={setValues}
        onComplete={complete}
        onBack={jest.fn()}
      />
    );
  }
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(<Form />);
  });
  const action = (label: string) =>
    renderer.root.findAll(
      node =>
        node.props.accessibilityLabel === label &&
        typeof node.props.onPress === 'function',
    )[0];
  const tap = (label: string) => act(() => action(label).props.onPress());
  const enter = (label: string, value: string) =>
    act(() =>
      renderer.root
        .findAll(
          node =>
            node.props.accessibilityLabel === label &&
            typeof node.props.onChangeText === 'function',
        )[0]
        .props.onChangeText(value),
    );
  const values = () =>
    renderer.root.findByType(ShopkeeperDetailsScreen).props
      .values as ShopkeeperDetails;
  return { renderer, complete, action, tap, enter, values };
}

test('requires both names, state, and city before continuing', async () => {
  const { renderer, complete, action, tap, enter } = await setup();
  expect(action('City').props.disabled).toBe(true);
  enter('Shopkeeper Name', '   ');
  tap('Next');
  expect(complete).not.toHaveBeenCalled();
  const errors = renderer.root
    .findAllByType(Text)
    .map(node => node.props.children);
  expect(errors).toEqual(
    expect.arrayContaining([
      'Enter the shopkeeper name.',
      'Enter the shop name.',
      'Select a state.',
      'Select a city.',
    ]),
  );
  enter('Shopkeeper Name', 'Asha Sharma');
  enter('Shop Name', 'Asha Store');
  tap('State');
  tap('Karnataka');
  expect(action('City').props.disabled).toBe(false);
  tap('Next');
  expect(complete).not.toHaveBeenCalled();
  tap('City');
  tap('Bengaluru');
  tap('Next');
  expect(complete).toHaveBeenCalledTimes(1);
  act(() => renderer.unmount());
});

test('changing state clears the previous city and shows only matching cities', async () => {
  const { renderer, complete, tap, values } = await setup({
    shopkeeperName: 'Demo',
    shopName: 'Demo Store',
    state: 'Maharashtra',
    city: 'Pune',
  });
  tap('State');
  tap('Gujarat');
  expect(values().state).toBe('Gujarat');
  expect(values().city).toBe('');
  tap('Next');
  expect(complete).not.toHaveBeenCalled();
  tap('City');
  expect(
    renderer.root.findAllByProps({ accessibilityLabel: 'Pune' }),
  ).toHaveLength(0);
  tap('Surat');
  expect(values().city).toBe('Surat');
  tap('Next');
  expect(complete).toHaveBeenCalledTimes(1);
  act(() => renderer.unmount());
});

test('rejects a city that does not belong to the selected state', async () => {
  const { renderer, complete, tap } = await setup({
    shopkeeperName: 'Demo',
    shopName: 'Demo Store',
    state: 'Gujarat',
    city: 'Pune',
  });
  tap('Next');
  expect(complete).not.toHaveBeenCalled();
  act(() => renderer.unmount());
});
