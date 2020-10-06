import { createElement } from 'react';

import { Children, ClickHandler, Title } from './utility';

export function CodeBlock({ children }: Children): JSX.Element {
    return <pre>{children}</pre>;
}

export function InlineCode({ children }: Children): JSX.Element {
    return <code>{children}</code>;
}

export function StaticOutput({ title, children }: Title & Children): JSX.Element {
    return <span
        className="static-output"
        title={title}
    >{children}</span>;
}

export function DynamicOutput({ title, onClick, onContextMenu, children }: Title & ClickHandler & Children): JSX.Element {
    return <span
        className="dynamic-output"
        title={title}
        onClick={onClick}
        onContextMenu={onContextMenu}
    >{children}</span>;
}
