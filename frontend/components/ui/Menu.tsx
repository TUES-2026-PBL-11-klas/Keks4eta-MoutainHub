import React, { useRef, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  findNodeHandle,
  UIManager,
} from 'react-native';
import { Colors, Fonts, FontSize, Radii, Shadow, Space } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type MenuItem = {
  key: string;
  label: string;
  onPress: () => void;
  leading?: React.ReactNode;
  destructive?: boolean;
  disabled?: boolean;
};

type MenuProps = {
  items: MenuItem[];
  children: (args: { open: () => void; isOpen: boolean }) => React.ReactNode;
  align?: 'left' | 'right';
};

export function Menu({ items, children, align = 'right' }: MenuProps) {
  const scheme = useColorScheme() ?? 'light';
  const palette = Colors[scheme];
  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const triggerRef = useRef<View>(null);

  const open = () => {
    const node = triggerRef.current;
    if (!node) {
      setIsOpen(true);
      return;
    }
    const handle = findNodeHandle(node);
    if (handle == null) {
      setIsOpen(true);
      return;
    }
    UIManager.measureInWindow(handle, (x, y, w, h) => {
      setAnchor({ x, y, w, h });
      setIsOpen(true);
    });
  };

  const close = () => {
    setIsOpen(false);
    setAnchor(null);
  };

  const menuStyle: ViewStyle = {
    position: 'absolute',
    minWidth: 180,
    backgroundColor: palette.background,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: Space.xs,
    ...Shadow.floating,
  };

  if (anchor) {
    const top = anchor.y + anchor.h + 8;
    if (align === 'right') {
      menuStyle.right = Platform.OS === 'web' ? undefined : undefined;
      menuStyle.left = anchor.x + anchor.w - 180;
    } else {
      menuStyle.left = anchor.x;
    }
    menuStyle.top = top;
  }

  return (
    <>
      <View ref={triggerRef} collapsable={false}>
        {children({ open, isOpen })}
      </View>

      <Modal transparent visible={isOpen} onRequestClose={close} animationType="fade">
        <Pressable style={styles.backdrop} onPress={close} accessibilityLabel="Close menu">
          <View style={menuStyle} onStartShouldSetResponder={() => true}>
            {items.map((item) => (
              <Pressable
                key={item.key}
                disabled={item.disabled}
                onPress={() => {
                  close();
                  item.onPress();
                }}
                style={({ pressed, hovered }: any) => [
                  styles.item,
                  {
                    backgroundColor: pressed
                      ? palette.fieldBg
                      : hovered
                      ? palette.surface
                      : 'transparent',
                    opacity: item.disabled ? 0.5 : 1,
                  },
                ]}
                accessibilityRole="menuitem"
              >
                {item.leading ? <View style={styles.itemLeading}>{item.leading}</View> : null}
                <Text
                  style={[
                    styles.itemLabel,
                    {
                      color: item.destructive ? palette.danger : palette.text,
                      fontFamily: Fonts.sans,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Space.sm + 2,
    paddingHorizontal: Space.md,
    gap: Space.sm,
  },
  itemLeading: { width: 20, alignItems: 'center' },
  itemLabel: { fontSize: FontSize.md, fontWeight: '500' },
});
