import { Color, colors } from '../code/utility/color';

import { indentation } from '../code/svg/utility/constants';
import { getArrowMarkers, getCircleMarkers } from '../code/svg/utility/definitions';

const array = Object.keys(colors) as (Color | undefined)[];
array.unshift(undefined);

console.log('<svg id="svg-definitions" class="figure" width="0" height="0" viewBox="0 0 0 0" xmlns="http://www.w3.org/2000/svg">');
console.log(indentation + '<defs>\n');
console.log(getArrowMarkers(array, indentation + indentation));
console.log(getCircleMarkers(array, indentation + indentation));
console.log(indentation + '</defs>');
console.log('</svg>');
