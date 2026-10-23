import React, { type ComponentRef, useRef, useState } from 'react';
import {
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { citiesForState, INDIAN_STATES } from '../../data/indianLocations';
import { AuthButton, AuthField, AuthLayout, AuthSelect } from './AuthLayout';

export type ShopkeeperDetails = {
  shopkeeperName: string;
  shopName: string;
  state: string;
  city: string;
};
type Errors = Partial<Record<keyof ShopkeeperDetails, string>>;

export function ShopkeeperDetailsScreen({
  values,
  onChange,
  onBack,
  onComplete,
  onReady,
}: {
  values: ShopkeeperDetails;
  onChange: (values: ShopkeeperDetails) => void;
  onBack: () => void;
  onComplete: () => void;
  onReady: () => void;
}) {
  const { width } = useWindowDimensions();
  const scale = Math.min(width / 375, 1.2);
  const insets = useSafeAreaInsets();
  const shopNameRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [picker, setPicker] = useState<'state' | 'city' | null>(null);
  const cities = citiesForState(values.state);
  const update = (field: keyof ShopkeeperDetails, value: string) => {
    onChange({
      ...values,
      [field]: value,
      ...(field === 'state' && value !== values.state ? { city: '' } : {}),
    });
    setErrors(previous => ({
      ...previous,
      [field]: undefined,
      ...(field === 'state' ? { city: undefined } : {}),
    }));
  };
  const openPicker = (field: 'state' | 'city') => {
    Keyboard.dismiss();
    setPicker(field);
  };
  const next = () => {
    const nextErrors: Errors = {};
    if (!values.shopkeeperName.trim()) {
      nextErrors.shopkeeperName = 'Enter the shopkeeper name.';
    }
    if (!values.shopName.trim()) {
      nextErrors.shopName = 'Enter the shop name.';
    }
    if (!cities.length) {
      nextErrors.state = 'Select a state.';
    }
    if (!values.city || !cities.includes(values.city)) {
      nextErrors.city = 'Select a city.';
    }
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) {
      Keyboard.dismiss();
      onComplete();
    }
  };

  return (
    <>
      <AuthLayout
        title="Shopkeeper Details"
        compact
        onBack={onBack}
        onReady={onReady}
      >
        <View style={{ gap: 14 * scale }}>
          <AuthField
            label="Shopkeeper Name"
            placeholder="Enter Shopkeeper Name"
            value={values.shopkeeperName}
            onChangeText={value => update('shopkeeperName', value)}
            error={errors.shopkeeperName}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            onSubmitEditing={() => shopNameRef.current?.focus()}
          />
          <AuthField
            label="Shop Name"
            placeholder="Enter Shop Name"
            value={values.shopName}
            inputRef={shopNameRef}
            onChangeText={value => update('shopName', value)}
            error={errors.shopName}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />
          <AuthSelect
            label="State"
            placeholder="Select State"
            value={values.state}
            error={errors.state}
            onPress={() => openPicker('state')}
          />
          <AuthSelect
            label="City"
            placeholder={values.state ? 'Select City' : 'Select State First'}
            value={values.city}
            disabled={!cities.length}
            error={errors.city}
            onPress={() => openPicker('city')}
          />
        </View>
        <AuthButton label="Next" onPress={next} spacing={40} />
        <View style={{ height: insets.bottom + 24 * scale }} />
      </AuthLayout>
      {picker && (
        <Modal
          visible
          transparent
          animationType="none"
          onRequestClose={() => setPicker(null)}
          statusBarTranslucent
          navigationBarTranslucent
        >
          <View style={styles.modal}>
            <Pressable
              style={styles.backdrop}
              accessibilityRole="button"
              accessibilityLabel="Close selector"
              onPress={() => setPicker(null)}
            />
            <View
              style={[
                styles.sheet,
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
              accessibilityViewIsModal
            >
              <View style={styles.sheetHeading}>
                <Text accessibilityRole="header" style={styles.sheetTitle}>
                  {picker === 'state' ? 'Select State' : 'Select City'}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Close selector"
                  onPress={() => setPicker(null)}
                  style={styles.close}
                >
                  <Text style={styles.closeLabel}>×</Text>
                </Pressable>
              </View>
              <FlatList
                data={picker === 'state' ? INDIAN_STATES : cities}
                keyExtractor={item => item}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={item}
                    accessibilityState={{ selected: values[picker] === item }}
                    onPress={() => {
                      update(picker, item);
                      setPicker(null);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      pressed && styles.optionPressed,
                    ]}
                  >
                    <Text style={styles.optionLabel}>{item}</Text>
                    {values[picker] === item && (
                      <Text accessible={false} style={styles.check}>
                        ✓
                      </Text>
                    )}
                  </Pressable>
                )}
              />
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  modal: { flex: 1, justifyContent: 'flex-end' },
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: '#FEFDFD',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    maxHeight: '80%',
  },
  sheetHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 6,
  },
  sheetTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#080808',
  },
  close: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeLabel: { fontSize: 30, color: '#595959' },
  option: {
    minHeight: 52,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E6E6E6',
  },
  optionPressed: { backgroundColor: '#EDF5FF' },
  optionLabel: { fontFamily: 'Poppins-Medium', fontSize: 16, color: '#242424' },
  check: { fontSize: 20, color: '#408BF0' },
});
