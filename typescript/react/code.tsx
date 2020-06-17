import { createElement } from 'react';

import { Children } from './utility';

export const CodeBlock = ({ children }: Children) => <pre>{children}</pre>;

export const InlineCode = ({ children }: Children) => <code>{children}</code>;
