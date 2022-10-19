/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Color } from '../../../code/utility/color';

import { defaultCornerRadius, doubleStrokeWidth, doubleStrokeWidthMargin, strokeWidth, textToLineDistance } from '../../../code/svg/utility/constants';
import { P, zeroPoint } from '../../../code/svg/utility/point';

import { VisualElement } from '../../../code/svg/elements/element';
import { InvisiblePoint } from '../../../code/svg/elements/invisible';
import { Rectangle } from '../../../code/svg/elements/rectangle';
import { printSVG } from '../../../code/svg/elements/svg';
import { bold, estimateTextSizeWithMargin, outOfFlow, subscript, superscript, T, Text, TextLine } from '../../../code/svg/elements/text';

export function printClassification(
    leftText: TextLine[],
    rightText: TextLine[],
    leftColor: Color = 'green',
) {
    const elements = new Array<VisualElement>();

    const leftRectangle = new Rectangle({
        position: zeroPoint,
        size: estimateTextSizeWithMargin(leftText),
        color: leftColor,
    });
    elements.push(leftRectangle, leftRectangle.text(leftText));

    const rightRectangle = new Rectangle({
        position: P(leftRectangle.props.size.x + 2 * strokeWidth, 0),
        size: estimateTextSizeWithMargin(rightText),
        color: 'red',
    });
    elements.push(rightRectangle, rightRectangle.text(rightText));

    const surroundingRectangle = new Rectangle({
        position: doubleStrokeWidthMargin.invert(),
        size: P(
            leftRectangle.props.size.x + rightRectangle.props.size.x + 3 * doubleStrokeWidth,
            leftRectangle.props.size.y + 2 * doubleStrokeWidth,
        ),
        color: 'blue',
        cornerRadius: defaultCornerRadius + doubleStrokeWidth,
    });
    elements.push(surroundingRectangle);
    elements.push(new Text({
        position: surroundingRectangle.boundingBox().pointAt('top').subtractY(textToLineDistance),
        text: T(bold('Candidates '), 'ℤ', outOfFlow(subscript('n')), outOfFlow(superscript('0')), superscript(' ⁄')),
        verticalAlignment: 'bottom',
        color: 'blue',
    }));

    elements.push(new InvisiblePoint({
        point: P(0, -32),
    }))

    printSVG(...elements);
}
