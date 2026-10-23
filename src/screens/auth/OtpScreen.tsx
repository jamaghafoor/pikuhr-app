import React from 'react';
import { View } from 'react-native';
import {
  AuthButton,
  AuthField,
  AuthLayout,
  AuthLink,
  authTextStyles,
} from './AuthLayout';

export function OtpScreen({
  mobile,
  code,
  error,
  onChangeCode,
  onVerify,
  onBack,
  onReady,
}: {
  mobile: string;
  code: string;
  error?: string;
  onChangeCode: (value: string) => void;
  onVerify: () => void;
  onBack: () => void;
  onReady: () => void;
}) {
  const suffix = mobile.replace(/\D/g, '').slice(-3) || mobile.slice(-3);
  return (
    <AuthLayout
      title="OTP"
      onBack={onBack}
      onReady={onReady}
      description={`Please enter the 6-digit OTP sent to your mobile number XXX-${suffix}.`}
    >
      <AuthField
        label="OTP"
        value={code}
        onChangeText={onChangeCode}
        keyboardType="number-pad"
        maxLength={6}
        autoComplete="sms-otp"
        textContentType="oneTimeCode"
        returnKeyType="done"
        onSubmitEditing={onVerify}
        error={error}
        otp
      />
      <AuthButton label="Verify" onPress={onVerify} verification />
      <View style={authTextStyles.changeNumber}>
        <AuthLink label="Change Mobile Number" onPress={onBack} />
      </View>
    </AuthLayout>
  );
}
