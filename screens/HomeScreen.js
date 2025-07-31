import React, { useEffect } from 'react';

export default function HomeScreen({ navigation }) {
  // Va directo a GroupsScreen
  useEffect(() => {
    navigation.replace('Groups');
  }, []);
  return null;
}
