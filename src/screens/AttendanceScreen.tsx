import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabIcon, type TabIconName } from '../components/TabAssets';
import {
  ActionButton,
  EmptyNotice,
  PeriodSelector,
  ScreenHeader,
  Section,
  useTabStyles,
} from '../components/TabUI';
import {
  DEMO_TODAY,
  INITIAL_PERIOD,
  MONTHS,
  STATUS_LABELS,
  YEARS,
  attendanceForPeriod,
  attendanceSummary,
  calendarCells,
  dateKey,
  daysInMonth,
  displayDate,
  moveMonth,
  periodLabel,
  type AttendanceRecord,
  type AttendanceStatus,
  type Period,
} from '../data/demo';
import { useEmployee } from '../state/EmployeeContext';
import { usePdfExport } from '../hooks/usePdfExport';

const filters: { value: AttendanceStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'halfDay', label: 'Half Day' },
  { value: 'leave', label: 'Leave' },
];
const statusColors = {
  present: '#E7FFDA',
  absent: '#FEEDED',
  halfDay: '#FFF2D8',
  leave: '#F2EDFF',
};

function Detail({
  icon,
  label,
  value,
  color,
}: {
  icon: TabIconName;
  label: string;
  value: string;
  color: string;
}) {
  const { scale } = useTabStyles();
  const styles = useMemo(() => makeStyles(scale), [scale]);
  return (
    <View style={styles.detail}>
      <View style={[styles.detailIcon, { backgroundColor: color }]}>
        <TabIcon
          name={icon}
          width={(icon === 'fingerprint' ? 17.1 : 19) * scale}
          height={(icon === 'fingerprint' ? 15.12 : 19) * scale}
        />
      </View>
      <View style={styles.detailCopy}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.85}
          style={styles.detailLabel}
        >
          {label}
        </Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function RecordDetails({
  selectedDate,
  record,
}: {
  selectedDate: string;
  record?: AttendanceRecord;
}) {
  const { scale } = useTabStyles();
  const styles = useMemo(() => makeStyles(scale), [scale]);
  const badgeColor = record ? statusColors[record.status] : '#F0F0F0';
  return (
    <View style={styles.recordCard}>
      <View style={styles.selectedDateRow}>
        <View style={[styles.detailIcon, styles.dateIcon]}>
          <TabIcon name="calendarWhite" size={19 * scale} />
        </View>
        <View style={styles.detailCopy}>
          <Text style={styles.detailLabel}>Selected Date</Text>
          <Text style={styles.selectedDate}>{displayDate(selectedDate)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: badgeColor,
            },
          ]}
        >
          <Text style={styles.statusLabel}>
            {record ? STATUS_LABELS[record.status] : 'No record'}
          </Text>
        </View>
      </View>
      <View style={styles.detailsRow}>
        <Detail
          icon="clockWhite"
          label="Check In"
          value={record?.checkIn || '—'}
          color="#83AF6C"
        />
        <View style={styles.verticalDivider} />
        <Detail
          icon="clockWhite"
          label="Check Out"
          value={record?.checkOut || '—'}
          color="#EE272B"
        />
      </View>
      <View style={styles.detailsRow}>
        <Detail
          icon="fingerprint"
          label="Attendance Source"
          value={record?.source || '—'}
          color="#8282EF"
        />
        <View style={styles.verticalDivider} />
        <Detail
          icon="locationWhite"
          label="Location"
          value={record?.verified ? 'Verified' : '—'}
          color="#C99C4F"
        />
      </View>
      {!record && (
        <Text style={styles.recordNote}>
          {selectedDate > DEMO_TODAY
            ? 'No attendance has been recorded for this date.'
            : 'No attendance record is available.'}
        </Text>
      )}
    </View>
  );
}

export function AttendanceScreen() {
  const insets = useSafeAreaInsets();
  const { scale, styles: shared } = useTabStyles();
  const styles = useMemo(() => makeStyles(scale), [scale]);
  const [period, setPeriod] = useState<Period>(INITIAL_PERIOD);
  const [selectedDate, setSelectedDate] = useState(DEMO_TODAY);
  const [listView, setListView] = useState(false);
  const [filter, setFilter] = useState<AttendanceStatus | 'all'>('all');
  const { employee } = useEmployee();
  const { busy, download } = usePdfExport();
  const records = useMemo(() => attendanceForPeriod(period), [period]);
  const activeFilter = listView ? filter : 'all';
  const visibleRecords = records.filter(
    record => activeFilter === 'all' || record.status === activeFilter,
  );
  const summary = attendanceSummary(visibleRecords);
  const selectedRecord = records.find(record => record.date === selectedDate);
  const cells = calendarCells(period);
  const rows = Array.from({ length: cells.length / 7 }, (_, index) =>
    cells.slice(index * 7, index * 7 + 7),
  );
  const changePeriod = (next: Period) => {
    if (next.year < YEARS[0] || next.year > YEARS[YEARS.length - 1]) {
      return;
    }
    setPeriod(next);
    const day = Math.min(Number(selectedDate.slice(-2)), daysInMonth(next));
    setSelectedDate(dateKey(next.year, next.month, day));
  };
  const selectDate = (cell: (typeof cells)[number]) => {
    if (cell.year < YEARS[0] || cell.year > YEARS[YEARS.length - 1]) {
      return;
    }
    if (!cell.current) {
      setPeriod({ year: cell.year, month: cell.month });
    }
    setSelectedDate(cell.key);
  };
  const exportAttendance = () =>
    download(
      `Attendance - ${employee.name} - ${periodLabel(period)}${
        activeFilter === 'all' ? '' : ` - ${STATUS_LABELS[activeFilter]}`
      }.pdf`,
      {
        title: 'Attendance Report',
        subtitle: `${periodLabel(period)}${
          activeFilter === 'all' ? '' : ` | ${STATUS_LABELS[activeFilter]}`
        }`,
        employee: `${employee.name} | ${employee.employeeId}\n${employee.store}`,
        sections: [
          {
            title: 'Attendance Summary',
            rows: [
              { label: 'Present', value: String(summary.present) },
              { label: 'Absent', value: String(summary.absent) },
              { label: 'Half Day', value: String(summary.halfDay) },
              { label: 'Leave', value: String(summary.leave) },
              { label: 'Attendance Rate', value: `${summary.rate}%` },
            ],
          },
          {
            title: 'Daily Records',
            rows: visibleRecords.map(record => ({
              label: `${displayDate(record.date)} | ${
                STATUS_LABELS[record.status]
              }`,
              value: record.checkIn
                ? `${record.checkIn} - ${record.checkOut}`
                : '—',
            })),
          },
        ],
        note: 'Demo attendance data. The attendance rate counts days with a check-in, including half days. No live location or attendance API is connected.',
      },
    );
  return (
    <View style={styles.screen} testID="attendance-screen">
      <View style={[styles.statusBarFill, { height: insets.top }]} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenHeader
          title="My Attendance"
          includeTopInset={false}
          action={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                listView ? 'Show calendar' : 'Show attendance list'
              }
              accessibilityState={{ selected: listView }}
              onPress={() => setListView(value => !value)}
              hitSlop={8}
            >
              <TabIcon
                name={listView ? 'calendarSummary' : 'list'}
                size={28 * scale}
              />
            </Pressable>
          }
        >
          <View style={styles.calendar}>
            <View style={styles.calendarToolbar}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Previous month"
                accessibilityState={{
                  disabled: period.year === YEARS[0] && period.month === 0,
                }}
                disabled={period.year === YEARS[0] && period.month === 0}
                onPress={() => changePeriod(moveMonth(period, -1))}
                style={({ pressed }) => [
                  styles.calendarArrow,
                  pressed && shared.pressed,
                ]}
              >
                <TabIcon
                  name="chevron"
                  width={8 * scale}
                  height={15 * scale}
                  style={[styles.blackIcon, styles.reverse]}
                />
              </Pressable>
              <PeriodSelector
                period={period}
                onChange={changePeriod}
                calendar
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Next month"
                accessibilityState={{
                  disabled:
                    period.year === YEARS[YEARS.length - 1] &&
                    period.month === 11,
                }}
                disabled={
                  period.year === YEARS[YEARS.length - 1] && period.month === 11
                }
                onPress={() => changePeriod(moveMonth(period, 1))}
                style={({ pressed }) => [
                  styles.calendarArrow,
                  pressed && shared.pressed,
                ]}
              >
                <TabIcon
                  name="chevron"
                  width={8 * scale}
                  height={15 * scale}
                  style={styles.blackIcon}
                />
              </Pressable>
            </View>
            {!listView && (
              <>
                <View style={styles.weekdays}>
                  {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
                    <Text key={day} style={styles.weekday}>
                      {day}
                    </Text>
                  ))}
                </View>
                <View style={styles.calendarGrid}>
                  {rows.map((week, index) => (
                    <View key={index} style={styles.week}>
                      {week.map(cell => (
                        <Pressable
                          key={cell.key}
                          accessibilityRole="button"
                          accessibilityLabel={displayDate(cell.key)}
                          accessibilityState={{
                            selected: cell.key === selectedDate,
                          }}
                          onPress={() => selectDate(cell)}
                          style={({ pressed }) => [
                            styles.dayCell,
                            cell.current &&
                              (cell.key <= DEMO_TODAY
                                ? styles.recordedDay
                                : styles.upcomingDay),
                            cell.key === selectedDate && styles.selectedDay,
                            pressed && shared.pressed,
                          ]}
                        >
                          <Text
                            style={[
                              styles.dayLabel,
                              !cell.current && styles.adjacentDay,
                              cell.key === selectedDate &&
                                styles.selectedDayLabel,
                            ]}
                          >
                            {cell.day}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  ))}
                </View>
              </>
            )}
            {listView && (
              <Text style={styles.listHeading}>
                {periodLabel(period)} · {visibleRecords.length}{' '}
                {visibleRecords.length === 1 ? 'record' : 'records'}
              </Text>
            )}
          </View>
        </ScreenHeader>
        <View style={styles.content}>
          {listView && (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filters}
              >
                {filters.map(option => (
                  <Pressable
                    key={option.value}
                    accessibilityRole="button"
                    accessibilityLabel={`Filter ${option.label}`}
                    accessibilityState={{ selected: filter === option.value }}
                    onPress={() => setFilter(option.value)}
                    style={[
                      styles.filter,
                      filter === option.value && styles.filterActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterLabel,
                        filter === option.value && styles.filterLabelActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
              {visibleRecords.length ? (
                visibleRecords.map(record => (
                  <Pressable
                    key={record.date}
                    accessibilityRole="button"
                    accessibilityLabel={`View ${displayDate(record.date)}`}
                    onPress={() => {
                      setSelectedDate(record.date);
                      setListView(false);
                    }}
                    style={styles.listRow}
                  >
                    <View>
                      <Text style={styles.detailValue}>
                        {displayDate(record.date)}
                      </Text>
                      <Text style={styles.detailLabel}>
                        {record.checkIn
                          ? `${record.checkIn} – ${record.checkOut}`
                          : 'No check-in'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusColors[record.status] },
                      ]}
                    >
                      <Text style={styles.statusLabel}>
                        {STATUS_LABELS[record.status]}
                      </Text>
                    </View>
                  </Pressable>
                ))
              ) : (
                <EmptyNotice>
                  No{' '}
                  {filter === 'all'
                    ? ''
                    : STATUS_LABELS[filter].toLowerCase() + ' '}
                  records for {MONTHS[period.month]} {period.year}. Change the
                  month or filter to see other records.
                </EmptyNotice>
              )}
            </>
          )}
          {!listView && (
            <RecordDetails
              selectedDate={selectedDate}
              record={selectedRecord}
            />
          )}
          <Section title="Attendance Summary" icon="calendarSummary">
            <View style={styles.summaryRows}>
              {[
                {
                  label: 'Present',
                  value: `${summary.present} ${
                    summary.present === 1 ? 'Day' : 'Days'
                  }`,
                },
                {
                  label: 'Absent',
                  value: `${summary.absent} ${
                    summary.absent === 1 ? 'Day' : 'Days'
                  }`,
                },
                {
                  label: 'Half Day',
                  value: `${summary.halfDay} ${
                    summary.halfDay === 1 ? 'Day' : 'Days'
                  }`,
                },
                {
                  label: 'Leave',
                  value: `${summary.leave} ${
                    summary.leave === 1 ? 'Day' : 'Days'
                  }`,
                },
                { label: 'Attendance Rate', value: `${summary.rate}%` },
              ].map((row, index) => (
                <View
                  key={row.label}
                  style={[
                    styles.summaryRow,
                    index < 4 && styles.horizontalDivider,
                  ]}
                >
                  <Text style={styles.summaryLabel}>{row.label}</Text>
                  <Text style={styles.summaryValue}>{row.value}</Text>
                </View>
              ))}
            </View>
          </Section>
          <ActionButton
            label="Download Attendance"
            download
            busy={busy}
            disabled={!visibleRecords.length}
            onPress={exportAttendance}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(s: number) {
  const medium = { fontFamily: 'Poppins-Medium', includeFontPadding: false };
  const semi = { fontFamily: 'Poppins-SemiBold', includeFontPadding: false };
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: '#F5F5F5' },
    statusBarFill: { backgroundColor: '#4D8DD8' },
    calendar: { marginTop: -8 * s, paddingBottom: 34 * s },
    calendarToolbar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20 * s,
      minHeight: 39 * s,
    },
    calendarArrow: {
      width: 38 * s,
      height: 38 * s,
      backgroundColor: '#FFFFFF',
      borderRadius: 30 * s,
      alignItems: 'center',
      justifyContent: 'center',
    },
    blackIcon: { tintColor: '#000000' },
    reverse: { transform: [{ scaleX: -1 }] },
    weekdays: {
      flexDirection: 'row',
      paddingHorizontal: 22 * s,
      height: 50 * s,
      alignItems: 'center',
    },
    weekday: {
      ...medium,
      flex: 1,
      textAlign: 'center',
      fontSize: 14 * s,
      lineHeight: 20 * s,
      color: '#FFFFFF',
    },
    calendarGrid: { marginHorizontal: 22 * s, gap: 4 * s },
    week: { flexDirection: 'row', gap: 4 * s },
    dayCell: {
      flex: 1,
      minHeight: 39 * s,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 4 * s,
    },
    recordedDay: { backgroundColor: 'rgba(255,255,255,0.17)' },
    upcomingDay: { borderWidth: 1, borderColor: '#FFFFFF' },
    selectedDay: { backgroundColor: '#FFFFFF', borderColor: '#FFFFFF' },
    dayLabel: {
      ...semi,
      fontSize: 14 * s,
      lineHeight: 20 * s,
      color: '#FFFFFF',
    },
    adjacentDay: { color: 'rgba(255,255,255,0.55)' },
    selectedDayLabel: { color: '#4C8AD7' },
    content: {
      paddingHorizontal: 15 * s,
      paddingTop: 20 * s,
      paddingBottom: 28 * s,
    },
    recordCard: {
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#DDDDDD',
      borderRadius: 10 * s,
      paddingHorizontal: 15 * s,
      marginBottom: 15 * s,
    },
    selectedDateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 70 * s,
      borderBottomWidth: 1,
      borderColor: '#DDDDDD',
      gap: 10 * s,
    },
    detail: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10 * s,
    },
    detailIcon: {
      width: 33 * s,
      height: 33 * s,
      borderRadius: 40 * s,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateIcon: { backgroundColor: '#4C8CD7' },
    detailCopy: { flex: 1 },
    detailLabel: {
      ...medium,
      fontSize: 12 * s,
      lineHeight: 20 * s,
      color: '#555555',
    },
    detailValue: {
      ...semi,
      fontSize: 16 * s,
      lineHeight: 20 * s,
      color: '#000000',
      marginTop: 2 * s,
    },
    selectedDate: {
      ...semi,
      fontSize: 18 * s,
      lineHeight: 22 * s,
      color: '#000000',
      marginTop: 2 * s,
    },
    statusBadge: {
      minHeight: 29 * s,
      minWidth: 79 * s,
      paddingHorizontal: 10 * s,
      borderRadius: 40 * s,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusLabel: {
      ...medium,
      fontSize: 12 * s,
      lineHeight: 20 * s,
      color: '#000000',
    },
    detailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 67 * s,
      gap: 15 * s,
    },
    verticalDivider: { height: 36 * s, width: 1, backgroundColor: '#DDDDDD' },
    recordNote: {
      ...medium,
      fontSize: 12 * s,
      lineHeight: 18 * s,
      color: '#777777',
      paddingBottom: 12 * s,
    },
    summaryRows: { paddingHorizontal: 13 * s },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      minHeight: 50 * s,
      gap: 12 * s,
    },
    horizontalDivider: { borderBottomWidth: 1, borderColor: '#DDDDDD' },
    summaryLabel: {
      ...medium,
      fontSize: 14 * s,
      lineHeight: 20 * s,
      color: '#555555',
    },
    summaryValue: {
      ...semi,
      fontSize: 14 * s,
      lineHeight: 20 * s,
      color: '#000000',
    },
    filters: { gap: 8 * s, paddingBottom: 16 * s },
    filter: {
      paddingHorizontal: 14 * s,
      paddingVertical: 8 * s,
      borderRadius: 20 * s,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#DDDDDD',
    },
    filterActive: { backgroundColor: '#4C8AD7', borderColor: '#4C8AD7' },
    filterLabel: { ...medium, fontSize: 12 * s, color: '#555555' },
    filterLabelActive: { color: '#FFFFFF' },
    listHeading: {
      ...medium,
      fontSize: 14 * s,
      lineHeight: 22 * s,
      color: '#FFFFFF',
      textAlign: 'center',
      marginTop: 20 * s,
    },
    listRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14 * s,
      marginBottom: 10 * s,
      backgroundColor: '#FFFFFF',
      borderRadius: 10 * s,
      borderWidth: 1,
      borderColor: '#DDDDDD',
      gap: 10 * s,
    },
  });
}
