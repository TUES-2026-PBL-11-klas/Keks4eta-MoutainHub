import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Avatar } from './ui/Avatar';
import { Menu, MenuItem } from './ui/Menu';
import { Button } from './ui/Button';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/lib/auth-context';

type ProfileMenuProps = {
  size?: number;
};

export function ProfileMenu({ size = 36 }: ProfileMenuProps) {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const { isAuthed, user, signOut } = useAuth();

  if (!isAuthed || !user) {
    return (
      <Button
        label="Sign in"
        variant="primary"
        size="sm"
        onPress={() => router.push('/login')}
      />
    );
  }

  const items: MenuItem[] = [
    {
      key: 'view',
      label: 'View profile',
      onPress: () => router.push('/profile'),
      leading: <Ionicons name="person-outline" size={16} color={palette.text} />,
    },
    {
      key: 'logout',
      label: 'Log out',
      destructive: true,
      onPress: async () => {
        await signOut();
        router.replace('/login');
      },
      leading: <Ionicons name="log-out-outline" size={16} color={palette.danger} />,
    },
  ];

  return (
    <Menu items={items} align="right">
      {({ open }) => (
        <Avatar
          uri={user.avatarUrl}
          name={user.displayName}
          size={size}
          onPress={open}
          accessibilityLabel="Open profile menu"
        />
      )}
    </Menu>
  );
}
