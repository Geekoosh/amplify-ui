import * as React from 'react';
import { classNames } from '@saasontools/amplify-ui';

import { ComponentClassName } from '@saasontools/amplify-ui';
import type {
  BaseFlexProps,
  FlexProps,
  ForwardRefPrimitive,
  Primitive,
} from '../types';
import { View } from '../View';
import { primitiveWithForwardRef } from '../utils/primitiveWithForwardRef';

const FlexPrimitive: Primitive<FlexProps, 'div'> = (
  { className, children, ...rest },
  ref
) => (
  <View
    className={classNames(ComponentClassName.Flex, className)}
    ref={ref}
    {...rest}
  >
    {children}
  </View>
);

/**
 * [📖 Docs](https://ui.docs.amplify.aws/react/components/flex)
 */
export const Flex: ForwardRefPrimitive<BaseFlexProps, 'div'> =
  primitiveWithForwardRef(FlexPrimitive);

Flex.displayName = 'Flex';
