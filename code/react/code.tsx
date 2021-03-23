import { ClickToCopy } from './copy';
import { Children, ClassName, ClickHandler, Title } from './utility';

export function CodeBlock({ wrapped, className = '', children }: { wrapped?: boolean } & ClassName & Children): JSX.Element {
    return <pre className={(wrapped ? 'wrapped ' : '') + className}>{children}</pre>;
}

export function InlineCode({ className = '', children }: ClassName & Children): JSX.Element {
    return <code className={className}>{children}</code>;
}

export function StaticOutput({ className = '', title, children }: ClassName & Title & Children): JSX.Element {
    return <span
        className={'static-output ' + className}
        title={title}
    >{children}</span>;
}

export function DynamicOutput({ className = '', title, onClick, onContextMenu, children }: ClassName & Title & ClickHandler & Children): JSX.Element {
    return <span
        className={'dynamic-output ' + className}
        title={title}
        onClick={onClick}
        onContextMenu={onContextMenu}
    >{children}</span>;
}

export function UserCommand({ className = '', children }: ClassName & Children): JSX.Element {
    return <div className={className}><b><ClickToCopy newline>{children}</ClickToCopy></b></div>;
}

export function SystemReply({ className = '', children }: ClassName & Children): JSX.Element {
    return <div className={'color-gray ' + className}>{children}</div>;
}

export function Comment({ className = '', children }: ClassName & Children): JSX.Element {
    return <div className={'color-gray ' + className} title="This is just a comment.">{children}</div>;
}
