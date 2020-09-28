import { indentation } from '../../typescript/svg/utility/constants';
import { Color, colors } from '../../typescript/utility/color';

import { getArrowMarkers, getCircleMarkers } from '../../typescript/svg/utility/definitions';

const array = Object.keys(colors) as (Color | undefined)[];
array.unshift(undefined);

console.log('<svg id="svg-definitions" class="figure" width="0" height="0" viewBox="0 0 0 0" xmlns="http://www.w3.org/2000/svg">');
console.log(indentation + '<defs>\n');
console.log(getArrowMarkers(array, indentation + indentation));
console.log(getCircleMarkers(array, indentation + indentation));
console.log(indentation + '</defs>');
console.log('</svg>');
