// components/BottomCurvedBar.js
import React from 'react';
import { Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { theme } from '../theme';

// Dimensiones originales de tu SVG path:
const SVG_W = 298.74;
const SVG_H = 54.85;

// ——— AQUI PUEDES AJUSTAR ———
// Altura que quieres que ocupe TODO el SVG en pantalla:
const TARGET_H = 130;

// Calculamos el desplazamiento vertical para centrar el path:
// (TARGET_H - SVG_H) / 2
const VIEWBOX_Y = - (TARGET_H - SVG_H) / 2;
// ————————————————————————

export default function BottomCurvedBar({ style, color = theme.colors.primary }) {
  const { width } = Dimensions.get('window');
  const scale = width / SVG_W;

  // Altura final en px = altura deseada escalada
  const height = TARGET_H * scale;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 ${VIEWBOX_Y} ${SVG_W} ${TARGET_H}`}
      preserveAspectRatio="xMidYMax slice"
      pointerEvents="none"           // ← Esta es la línea que evita que el SVG intercepte toques
      style={[
        {
          position: 'absolute',
          left: 0,
          bottom: 0,
          zIndex: 10,
        },
        style,
      ]}
    >
      <Path
        d="M195.19,0c-6.27,0-11.68,4.01-13.98,9.85-5,12.64-17.31,21.58-31.72,21.58s-26.73-8.94-31.72-21.58c-2.31-5.83-7.71-9.85-13.98-9.85H0v54.85h298.74V0h-103.55Z"
        fill={color}
      />
    </Svg>
  );
}
