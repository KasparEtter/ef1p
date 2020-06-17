import { Component, createElement, Fragment, MouseEvent } from 'react';

import { copyToClipboard } from '../utility/clipboard';

import { Children } from './utility';

export class Command extends Component<Children, { copyHint: boolean }> {
    public readonly state = { copyHint: false };

    private readonly timeOut = () => this.setState({ copyHint: false });

    private readonly handleClick = (event: MouseEvent<HTMLSpanElement>) => {
        copyToClipboard(event.currentTarget.innerText);
        this.setState({ copyHint: true });
        setTimeout(this.timeOut, 1000);
    }

    public render() {
        return <Fragment>
            <span
                onClick={this.handleClick}
                className={'command' + (this.state.copyHint ? ' copied-command' : '' )}
            >
                {this.props.children}
            </span>
            {
                this.state.copyHint &&
                <span className="copy-hint">
                    Command copied!
                </span>
            }
        </Fragment>;
    }
}
