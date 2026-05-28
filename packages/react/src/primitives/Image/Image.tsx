import * as React from 'react';
import { classNames } from '@saasontools/amplify-ui';

import { ComponentClassName } from '@saasontools/amplify-ui';
import type {
  BaseImageProps,
  ImageProps,
  ForwardRefPrimitive,
  Primitive,
} from '../types';
import { View } from '../View';
import { primitiveWithForwardRef } from '../utils/primitiveWithForwardRef';

const ImagePrimitive: Primitive<ImageProps, 'img'> = (
  { className, ...rest },
  ref
) => (
  <View
    as="img"
    ref={ref}
    className={classNames(ComponentClassName.Image, className)}
    {...rest}
  />
);

/**
 * [📖 Docs](https://ui.docs.amplify.aws/react/components/image)
 */
export const Image: ForwardRefPrimitive<BaseImageProps, 'img'> =
  primitiveWithForwardRef(ImagePrimitive);

Image.displayName = 'Image';
