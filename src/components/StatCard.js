import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSizes, borderRadius } from '../utils/theme';

export default function StatCard({ icon, label, value, color }) {
  const iconColor = color || colors.primary;

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: iconColor + '22' }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    color: colors.textPrimary,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    marginBottom: 2,
  },
  label: {
    color: colors.textSecondary,
    fontSize: fontSizes.xs,
    textAlign: 'center',
  },
});
