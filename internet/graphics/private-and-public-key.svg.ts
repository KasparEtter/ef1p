import { P, zeroPoint } from '../../typescript/svg/utility/point';

import { InvisiblePoint } from '../../typescript/svg/elements/invisible';
import { ConnectionLine } from '../../typescript/svg/elements/line';
import { Rectangle } from '../../typescript/svg/elements/rectangle';
import { printSVG } from '../../typescript/svg/elements/svg';
import { bold, estimateSize, textHeight } from '../../typescript/svg/elements/text';

const size = estimateSize('Private key', 'bold');

const privateKeyRectangle = new Rectangle({ position: zeroPoint, size });
const privateKeyText = privateKeyRectangle.text(bold('Private key'));

const publicKeyRectangle = new Rectangle({ position: P(2 * size.x, 0), size });
const publicKeyText = publicKeyRectangle.text(bold('Public key'));

const lineOffset = 6;

const efficientLine = ConnectionLine(privateKeyRectangle, 'right', publicKeyRectangle, 'left', { color: 'green' }).move(P(0, -lineOffset));
const efficientText = efficientLine.text('Efficient', 'left', 10);

const infeasibleLine = ConnectionLine(publicKeyRectangle, 'left', privateKeyRectangle, 'right', { color: 'red' }).move(P(0, lineOffset));
const infeasibleText = infeasibleLine.text('Infeasible', 'left', 10);

const point1 = new InvisiblePoint({ point: P(0, -textHeight + 4) });
const point2 = new InvisiblePoint({ point: P(0, size.y + textHeight - 4) });

printSVG(efficientLine, efficientText, infeasibleLine, infeasibleText, privateKeyRectangle, privateKeyText, publicKeyRectangle, publicKeyText, point1, point2);
