import React, { useMemo, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActionButton,
  EmployeeCard,
  ScreenHeader,
  Section,
  useTabStyles,
  ValueRow,
} from '../components/TabUI';
import { AuthField } from './auth/AuthLayout';
import type { Employee } from '../data/demo';
import { useEmployee } from '../state/EmployeeContext';
import { usePdfExport } from '../hooks/usePdfExport';

const editableFields = [
  { field: 'name', label: 'Full Name', required: true },
  { field: 'designation', label: 'Designation', required: true },
  { field: 'store', label: 'Store Name', required: true },
  { field: 'mobile', label: 'Mobile Number', required: false },
  { field: 'email', label: 'Email', required: false },
  { field: 'city', label: 'City', required: false },
] as const;

export function ProfileScreen({
  onSalary,
  onAttendance,
}: {
  onSalary: () => void;
  onAttendance: () => void;
}) {
  const { employee, ready, save } = useEmployee();
  const { scale, styles } = useTabStyles();
  const local = useMemo(() => makeStyles(scale), [scale]);
  const insets = useSafeAreaInsets();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(employee);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Employee, string>>>(
    {},
  );
  const { busy, download } = usePdfExport();
  const saveProfile = async () => {
    if (saving) {
      return;
    }
    const values = Object.fromEntries(
      Object.entries(draft).map(([key, value]) => [key, value.trim()]),
    ) as Employee;
    const nextErrors: typeof errors = {};
    editableFields.forEach(({ field, label, required }) => {
      if (required && !values[field]) {
        nextErrors[field] = `Enter ${label.toLowerCase()}.`;
      }
    });
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (values.mobile && !/^\+?[\d\s()-]{7,20}$/.test(values.mobile)) {
      nextErrors.mobile = 'Enter a valid mobile number.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }
    setSaving(true);
    try {
      await save(values);
      Keyboard.dismiss();
      setEditing(false);
      Alert.alert(
        'Profile saved',
        'Your details have been updated on this device.',
      );
    } catch (error) {
      Alert.alert(
        'Could not save profile',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };
  const closeEditor = () => {
    if (!saving) {
      Keyboard.dismiss();
      setEditing(false);
    }
  };
  return (
    <View style={styles.screen} testID="profile-screen">
      <ScreenHeader title="My Profile" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <EmployeeCard employee={employee} />
        <Section title="Employee Details" icon="calendarSummary">
          <View style={styles.calculationRows}>
            {[
              { label: 'Employee ID', value: employee.employeeId },
              ...editableFields.map(({ field, label }) => ({
                label,
                value: employee[field] || 'Not added',
              })),
            ].map((row, index) => (
              <ValueRow
                key={row.label}
                {...row}
                last={index === editableFields.length}
              />
            ))}
          </View>
        </Section>
        <ActionButton
          label="Edit Profile"
          disabled={!ready}
          onPress={() => {
            setDraft(employee);
            setErrors({});
            setEditing(true);
          }}
        />
        <View style={local.shortcuts}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View my salary"
            onPress={onSalary}
            style={local.shortcut}
          >
            <Text style={local.shortcutLabel}>View My Salary</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View my attendance"
            onPress={onAttendance}
            style={local.shortcut}
          >
            <Text style={local.shortcutLabel}>View My Attendance</Text>
          </Pressable>
        </View>
        <ActionButton
          label="Download Employee Details"
          download
          busy={busy}
          onPress={() =>
            download(`Employee Details - ${employee.name}.pdf`, {
              title: 'Employee Details',
              subtitle: employee.store,
              employee: `${employee.name} | ${employee.employeeId}`,
              sections: [
                {
                  title: 'Profile',
                  rows: editableFields.map(({ field, label }) => ({
                    label,
                    value: employee[field] || 'Not added',
                  })),
                },
              ],
              note: 'Demo employee profile, saved locally on this device.',
            })
          }
        />
        <Text style={local.note}>
          Demo workspace · Changes are saved on this device.
        </Text>
      </ScrollView>
      {editing && (
        <Modal
          animationType="slide"
          onRequestClose={closeEditor}
          statusBarTranslucent
          navigationBarTranslucent
        >
          <View style={styles.screen} testID="edit-profile-screen">
            <ScreenHeader title="Edit Profile" onBack={closeEditor} />
            <KeyboardAvoidingView
              style={local.flex}
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
              <ScrollView
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="none"
                contentContainerStyle={[
                  styles.content,
                  { paddingBottom: insets.bottom + 28 * scale },
                ]}
              >
                <Text style={local.editNote}>
                  Employee ID: {employee.employeeId}
                </Text>
                <View style={local.fields}>
                  {editableFields.map(({ field, label }) => (
                    <AuthField
                      key={field}
                      label={label}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      value={draft[field]}
                      onChangeText={value => {
                        setDraft(previous => ({ ...previous, [field]: value }));
                        setErrors(previous => ({
                          ...previous,
                          [field]: undefined,
                        }));
                      }}
                      error={errors[field]}
                      maxLength={field === 'mobile' ? 20 : 80}
                      autoCapitalize={field === 'email' ? 'none' : 'words'}
                      keyboardType={
                        field === 'email'
                          ? 'email-address'
                          : field === 'mobile'
                          ? 'phone-pad'
                          : 'default'
                      }
                      editable={!saving}
                      returnKeyType="done"
                    />
                  ))}
                </View>
                <ActionButton
                  label={saving ? 'Saving…' : 'Save Changes'}
                  disabled={saving}
                  onPress={saveProfile}
                />
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      )}
    </View>
  );
}

function makeStyles(s: number) {
  return StyleSheet.create({
    flex: { flex: 1 },
    shortcuts: { flexDirection: 'row', gap: 12 * s, marginTop: 18 * s },
    shortcut: {
      flex: 1,
      minHeight: 50 * s,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#EDF6FE',
      padding: 10 * s,
      borderRadius: 10 * s,
    },
    shortcutLabel: {
      fontFamily: 'Poppins-Medium',
      color: '#144E94',
      fontSize: 13 * s,
      textAlign: 'center',
    },
    note: {
      fontFamily: 'Poppins-Regular',
      color: '#777777',
      fontSize: 12 * s,
      lineHeight: 20 * s,
      textAlign: 'center',
      marginTop: 24 * s,
    },
    editNote: {
      fontFamily: 'Poppins-Medium',
      color: '#555555',
      fontSize: 14 * s,
      marginBottom: 20 * s,
    },
    fields: { gap: 16 * s },
  });
}
