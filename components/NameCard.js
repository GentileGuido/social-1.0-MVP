// components/NameCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme';

export default function NameCard({ name, description = [], onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      {(Array.isArray(description) ? description : []).map((line, i) => (
        <Text key={i} style={styles.description}>{line}</Text>
      ))}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  name: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: theme.fonts.bold,
    color: theme.colors.text,
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.muted,
    fontFamily: theme.fonts.regular,
  },
});
