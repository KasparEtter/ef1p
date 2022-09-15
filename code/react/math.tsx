/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import katex from 'katex';
import { useEffect, useRef } from 'react';

export interface MathProps {
    readonly text: string;
    readonly displayMode?: boolean;
}

export function Math({ text, displayMode }: MathProps): JSX.Element {
    const reference = useRef(null);
    useEffect(() => katex.render(text, reference.current!, { displayMode }));
    return <span ref={reference} />;
}
