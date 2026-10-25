import React from 'react';
import { Image, type ImageStyle, type StyleProp } from 'react-native';

// Original Figma assets from frame 1401:4. The PNG copies of the SVGs are
// rasterized at 3x, preserving the artwork without a new native dependency.
export const homeAssets = {
  avatar: require('../../assets/images/home/ellipse3.png'),
  ring: require('../../assets/images/home/ellipse2.png'),
  notification: require('../../assets/images/home/group43.png'),
  home: require('../../assets/images/home/vector.png'),
  salary: require('../../assets/images/home/vector1.png'),
  attendance: require('../../assets/images/home/group.png'),
  profile: require('../../assets/images/home/group44.png'),
  check: require('../../assets/images/home/akar-icons-circle-check-fill.png'),
  checkIn: require('../../assets/images/home/majesticons-login.png'),
  checkOut: require('../../assets/images/home/majesticons-login1.png'),
  qr: require('../../assets/images/home/boxicons-qr-scan-filled.png'),
  calendarWhite: require('../../assets/images/home/boxicons-calendar-alt-filled.png'),
  advance: require('../../assets/images/home/group1.png'),
  calculator: require('../../assets/images/home/fa6-solid-calculator.png'),
  arrow: require('../../assets/images/home/boxicons-arrow-big-down-filled.png'),
  chart: require('../../assets/images/home/bi-bar-chart-fill.png'),
  calendar: require('../../assets/images/home/boxicons-calendar-alt-filled1.png'),
  wallet: require('../../assets/images/home/f7-wallet-fill.png'),
  clock: require('../../assets/images/home/ant-design-clock-circle-filled.png'),
} as const;

export function HomeIcon({
  name,
  width,
  height = width,
  style,
}: {
  name: keyof typeof homeAssets;
  width: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={homeAssets[name]}
      style={[{ width, height }, style]}
      resizeMode="contain"
      fadeDuration={0}
      accessible={false}
    />
  );
}
