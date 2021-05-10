/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { zeroPoint } from '../../../code/svg/utility/point';

import { printSVG } from '../../../code/svg/elements/svg';
import { Text } from '../../../code/svg/elements/text';

printSVG(new Text({ position: zeroPoint, text: 'Page not found' }));
