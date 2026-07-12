import { renderHook } from '@testing-library/react-native';
import { useThemeColor } from '../use-theme-color';
import { Colors } from '@/constants/theme';
import * as useColorSchemeHook from '@/hooks/use-color-scheme';

jest.mock('@/hooks/use-color-scheme');

describe('useThemeColor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return color from props when light theme is active', () => {
    jest.spyOn(useColorSchemeHook, 'useColorScheme').mockReturnValue('light');
    const { result } = renderHook(() =>
      useThemeColor({ light: '#123', dark: '#456' }, 'text')
    );
    expect(result.current).toBe('#123');
  });

  it('should return color from props when dark theme is active', () => {
    jest.spyOn(useColorSchemeHook, 'useColorScheme').mockReturnValue('dark');
    const { result } = renderHook(() =>
      useThemeColor({ light: '#123', dark: '#456' }, 'text')
    );
    expect(result.current).toBe('#456');
  });

  it('should fall back to theme color when props do not provide a color for the active light theme', () => {
    jest.spyOn(useColorSchemeHook, 'useColorScheme').mockReturnValue('light');
    const { result } = renderHook(() =>
      useThemeColor({ dark: '#456' }, 'text')
    );
    expect(result.current).toBe(Colors.light.text);
  });

  it('should fall back to theme color when props do not provide a color for the active dark theme', () => {
    jest.spyOn(useColorSchemeHook, 'useColorScheme').mockReturnValue('dark');
    const { result } = renderHook(() =>
      useThemeColor({ light: '#123' }, 'text')
    );
    expect(result.current).toBe(Colors.dark.text);
  });

  it('should default to light theme if useColorScheme returns null or undefined', () => {
    jest.spyOn(useColorSchemeHook, 'useColorScheme').mockReturnValue(null);
    const { result } = renderHook(() =>
      useThemeColor({}, 'text')
    );
    expect(result.current).toBe(Colors.light.text);
  });
});
