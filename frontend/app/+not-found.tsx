import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Space, FontSize, Radii } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function NotFoundScreen() {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];

  return (
    <>
      <Stack.Screen options={{ title: 'Not Found', headerShown: false }} />
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <Ionicons name="map-outline" size={64} color={palette.primary} style={styles.icon} />
        <Text style={[styles.title, { color: palette.primary }]}>Trail not found</Text>
        <Text style={[styles.subtitle, { color: palette.mutedText }]}>
          This path doesn't exist. Head back to the community.
        </Text>
        <Link href="/(tabs)" style={[styles.button, { backgroundColor: palette.primary }]}>
          <Text style={[styles.buttonText, { color: palette.primaryText }]}>Go home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Space.xl,
    gap: Space.sm,
  },
  icon: { marginBottom: Space.md },
  title: { fontSize: FontSize.xxl, fontWeight: '900', textAlign: 'center' },
  subtitle: { fontSize: FontSize.md, textAlign: 'center', lineHeight: 22, marginBottom: Space.lg },
  button: {
    paddingHorizontal: Space.xl,
    paddingVertical: Space.sm + 4,
    borderRadius: Radii.pill,
  },
  buttonText: { fontSize: FontSize.md, fontWeight: '800' },
});
