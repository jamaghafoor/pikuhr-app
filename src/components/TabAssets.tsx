import React from 'react';
import {
  Image,
  StyleSheet,
  type ImageResizeMode,
  type ImageStyle,
  type StyleProp,
} from 'react-native';

const assets = {
  chevron: require('../../assets/images/tabs/chevron.png'),
  download: require('../../assets/images/tabs/download.png'),
  walletGreen: require('../../assets/images/tabs/wallet-green.png'),
  walletBlue: require('../../assets/images/tabs/wallet-blue.png'),
  present: require('../../assets/images/tabs/present.png'),
  leave: require('../../assets/images/tabs/leave.png'),
  halfDay: require('../../assets/images/tabs/half-day.png'),
  absent: require('../../assets/images/tabs/absent.png'),
  dropdown: require('../../assets/images/tabs/dropdown.png'),
  pie: require('../../assets/images/tabs/pie.png'),
  paidCheck: require('../../assets/images/tabs/paid-check.png'),
  cardBlue: require('../../assets/images/tabs/card-blue.png'),
  cardWhite: require('../../assets/images/tabs/card-white.png'),
  calculatorWhite: require('../../assets/images/tabs/calculator-white.png'),
  salaryActive: require('../../assets/images/tabs/salary-active.png'),
  calendarWhite: require('../../assets/images/tabs/calendar-white.png'),
  clockWhite: require('../../assets/images/tabs/clock-white.png'),
  fingerprint: require('../../assets/images/tabs/fingerprint.png'),
  locationWhite: require('../../assets/images/tabs/location-white.png'),
  list: require('../../assets/images/tabs/list.png'),
  attendanceActive: require('../../assets/images/tabs/attendance-active.png'),
  monthSelect: require('../../assets/images/tabs/month-select.png'),
  yearSelect: require('../../assets/images/tabs/year-select.png'),
  employeeAvatar: require('../../assets/images/tabs/employee-avatar.png'),
  backButton: require('../../assets/images/tabs/back-button.png'),
  calendarSummary: require('../../assets/images/tabs/calendar-summary.png'),
  calendarPurple: require('../../assets/images/tabs/calendar-purple.png'),
} as const;
export type TabIconName = keyof typeof assets;
export function TabIcon({
  name,
  size = 24,
  width = size,
  height = size,
  style,
  resizeMode = 'contain',
}: {
  name: TabIconName;
  size?: number;
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
}) {
  return (
    <Image
      source={assets[name]}
      style={[styles.image, { width, height }, style]}
      resizeMode={resizeMode}
      fadeDuration={0}
      accessible={false}
    />
  );
}
const styles = StyleSheet.create({ image: { flexShrink: 0 } });
