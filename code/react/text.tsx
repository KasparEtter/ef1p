/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color, colors, getColorClass } from '../utility/color';
import { mapEntries } from '../utility/object';

import { Children } from './utility';

export const Text = mapEntries(colors, (_, color) => (
    ({ children }: Children) => <span className={getColorClass(color as Color)}>{children}</span>),
);
