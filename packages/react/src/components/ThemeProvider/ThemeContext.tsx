import * as React from 'react';

import type { WebTheme } from '@saasontools/amplify-ui';
import { createTheme } from '@saasontools/amplify-ui';
import type { ColorMode } from './ThemeProvider';

export interface ThemeContextType {
  theme: WebTheme;
  colorMode?: ColorMode;
}

export const ThemeContext = React.createContext<ThemeContextType>({
  theme: createTheme(),
  colorMode: undefined,
});
