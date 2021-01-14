import { P, zeroPoint } from '../../../code/svg/utility/point';

import { Line } from '../../../code/svg/elements/line';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateSizeWithMargin } from '../../../code/svg/elements/text';

const size = estimateSizeWithMargin(bold('Private key'));

const privateKeyRectangle = new Rectangle({ position: zeroPoint, size });
const privateKeyText = privateKeyRectangle.text(bold('Private key'));

const publicKeyRectangle = new Rectangle({ position: P(2 * size.x, 0), size });
const publicKeyText = publicKeyRectangle.text(bold('Public key'));

const efficientLine = Line.connectBoxes(privateKeyRectangle, 'right', publicKeyRectangle, 'left', { color: 'green' }).moveLeft();
const efficientText = efficientLine.text('Efficient');

const infeasibleLine = Line.connectBoxes(publicKeyRectangle, 'left', privateKeyRectangle, 'right', { color: 'red' }).moveLeft();
const infeasibleText = infeasibleLine.text('Infeasible');

printSVG(efficientLine, efficientText, infeasibleLine, infeasibleText, privateKeyRectangle, privateKeyText, publicKeyRectangle, publicKeyText);
