import React, { type ReactNode, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeIcon, type homeAssets } from '../components/HomeAssets';
import { DEFAULT_EMPLOYEE, type Employee } from '../data/demo';

type IconName = keyof typeof homeAssets;

function useHomeStyles() {
  const { width } = useWindowDimensions();
  const scale = Math.min(width / 375, 1.5);
  const styles = useMemo(() => createStyles(scale), [scale]);
  return { scale, styles };
}

function Badge({
  children,
  warm = false,
}: {
  children: ReactNode;
  warm?: boolean;
}) {
  const { styles } = useHomeStyles();
  return (
    <View style={[styles.badge, warm && styles.warmBadge]}>
      <Text style={[styles.badgeLabel, warm && styles.warmLabel]}>
        {children}
      </Text>
    </View>
  );
}

function Metric({
  label,
  value,
  icon,
  backgroundColor,
  danger = false,
  flipped = false,
  iconWidth = 24,
}: {
  label: string;
  value: string;
  icon: IconName;
  backgroundColor: string;
  danger?: boolean;
  flipped?: boolean;
  iconWidth?: number;
}) {
  const { scale, styles } = useHomeStyles();
  return (
    <View style={[styles.metric, { backgroundColor }]}>
      <View style={styles.metricIcon}>
        <HomeIcon
          name={icon}
          width={iconWidth * scale}
          height={24 * scale}
          style={flipped && styles.flipped}
        />
      </View>
      <View style={styles.metricCopy}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={[styles.metricValue, danger && styles.danger]}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function CardHeading({
  icon,
  title,
  children,
}: {
  icon: IconName;
  title: string;
  children: ReactNode;
}) {
  const { scale, styles } = useHomeStyles();
  return (
    <View style={styles.cardHeading}>
      <View style={styles.circle}>
        <HomeIcon
          name={icon}
          width={(icon === 'advance' ? 10.667 : 16) * scale}
          height={(icon === 'advance' ? 14.667 : 16) * scale}
        />
      </View>
      <Text accessibilityRole="header" style={styles.cardTitle}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export function HomeScreen({
  onOpenSalary,
  onOpenProfile,
  employee = DEFAULT_EMPLOYEE,
}: {
  onOpenSalary?: () => void;
  onOpenProfile?: () => void;
  employee?: Employee;
}) {
  const { scale, styles } = useHomeStyles();
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.screen} testID="home-screen">
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <HomeIcon name="ring" width={283 * scale} style={styles.leftRing} />
          <HomeIcon name="ring" width={283 * scale} style={styles.rightRing} />
        </View>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open profile"
            onPress={onOpenProfile}
            hitSlop={6}
          >
            <HomeIcon name="avatar" width={42 * scale} />
          </Pressable>
          <View style={styles.greeting}>
            <Text style={styles.hello}>Hello, {employee.name}</Text>
            <Text accessibilityRole="header" style={styles.store}>
              {employee.store}
            </Text>
          </View>
          <View
            accessible
            accessibilityLabel="Notifications"
            style={styles.notification}
          >
            <HomeIcon
              name="notification"
              width={20.768 * scale}
              height={27 * scale}
            />
          </View>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.today}>
          <View style={styles.todayHeading}>
            <HomeIcon name="calendarWhite" width={24 * scale} />
            <Text accessibilityRole="header" style={styles.todayTitle}>
              Today's Attendance
            </Text>
            <Badge>07 Oct 2026</Badge>
          </View>
          <View style={styles.todayBody}>
            <View style={styles.status}>
              <HomeIcon name="check" width={24 * scale} />
              <View>
                <Text style={styles.present}>Present</Text>
                <Text style={styles.halfDay}>Half-Day</Text>
              </View>
            </View>
            <View style={[styles.metricRow, styles.todayMetrics]}>
              <Metric
                label="Check-in"
                value="10:00AM"
                icon="checkIn"
                backgroundColor="#EBFFEB"
              />
              <Metric
                label="Check-out"
                value="03:00PM"
                icon="checkOut"
                backgroundColor="#EDF6FF"
                flipped
              />
            </View>
            <View
              accessibilityState={{ disabled: true }}
              style={styles.completed}
            >
              <HomeIcon name="qr" width={21 * scale} />
              <Text style={styles.completedLabel}>Attendance Completed</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.monthCard]}>
          <CardHeading icon="chart" title="This Month Attendance">
            <Badge>Oct 2026</Badge>
          </CardHeading>
          <View style={styles.metricRow}>
            <Metric
              label="Present"
              value="20 Days"
              icon="calendar"
              backgroundColor="#EDF9FE"
            />
            <Metric
              label="Earned Salary"
              value="₹10,000"
              icon="wallet"
              backgroundColor="#F4F3FE"
              flipped
            />
          </View>
          <Text style={styles.cardFooter}>Monthly Salary ₹15,000</Text>
        </View>

        <View style={[styles.card, styles.advanceCard]}>
          <CardHeading icon="advance" title="Advance">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View advance details"
              onPress={onOpenSalary}
              hitSlop={6}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <Badge warm>View Details</Badge>
            </Pressable>
          </CardHeading>
          <View style={styles.metricRow}>
            <Metric
              label="Outstanding"
              value="₹5,000"
              icon="calculator"
              iconWidth={18}
              backgroundColor="#FEEDED"
              danger
            />
            <Metric
              label="Monthly EMI"
              value="₹1,000"
              icon="arrow"
              backgroundColor="#FEF9F0"
              flipped
            />
          </View>
        </View>

        <View style={[styles.card, styles.lastDayCard]}>
          <CardHeading icon="clock" title="Last Working Day">
            <Badge>09 Oct 2026</Badge>
          </CardHeading>
          <View style={styles.metricRow}>
            <Metric
              label="Check-in"
              value="09:00AM"
              icon="checkIn"
              backgroundColor="#EBFFEB"
            />
            <Metric
              label="Check-out"
              value="06:00"
              icon="checkOut"
              backgroundColor="#EDF6FF"
              flipped
            />
          </View>
          <Text style={styles.cardFooter}>Total Working Hours 09 Hours</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(s: number) {
  const medium = { fontFamily: 'Poppins-Medium', includeFontPadding: false };
  const semibold = {
    fontFamily: 'Poppins-SemiBold',
    includeFontPadding: false,
  };
  const small = { fontSize: 12 * s, lineHeight: 20 * s };
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F5F5F5' },
    header: {
      overflow: 'hidden',
      borderBottomLeftRadius: 30 * s,
      borderBottomRightRadius: 30 * s,
      backgroundColor: '#4D8BD8',
      backgroundImage: 'linear-gradient(180deg, #4D8BD8 0%, #52D5DA 99.687%)',
    },
    leftRing: { position: 'absolute', left: -109 * s, top: -145 * s },
    rightRing: { position: 'absolute', right: -207 * s, top: 13 * s },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 74 * s,
      paddingHorizontal: 15 * s,
      paddingBottom: 12 * s,
    },
    greeting: { flex: 1, marginLeft: 14 * s },
    hello: { ...semibold, ...small, lineHeight: 16 * s, color: '#FFFFFF' },
    store: {
      ...semibold,
      color: '#FFFFFF',
      fontSize: 20 * s,
      lineHeight: 30 * s,
    },
    notification: { marginRight: 13 * s },
    scrollContent: {
      paddingHorizontal: 15 * s,
      paddingTop: 16 * s,
      paddingBottom: 18 * s,
    },
    today: {
      borderRadius: 10 * s,
      backgroundColor: '#4C8AD7',
      backgroundImage: 'linear-gradient(90deg, #4C8AD7 0%, #53D7DA 99.687%)',
    },
    todayHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 50 * s,
      paddingLeft: 13 * s,
      paddingRight: 11 * s,
    },
    todayTitle: {
      ...semibold,
      color: '#FFFFFF',
      flex: 1,
      fontSize: 14 * s,
      lineHeight: 20 * s,
      marginLeft: 7 * s,
    },
    todayBody: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#DDDDDD',
      borderRadius: 10 * s,
      paddingTop: 11 * s,
      paddingBottom: 19 * s,
    },
    status: {
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F5F5F5',
      width: 206 * s,
      minHeight: 49 * s,
      borderRadius: 4 * s,
      gap: 13 * s,
    },
    present: {
      ...semibold,
      color: '#0548A0',
      fontSize: 14 * s,
      lineHeight: 20 * s,
    },
    halfDay: { ...medium, ...small, color: '#F97C00' },
    metricRow: { flexDirection: 'row', gap: 17 * s, marginHorizontal: 15 * s },
    todayMetrics: { marginTop: 11 * s },
    metric: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 62 * s,
      borderRadius: 4 * s,
      paddingVertical: 10 * s,
      paddingLeft: 9 * s,
      paddingRight: 4 * s,
    },
    metricIcon: { width: 34 * s },
    metricCopy: { flex: 1 },
    metricLabel: { ...medium, ...small, color: '#555555' },
    metricValue: {
      ...semibold,
      color: '#000000',
      fontSize: 18 * s,
      lineHeight: 20 * s,
      marginTop: 2 * s,
    },
    danger: { color: '#E00000' },
    flipped: { transform: [{ scaleX: -1 }] },
    completed: {
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#4287E8',
      backgroundImage: 'linear-gradient(90deg, #4287E8 0%, #27E6E6 99.687%)',
      opacity: 0.3,
      minHeight: 33 * s,
      borderRadius: 100 * s,
      gap: 10 * s,
      paddingHorizontal: 18 * s,
      marginTop: 19 * s,
      transform: [{ translateX: -7.5 * s }],
    },
    completedLabel: {
      ...medium,
      color: '#FFFFFF',
      fontSize: 14 * s,
      lineHeight: 21 * s,
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#DDDDDD',
      borderRadius: 10 * s,
    },
    monthCard: { marginTop: 15 * s },
    advanceCard: { marginTop: -9 * s, paddingBottom: 22 * s },
    lastDayCard: { marginTop: 39 * s },
    cardHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 63 * s,
      paddingHorizontal: 15 * s,
      paddingBottom: 4 * s,
    },
    circle: {
      backgroundColor: '#4C8CD7',
      alignItems: 'center',
      justifyContent: 'center',
      width: 33 * s,
      height: 33 * s,
      borderRadius: 40 * s,
    },
    cardTitle: {
      ...semibold,
      color: '#000000',
      flex: 1,
      fontSize: 14 * s,
      lineHeight: 20 * s,
      marginLeft: 5 * s,
    },
    badge: {
      backgroundColor: '#EBEFFD',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 29 * s,
      borderRadius: 40 * s,
      paddingHorizontal: 10 * s,
    },
    badgeLabel: { ...medium, ...small, color: '#000000' },
    warmBadge: { backgroundColor: '#FEF9F0' },
    warmLabel: { color: '#F08006' },
    cardFooter: {
      ...medium,
      ...small,
      color: '#555555',
      textAlign: 'center',
      marginTop: 12 * s,
      marginBottom: 14 * s,
    },
    pressed: { opacity: 0.7 },
  });
}
