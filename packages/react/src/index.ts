export * from './components';
export { useBreakpointValue, useTheme } from './hooks';
export * from './primitives';

export * as components from './components';
export * as primitives from './primitives';

/**
 * Re-export public APIs from `@saasontools/amplify-ui`
 */
export {
  defaultTheme,
  defaultDarkModeOverride,
  createTheme,
  translations,
} from '@saasontools/amplify-ui';
export type { Theme } from '@saasontools/amplify-ui';
