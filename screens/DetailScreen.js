// screens/DetailScreen.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { theme } from '../theme';

export default function DetailScreen({ route }) {
  const { title = '', description = [] } = route.params || {};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {(Array.isArray(description) ? description : []).map((line, i) => (
        <Text key={i} style={styles.description}>{line}</Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontFamily: theme.fonts.bold,
  },
  description: {
    fontSize: theme.fontSize.md,
    color: theme.colors.muted,
    fontFamily: theme.fonts.regular,
  },
});
