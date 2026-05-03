import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from 'react-native-svg';

interface GradientProps {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
  children?: React.ReactNode;
}

/**
 * SVG-backed linear gradient — works without expo-linear-gradient.
 */
export const Gradient: React.FC<GradientProps> = ({
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  borderRadius = 0,
  children,
}) => {
  const gradientId = React.useId();

  return (
    <View style={[styles.container, style, { borderRadius, overflow: 'hidden' }]}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          <SvgLinearGradient id={gradientId} x1={start.x} y1={start.y} x2={end.x} y2={end.y}>
            {colors.map((color, i) => (
              <Stop
                key={i}
                offset={i / Math.max(1, colors.length - 1)}
                stopColor={color}
                stopOpacity={1}
              />
            ))}
          </SvgLinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${gradientId})`} />
      </Svg>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});

export default Gradient;
