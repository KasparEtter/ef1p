import { zeroPoint } from '../../../code/svg/utility/point';

import { printSVG } from '../../../code/svg/elements/svg';
import { Text } from '../../../code/svg/elements/text';

printSVG(new Text({ position: zeroPoint, text: 'Page not found' }));
