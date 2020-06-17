import { createElement } from 'react';

import { Color } from '../utility/color';

import { Children } from './utility';

export interface TextProps extends Children {
    color?: Color;
}

export const Text = ({ color, children }: TextProps) => <span className={color ? 'text-' + color : ''}>{children}</span>;
