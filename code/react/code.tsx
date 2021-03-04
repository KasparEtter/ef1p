import { ClickToCopy } from './copy';
import { Children, ClassName, ClickHandler, Title } from './utility';

export function CodeBlock({ wrapped, children }: { wrapped?: boolean } & Children): JSX.Element {
    return <pre className={wrapped ? 'wrapped' : ''}>{children}</pre>;
}

export function InlineCode({ children }: Children): JSX.Element {
    return <code>{children}</code>;
}

export function StaticOutput({ className, title, children }: ClassName & Title & Children): JSX.Element {
    return <span
        className={'static-output' + (className ? ' ' + className : '')}
        title={title}
    >{children}</span>;
}

export function DynamicOutput({ className, title, onClick, onContextMenu, children }: ClassName & Title & ClickHandler & Children): JSX.Element {
    return <span
        className={'dynamic-output' + (className ? ' ' + className : '')}
        title={title}
        onClick={onClick}
        onContextMenu={onContextMenu}
    >{children}</span>;
}

export function UserCommand({ children }: Children): JSX.Element {
    return <div><b><ClickToCopy newline>{children}</ClickToCopy></b></div>;
}

export function SystemReply({ children }: Children): JSX.Element {
    return <div className="color-gray">{children}</div>;
}

export function Comment({ children }: Children): JSX.Element {
    return <div className="color-gray" title="This is just a comment.">{children}</div>;
}
