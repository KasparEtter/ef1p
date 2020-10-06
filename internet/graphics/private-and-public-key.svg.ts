import { textToLineDistance } from '../../typescript/svg/utility/constants';
import { P, zeroPoint } from '../../typescript/svg/utility/point';

import { ConnectionLine } from '../../typescript/svg/elements/line';
import { Rectangle } from '../../typescript/svg/elements/rectangle';
import { printSVG } from '../../typescript/svg/elements/svg';
import { bold, estimateSizeWithMargin } from '../../typescript/svg/elements/text';

const size = estimateSizeWithMargin(bold('Private key'));

const privateKeyRectangle = new Rectangle({ position: zeroPoint, size });
const privateKeyText = privateKeyRectangle.text(bold('Private key'));

const publicKeyRectangle = new Rectangle({ position: P(2 * size.x, 0), size });
const publicKeyText = publicKeyRectangle.text(bold('Public key'));

const lineOffset = textToLineDistance / 2;

const efficientLine = ConnectionLine(privateKeyRectangle, 'right', publicKeyRectangle, 'left', { color: 'green' }).move(P(0, -lineOffset));
const efficientText = efficientLine.text('Efficient', 'left');

const infeasibleLine = ConnectionLine(publicKeyRectangle, 'left', privateKeyRectangle, 'right', { color: 'red' }).move(P(0, lineOffset));
const infeasibleText = infeasibleLine.text('Infeasible', 'left');

printSVG(efficientLine, efficientText, infeasibleLine, infeasibleText, privateKeyRectangle, privateKeyText, publicKeyRectangle, publicKeyText);
