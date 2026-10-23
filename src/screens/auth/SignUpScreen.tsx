import React from 'react';
import { Text } from 'react-native';
import {
  AuthButton,
  AuthField,
  AuthLayout,
  AuthLink,
  authTextStyles,
} from './AuthLayout';
import type { MobileFormProps } from './SignInScreen';

export function SignUpScreen({
  mobile,
  error,
  onChangeMobile,
  onSend,
  onSwitch,
}: MobileFormProps) {
  return (
    <AuthLayout
      title="Sign Up"
      onBack={onSwitch}
      description="Please enter your mobile number for registration. We will send an OTP to that number for verification."
      footer={
        <Text style={authTextStyles.footer}>
          Already registered? <AuthLink label="Sign In" onPress={onSwitch} />
        </Text>
      }
    >
      <AuthField
        label="Mobile Number"
        placeholder="Enter Mobile Number"
        value={mobile}
        onChangeText={onChangeMobile}
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        returnKeyType="done"
        onSubmitEditing={onSend}
        error={error}
      />
      <AuthButton label="Send OTP" onPress={onSend} registration />
    </AuthLayout>
  );
}
