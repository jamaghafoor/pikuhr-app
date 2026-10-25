import React, { useEffect, useState } from 'react';
import {
  BackHandler,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeIcon } from '../components/HomeAssets';
import { HomeScreen } from '../screens/HomeScreen';
import { SalaryScreen, type SalaryRoute } from '../screens/SalaryScreen';
import { AttendanceScreen } from '../screens/AttendanceScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { TabIcon } from '../components/TabAssets';
import { useEmployee } from '../state/EmployeeContext';
import { TabPager } from '../components/TabPager';

const tabs = [
  { key: 'home', label: 'Home', width: 19, height: 18, labelWidth: 36 },
  { key: 'salary', label: 'Salary', width: 14, height: 16, labelWidth: 39 },
  {
    key: 'attendance',
    label: 'Attendance',
    width: 11.539,
    height: 15.385,
    labelWidth: 72,
  },
  {
    key: 'profile',
    label: 'Profile',
    width: 14.654,
    height: 17.739,
    labelWidth: 38,
  },
] as const;
type Tab = (typeof tabs)[number]['key'];

export function MainTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [salaryRoute, setSalaryRoute] = useState<SalaryRoute>('summary');
  const { employee } = useEmployee();
  const openTab = (tab: Tab) => {
    setActiveTab(tab);
  };
  const { width } = useWindowDimensions();
  const scale = Math.min(width / 375, 1.5);
  const insets = useSafeAreaInsets();
  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (activeTab === 'salary' && salaryRoute !== 'summary') {
          setSalaryRoute('summary');
          return true;
        }
        if (activeTab === 'home') {
          return false;
        }
        setActiveTab('home');
        return true;
      },
    );
    return () => subscription.remove();
  }, [activeTab, salaryRoute]);

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <TabPager activeIndex={tabs.findIndex(tab => tab.key === activeTab)}>
        <HomeScreen
          key="home"
          employee={employee}
          onOpenSalary={() => {
            setSalaryRoute('advance');
            openTab('salary');
          }}
          onOpenProfile={() => openTab('profile')}
        />
        <SalaryScreen
          key="salary"
          route={salaryRoute}
          onRoute={setSalaryRoute}
        />
        <AttendanceScreen key="attendance" />
        <ProfileScreen
          key="profile"
          onSalary={() => {
            setSalaryRoute('summary');
            openTab('salary');
          }}
          onAttendance={() => openTab('attendance')}
        />
      </TabPager>
      <View
        style={[
          styles.tabBar,
          {
            paddingBottom: insets.bottom,
            paddingLeft: 27 * scale,
            paddingRight: 28 * scale,
            borderTopLeftRadius: 20 * scale,
            borderTopRightRadius: 20 * scale,
          },
        ]}
      >
        {tabs.map(tab => {
          const selected = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected }}
              hitSlop={5}
              onPress={() => {
                if (tab.key === 'salary' && activeTab === 'salary') {
                  setSalaryRoute('summary');
                }
                openTab(tab.key);
              }}
              style={({ pressed }) => [
                styles.tab,
                {
                  minHeight: 60 * scale,
                  paddingTop: 15 * scale,
                  width: tab.labelWidth * scale,
                },
                pressed && styles.pressed,
              ]}
            >
              {selected && (
                <View
                  style={[
                    styles.indicator,
                    { width: 36 * scale, height: 3 * scale },
                  ]}
                />
              )}
              <View style={[styles.iconSlot, { height: 18 * scale }]}>
                {selected &&
                (tab.key === 'salary' || tab.key === 'attendance') ? (
                  <TabIcon
                    name={
                      tab.key === 'salary' ? 'salaryActive' : 'attendanceActive'
                    }
                    width={tab.width * scale}
                    height={tab.height * scale}
                  />
                ) : (
                  <HomeIcon
                    name={tab.key}
                    width={tab.width * scale}
                    height={tab.height * scale}
                    style={
                      selected
                        ? tab.key !== 'home' && styles.selectedIcon
                        : styles.inactiveIcon
                    }
                  />
                )}
              </View>
              <Text
                numberOfLines={1}
                style={[
                  styles.label,
                  {
                    fontSize: 12 * scale,
                    lineHeight: 18 * scale,
                    marginTop: 2 * scale,
                    width: (tab.labelWidth + 16) * scale,
                  },
                  selected && styles.selectedLabel,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F5F5' },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    boxShadow: '0px -6px 23px rgba(0, 0, 0, 0.1)',
  },
  tab: { alignItems: 'center', paddingBottom: 6 },
  iconSlot: { justifyContent: 'flex-start', alignItems: 'center' },
  indicator: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#4E97D9',
    backgroundImage: 'linear-gradient(90deg, #4E97D9 0%, #51BFDA 100%)',
  },
  label: {
    textAlign: 'center',
    fontFamily: 'Poppins-Medium',
    color: '#AEAEAE',
    includeFontPadding: false,
  },
  selectedLabel: { color: '#39B5DC' },
  selectedIcon: { tintColor: '#39B5DC' },
  inactiveIcon: { tintColor: '#AEAEAE' },
  pressed: { opacity: 0.7 },
});
