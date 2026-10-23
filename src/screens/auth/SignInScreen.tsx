import React from 'react';
import { Text } from 'react-native';
import {
  AuthButton,
  AuthField,
  AuthLayout,
  AuthLink,
  authTextStyles,
} from './AuthLayout';

export type MobileFormProps = {
  mobile: string;
  error?: string;
  onChangeMobile: (value: string) => void;
  onSend: () => void;
  onSwitch: () => void;
  onReady: () => void;
};

export function SignInScreen({
  mobile,
  error,
  onChangeMobile,
  onSend,
  onSwitch,
  onReady,
}: MobileFormProps) {
  return (
    <AuthLayout
      title="Sign In"
      onReady={onReady}
      description="Please enter your registered mobile number, and we will send an OTP to your phone."
      footer={
        <Text style={authTextStyles.footer}>
          Are you a shopkeeper? <AuthLink label="Sign Up" onPress={onSwitch} />
        </Text>
      }
    >
      <AuthField
        label="Mobile Number"
        placeholder="Mobile Number"
        value={mobile}
        onChangeText={onChangeMobile}
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        returnKeyType="done"
        onSubmitEditing={onSend}
        error={error}
      />
      <AuthButton label="Send OTP" onPress={onSend} />
    </AuthLayout>
  );
}
