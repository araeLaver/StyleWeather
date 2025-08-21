import React, { memo } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useThemeContext } from './ThemeProvider';
import { FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';

interface ThemeToggleProps {
  style?: any;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const ThemeToggle: React.FC<ThemeToggleProps> = memo(({ 
  style, 
  showLabel = true,
  size = 'medium'
}) => {
  const { isDarkMode, themeMode, colors, setThemeMode } = useThemeContext();

  const themeOptions = [
    { value: 'light', label: '라이트', icon: '☀️' },
    { value: 'auto', label: '자동', icon: '🔄' }
  ];

  const buttonSize = size === 'small' ? 32 : size === 'large' ? 48 : 40;
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  const fontSize = size === 'small' ? FONT_SIZES.xs : size === 'large' ? FONT_SIZES.base : FONT_SIZES.sm;

  return (
    <View style={[styles.container, style]}>
      {showLabel && (
        <Text style={[styles.label, { color: colors.text.secondary }]}>
          테마 설정
        </Text>
      )}
      
      <View style={[styles.toggleContainer, { backgroundColor: colors.surface.secondary }]}>
        {themeOptions.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              {
                backgroundColor: themeMode === option.value 
                  ? colors.primary 
                  : 'transparent',
                width: buttonSize,
                height: buttonSize,
              }
            ]}
            onPress={() => setThemeMode(option.value as 'light' | 'dark' | 'auto')}
          >
            <Text style={[
              styles.optionIcon,
              {
                fontSize: iconSize,
                color: themeMode === option.value 
                  ? colors.text.inverse 
                  : colors.text.secondary
              }
            ]}>
              {option.icon}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {showLabel && (
        <Text style={[styles.currentMode, { color: colors.text.tertiary, fontSize }]}>
          현재: {themeOptions.find(opt => opt.value === themeMode)?.label}
          {themeMode === 'auto' && ` (${isDarkMode ? '다크' : '라이트'})`}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  currentMode: {
    fontWeight: '500',
    marginTop: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  option: {
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    marginHorizontal: 1,
  },
  optionIcon: {
    textAlign: 'center',
  },
  toggleContainer: {
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    padding: 2,
  },
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;