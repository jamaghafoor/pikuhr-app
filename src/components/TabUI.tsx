import React, { type ReactNode, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeIcon } from './HomeAssets';
import { TabIcon, type TabIconName } from './TabAssets';
import { MONTHS, YEARS, type Employee, type Period } from '../data/demo';

export const colors = {
  blue: '#4C8AD7',
  cyan: '#53D7DA',
  text: '#000000',
  secondary: '#555555',
  border: '#DDDDDD',
  green: '#33A733',
  red: '#EF4849',
};
export function useTabStyles() {
  const { width } = useWindowDimensions();
  const scale = Math.min(width / 375, 1.5);
  const styles = useMemo(() => makeStyles(scale), [scale]);
  return { scale, styles };
}

export function ScreenHeader({
  title,
  onBack,
  action,
  children,
  includeTopInset = true,
}: {
  title: string;
  onBack?: () => void;
  action?: ReactNode;
  children?: ReactNode;
  includeTopInset?: boolean;
}) {
  const { styles, scale } = useTabStyles();
  const insets = useSafeAreaInsets();
  const topInset = includeTopInset ? insets.top : 0;
  return (
    <View style={[styles.header, { paddingTop: topInset }]}>
      <HomeIcon name="ring" width={283 * scale} style={styles.headerRing} />
      <View style={styles.headerRow}>
        {onBack && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={onBack}
            hitSlop={8}
            style={styles.back}
          >
            <TabIcon name="backButton" size={35 * scale} />
          </Pressable>
        )}
        <Text accessibilityRole="header" style={styles.headerTitle}>
          {title}
        </Text>
        {action && <View style={styles.headerAction}>{action}</View>}
      </View>
      {children}
    </View>
  );
}

export function Section({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: TabIconName;
  action?: ReactNode;
  children: ReactNode;
}) {
  const { styles, scale } = useTabStyles();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <View style={styles.sectionIcon}>
          <TabIcon name={icon} size={(icon === 'pie' ? 20 : 24) * scale} />
        </View>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          {title}
        </Text>
        {action}
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export type TileData = {
  label: string;
  value: string;
  icon: TabIconName;
  background: string;
  iconWidth?: number;
  valueSize?: number;
};
export function Tile({
  label,
  value,
  icon,
  background,
  iconWidth = 24,
  valueSize = 18,
}: TileData) {
  const { styles, scale } = useTabStyles();
  return (
    <View style={[styles.tile, { backgroundColor: background }]}>
      <View style={styles.tileIcon}>
        <TabIcon name={icon} width={iconWidth * scale} height={24 * scale} />
      </View>
      <View style={styles.tileCopy}>
        <Text style={styles.tileLabel}>{label}</Text>
        <Text style={[styles.tileValue, { fontSize: valueSize * scale }]}>
          {value}
        </Text>
      </View>
    </View>
  );
}
export function TileGrid({ items }: { items: TileData[] }) {
  const { styles } = useTabStyles();
  return (
    <View style={styles.tileGrid}>
      {Array.from({ length: Math.ceil(items.length / 2) }, (_, index) => (
        <View key={index} style={styles.tileRow}>
          <Tile {...items[index * 2]} />
          {items[index * 2 + 1] ? (
            <Tile {...items[index * 2 + 1]} />
          ) : (
            <View style={styles.tile} />
          )}
        </View>
      ))}
    </View>
  );
}

export function ValueRow({
  label,
  value,
  danger = false,
  last = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
  last?: boolean;
}) {
  const { styles } = useTabStyles();
  return (
    <View style={[styles.valueRow, !last && styles.divider]}>
      <Text style={styles.valueLabel}>{label}</Text>
      <Text style={[styles.valueText, danger && styles.danger]}>{value}</Text>
    </View>
  );
}

export function ActionButton({
  label,
  onPress,
  busy = false,
  disabled = false,
  download = false,
}: {
  label: string;
  onPress: () => void;
  busy?: boolean;
  disabled?: boolean;
  download?: boolean;
}) {
  const { styles, scale } = useTabStyles();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        pressed && styles.pressed,
        (disabled || busy) && styles.disabled,
      ]}
    >
      {busy ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        download && <TabIcon name="download" size={14 * scale} />
      )}
      <Text style={styles.actionLabel}>{busy ? 'Preparing PDF…' : label}</Text>
    </Pressable>
  );
}

export function EmployeeCard({ employee }: { employee: Employee }) {
  const { styles, scale } = useTabStyles();
  return (
    <View style={styles.employeeCard}>
      <View style={styles.employeeAvatarFrame}>
        <TabIcon
          name="employeeAvatar"
          size={83 * scale}
          resizeMode="cover"
          style={styles.employeeAvatar}
        />
      </View>
      <View style={styles.employeeCopy}>
        <Text style={styles.employeeName}>{employee.name}</Text>
        <Text style={styles.employeeMeta}>{employee.employeeId}</Text>
        <Text style={styles.employeeMeta}>{employee.designation}</Text>
        <Text style={styles.employeeMeta}>{employee.store}</Text>
      </View>
    </View>
  );
}

export function SelectionSheet<T extends string | number>({
  title,
  items,
  selected,
  onSelect,
  onClose,
}: {
  title: string;
  items: { label: string; value: T }[];
  selected: T;
  onSelect: (value: T) => void;
  onClose: () => void;
}) {
  const { styles } = useTabStyles();
  const insets = useSafeAreaInsets();
  return (
    <Modal
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={styles.modal}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Close ${title}`}
          onPress={onClose}
          style={styles.backdrop}
        />
        <View
          accessibilityViewIsModal
          style={[styles.sheet, { paddingBottom: Math.max(16, insets.bottom) }]}
        >
          <View style={styles.sheetHeading}>
            <Text accessibilityRole="header" style={styles.sheetTitle}>
              {title}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Close ${title}`}
              onPress={onClose}
              hitSlop={8}
            >
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>
          <FlatList
            data={items}
            keyExtractor={item => String(item.value)}
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={item.label}
                accessibilityState={{ selected: item.value === selected }}
                onPress={() => onSelect(item.value)}
                style={({ pressed }) => [
                  styles.option,
                  item.value === selected && styles.optionSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.optionLabel}>{item.label}</Text>
                {item.value === selected && (
                  <Text style={styles.optionCheck}>✓</Text>
                )}
              </Pressable>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

export function PeriodSelector({
  period,
  onChange,
  calendar = false,
}: {
  period: Period;
  onChange: (period: Period) => void;
  calendar?: boolean;
}) {
  const { styles, scale } = useTabStyles();
  const [picker, setPicker] = useState<'month' | 'year' | null>(null);
  return (
    <>
      <View style={styles.periodControls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Select month"
          accessibilityValue={{ text: MONTHS[period.month] }}
          onPress={() => setPicker('month')}
          style={[styles.periodPill, calendar && styles.calendarMonth]}
        >
          {calendar && (
            <TabIcon
              name="monthSelect"
              width={93 * scale}
              height={39 * scale}
              style={StyleSheet.absoluteFill}
            />
          )}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
            style={[styles.periodLabel, calendar && styles.calendarPeriodLabel]}
          >
            {calendar && MONTHS[period.month].length <= 7
              ? MONTHS[period.month]
              : MONTHS[period.month].slice(0, 3)}
          </Text>
          {!calendar && (
            <TabIcon
              name="dropdown"
              size={12 * scale}
              style={styles.dropdown}
            />
          )}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Select year"
          accessibilityValue={{ text: String(period.year) }}
          onPress={() => setPicker('year')}
          style={[styles.periodPill, calendar && styles.calendarYear]}
        >
          {calendar && (
            <TabIcon
              name="yearSelect"
              width={79 * scale}
              height={39 * scale}
              style={StyleSheet.absoluteFill}
            />
          )}
          <Text
            style={[styles.periodLabel, calendar && styles.calendarPeriodLabel]}
          >
            {period.year}
          </Text>
          {!calendar && (
            <TabIcon
              name="dropdown"
              size={12 * scale}
              style={styles.dropdown}
            />
          )}
        </Pressable>
      </View>
      {picker === 'month' && (
        <SelectionSheet
          title="Select month"
          items={MONTHS.map((label, value) => ({ label, value }))}
          selected={period.month}
          onSelect={month => {
            onChange({ ...period, month });
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
        />
      )}
      {picker === 'year' && (
        <SelectionSheet
          title="Select year"
          items={YEARS.map(value => ({ label: String(value), value }))}
          selected={period.year}
          onSelect={year => {
            onChange({ ...period, year });
            setPicker(null);
          }}
          onClose={() => setPicker(null)}
        />
      )}
    </>
  );
}

export function EmptyNotice({ children }: { children: ReactNode }) {
  const { styles } = useTabStyles();
  return (
    <Text accessibilityLiveRegion="polite" style={styles.emptyNotice}>
      {children}
    </Text>
  );
}

function makeStyles(s: number) {
  const medium = { fontFamily: 'Poppins-Medium', includeFontPadding: false };
  const semi = { fontFamily: 'Poppins-SemiBold', includeFontPadding: false };
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#FFFFFF' },
    content: {
      paddingHorizontal: 15 * s,
      paddingTop: 16 * s,
      paddingBottom: 28 * s,
    },
    header: {
      backgroundColor: '#4D8DD8',
      backgroundImage: 'linear-gradient(180deg, #4D8DD8 0%, #52D1DA 99.687%)',
      borderBottomLeftRadius: 30 * s,
      borderBottomRightRadius: 30 * s,
      overflow: 'hidden',
    },
    headerRing: { position: 'absolute', left: -109 * s, top: -145 * s },
    headerRow: {
      minHeight: 74 * s,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 13 * s,
      paddingHorizontal: 65 * s,
    },
    headerTitle: {
      ...semi,
      color: '#FFFFFF',
      fontSize: 20 * s,
      lineHeight: 26 * s,
      textAlign: 'center',
    },
    back: { position: 'absolute', left: 16 * s, top: 10 * s },
    headerAction: { position: 'absolute', right: 26 * s, top: 15 * s },
    section: {
      backgroundColor: colors.blue,
      backgroundImage: 'linear-gradient(90deg, #4C8AD7 0%, #53D7DA 99.687%)',
      borderRadius: 10 * s,
      marginBottom: 16 * s,
    },
    sectionHeading: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 50 * s,
      paddingHorizontal: 13 * s,
      gap: 7 * s,
    },
    sectionIcon: {
      width: 24 * s,
      height: 24 * s,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: {
      ...semi,
      fontSize: 14 * s,
      lineHeight: 20 * s,
      color: '#FFFFFF',
      flex: 1,
    },
    sectionBody: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10 * s,
    },
    tileGrid: {
      paddingHorizontal: 15 * s,
      paddingTop: 14 * s,
      paddingBottom: 17 * s,
      gap: 15 * s,
    },
    tileRow: { flexDirection: 'row', gap: 17 * s },
    tile: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 62 * s,
      paddingVertical: 10 * s,
      paddingLeft: 9 * s,
      paddingRight: 4 * s,
      borderRadius: 4 * s,
    },
    tileIcon: { width: 34 * s },
    tileCopy: { flex: 1 },
    tileLabel: {
      ...medium,
      fontSize: 12 * s,
      lineHeight: 20 * s,
      color: colors.secondary,
    },
    tileValue: {
      ...semi,
      lineHeight: 20 * s,
      color: colors.text,
      marginTop: 2 * s,
    },
    calculation: { paddingTop: 4 * s },
    calculationRows: { marginHorizontal: 15 * s },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 51 * s,
      gap: 10 * s,
    },
    divider: { borderBottomWidth: 1, borderColor: colors.border },
    valueLabel: {
      ...medium,
      fontSize: 16 * s,
      lineHeight: 22 * s,
      color: colors.secondary,
      flex: 1,
    },
    valueText: {
      ...semi,
      fontSize: 16 * s,
      lineHeight: 22 * s,
      color: '#000000',
      textAlign: 'right',
      flexShrink: 1,
    },
    danger: { color: colors.red },
    netRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 39 * s,
      backgroundColor: '#E9F8F8',
      borderRadius: 10 * s,
      paddingHorizontal: 8 * s,
      marginHorizontal: 9 * s,
      marginTop: 2 * s,
      marginBottom: 16 * s,
    },
    netLabel: {
      ...semi,
      fontSize: 16 * s,
      lineHeight: 22 * s,
      color: '#144E94',
    },
    actionButton: {
      alignSelf: 'center',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10 * s,
      minHeight: 50 * s,
      width: '93%',
      paddingHorizontal: 14 * s,
      paddingVertical: 12 * s,
      borderRadius: 100 * s,
      backgroundColor: '#4D87D7',
      backgroundImage: 'linear-gradient(90deg, #4D87D7 0%, #53DADA 99.687%)',
      marginTop: 16 * s,
    },
    actionLabel: {
      ...semi,
      fontSize: 16 * s,
      lineHeight: 24 * s,
      color: '#FFFFFF',
      textAlign: 'center',
    },
    pressed: { opacity: 0.7 },
    disabled: { opacity: 0.55 },
    employeeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 115 * s,
      padding: 10 * s,
      borderRadius: 10 * s,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 14 * s,
      marginBottom: 15 * s,
    },
    employeeCopy: { flex: 1 },
    employeeAvatarFrame: {
      width: 93 * s,
      height: 93 * s,
      borderWidth: 5 * s,
      borderColor: '#4D8AD7',
      borderRadius: 20 * s,
      overflow: 'hidden',
    },
    employeeAvatar: { borderRadius: 15 * s },
    slipPeriod: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#EDF7FF',
      borderRadius: 10 * s,
      minHeight: 74 * s,
      paddingHorizontal: 16 * s,
      marginBottom: 13 * s,
      gap: 12 * s,
    },
    slipPeriodTitle: {
      fontFamily: 'Poppins-SemiBold',
      fontSize: 18 * s,
      lineHeight: 24 * s,
      color: '#000000',
    },
    slipPeriodLabel: {
      fontFamily: 'Poppins-Medium',
      fontSize: 16 * s,
      lineHeight: 22 * s,
      color: colors.secondary,
    },
    paidBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 62 * s,
      backgroundColor: '#EDFAEE',
      borderRadius: 4 * s,
      marginHorizontal: 15 * s,
      marginTop: 11 * s,
      paddingHorizontal: 9 * s,
      gap: 10 * s,
    },
    paidBannerCopy: { flex: 1 },
    paidBannerTitle: {
      fontFamily: 'Poppins-SemiBold',
      fontSize: 16 * s,
      lineHeight: 20 * s,
      color: '#33A733',
    },
    paidBannerDescription: {
      fontFamily: 'Poppins-SemiBold',
      fontSize: 12 * s,
      lineHeight: 20 * s,
      color: '#33A733',
      marginTop: 2 * s,
    },
    employeeName: {
      ...semi,
      fontSize: 18 * s,
      lineHeight: 24 * s,
      color: '#000000',
      marginBottom: 4 * s,
    },
    employeeMeta: {
      ...medium,
      fontSize: 14 * s,
      lineHeight: 20 * s,
      color: colors.secondary,
    },
    periodControls: { flexDirection: 'row', gap: 5 * s },
    periodPill: {
      backgroundColor: '#EBEFFD',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10 * s,
      minHeight: 29 * s,
      borderRadius: 40 * s,
      gap: 4 * s,
    },
    periodLabel: {
      ...medium,
      fontSize: 12 * s,
      lineHeight: 20 * s,
      color: '#000000',
    },
    dropdown: { transform: [{ rotate: '90deg' }] },
    calendarMonth: {
      width: 93 * s,
      minHeight: 39 * s,
      borderRadius: 4 * s,
      backgroundColor: 'transparent',
      paddingHorizontal: 2 * s,
    },
    calendarYear: {
      width: 79 * s,
      minHeight: 39 * s,
      borderRadius: 4 * s,
      backgroundColor: 'transparent',
      paddingHorizontal: 4 * s,
    },
    calendarPeriodLabel: {
      ...semi,
      fontSize: 20 * s,
      lineHeight: 26 * s,
      paddingRight: 0,
    },
    modal: { flex: 1, justifyContent: 'flex-end' },
    backdrop: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.35)',
    },
    sheet: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '75%',
      paddingHorizontal: 24,
    },
    sheetHeading: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sheetTitle: { ...semi, fontSize: 20, color: '#000000' },
    close: {
      fontSize: 32,
      color: colors.secondary,
      minWidth: 44,
      textAlign: 'center',
    },
    option: {
      minHeight: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      paddingHorizontal: 12,
    },
    optionSelected: { backgroundColor: '#EBF6FF' },
    optionLabel: { ...medium, fontSize: 16, color: '#111111' },
    optionCheck: { color: colors.blue, fontSize: 20 },
    emptyNotice: {
      ...medium,
      color: colors.secondary,
      textAlign: 'center',
      fontSize: 13 * s,
      lineHeight: 21 * s,
      padding: 18 * s,
    },
  });
}
