import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler, Keyboard } from 'react-native';
import { OtpScreen } from './OtpScreen';
import { SignInScreen } from './SignInScreen';
import { SignUpScreen } from './SignUpScreen';
import { ScreenTransition } from '../../components/ScreenTransition';
import {
  ShopkeeperDetailsScreen,
  type ShopkeeperDetails,
} from './ShopkeeperDetailsScreen';

type MobileScreen = 'signIn' | 'signUp';
type Screen = MobileScreen | 'otp' | 'details';

export function AuthFlow({ onComplete }: { onComplete: () => void }) {
  const [screen, setScreen] = useState<Screen>('signIn');
  const [direction, setDirection] = useState<1 | -1>(1);
  const [origin, setOrigin] = useState<MobileScreen>('signIn');
  const [numbers, setNumbers] = useState({ signIn: '', signUp: '' });
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [details, setDetails] = useState<ShopkeeperDetails>({
    shopkeeperName: '',
    shopName: '',
    state: '',
    city: '',
  });

  const navigate = useCallback((next: Screen, slideDirection: 1 | -1 = 1) => {
    Keyboard.dismiss();
    setError(undefined);
    setScreen(next);
    setDirection(slideDirection);
  }, []);

  const goBack = useCallback(() => {
    if (screen === 'details') {
      navigate('otp', -1);
      return true;
    }
    if (screen === 'otp') {
      navigate(origin, -1);
      return true;
    }
    if (screen === 'signUp') {
      navigate('signIn', -1);
      return true;
    }
    return false;
  }, [navigate, origin, screen]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      goBack,
    );
    return () => subscription.remove();
  }, [goBack]);

  const sendOtp = () => {
    if (screen !== 'signIn' && screen !== 'signUp') {
      return;
    }
    if (!numbers[screen].trim()) {
      setError('Enter a mobile number.');
      return;
    }
    // Demo only: accept any nonempty number and do not send an SMS.
    setOrigin(screen);
    setCode('');
    navigate('otp');
  };

  const verify = () => {
    if (!/^\d{6}$/.test(code)) {
      setError('Enter a 6-digit code.');
      return;
    }
    Keyboard.dismiss();
    navigate('details');
  };

  let content;
  if (screen === 'details') {
    content = (
      <ShopkeeperDetailsScreen
        values={details}
        onChange={setDetails}
        onBack={goBack}
        onComplete={onComplete}
      />
    );
  } else if (screen === 'otp') {
    content = (
      <OtpScreen
        mobile={numbers[origin].trim()}
        code={code}
        error={error}
        onChangeCode={value => {
          setCode(value.replace(/\D/g, '').slice(0, 6));
          setError(undefined);
        }}
        onVerify={verify}
        onBack={goBack}
      />
    );
  } else {
    const MobileForm = screen === 'signIn' ? SignInScreen : SignUpScreen;
    content = (
      <MobileForm
        mobile={numbers[screen]}
        error={error}
        onChangeMobile={value => {
          setNumbers(previous => ({ ...previous, [screen]: value }));
          setError(undefined);
        }}
        onSend={sendOtp}
        onSwitch={() =>
          navigate(
            screen === 'signIn' ? 'signUp' : 'signIn',
            screen === 'signIn' ? 1 : -1,
          )
        }
      />
    );
  }
  return (
    <ScreenTransition screenKey={screen} direction={direction}>
      {content}
    </ScreenTransition>
  );
}
