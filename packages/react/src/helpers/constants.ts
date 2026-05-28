import { isFunction } from '@saasontools/amplify-ui';
export const AMPLIFY_SYMBOL = (
  typeof Symbol !== 'undefined' && isFunction(Symbol.for)
    ? Symbol.for('amplify_default')
    : '@@amplify_default'
) as symbol;

export const ERROR_SUFFIX = 'error';
export const DESCRIPTION_SUFFIX = 'description';
