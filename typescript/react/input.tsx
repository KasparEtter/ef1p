import { ChangeEvent, Component, createElement, MouseEvent } from 'react';

import { KeysOf } from '../utility/types';
import { SomeEntries } from './entry';
import { Store } from './store';

export class RawInput<State extends { [key: string]: boolean | string }> extends Component<{ store: Store<State> } & State & SomeEntries<State>> {
    private readonly handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const key = target.name;
        this.props.store.setState({ [key]: value } as Partial<State>);
        const onChange = this.props.entries[key]!.onChange;
        if (onChange) {
            onChange();
        }
    }

    private readonly handleReset = (event: MouseEvent<HTMLButtonElement>) => {
        const key = event.currentTarget.name;
        const defaultValue = this.props.entries[key]!.defaultValue;
        this.props.store.setState({
            [key]: typeof defaultValue === 'function' ? defaultValue() : defaultValue,
        } as Partial<State>);
        const onChange = this.props.entries[key]!.onChange;
        if (onChange) {
            onChange();
        }
    }

    public render() {
        const entries = this.props.entries;
        return <div
            className="form-group"
        >
            {(Object.keys(entries) as KeysOf<State>).map(key => {
                const name = key as string;
                const entry = entries[key]!;
                const value = this.props[key];
                const validate = entry.validate;
                return <div
                    key={name}
                >
                    <span
                        title={entry.description}
                        style={{
                            display: 'inline-block',
                            width: '100px',
                            height: '30px',
                        }}
                    >
                        {entry.name}:
                    </span>
                    {
                        entry.type === 'boolean' &&
                        <span
                            className="custom-control custom-checkbox d-inline"
                        >
                            <input
                                id={name}
                                name={name}
                                type="checkbox"
                                checked={value as boolean}
                                onChange={this.handleChange}
                                className="custom-control-input"
                            />
                            <label
                                htmlFor={name}
                                className="custom-control-label"
                            >
                            </label>
                        </span>
                    }
                    {
                        entry.type === 'string' &&
                        <input
                            name={name}
                            value={value as string}
                            onChange={this.handleChange}
                            className="form-control d-inline"
                        />
                    }
                    {
                        validate && validate(value as string) &&
                        <span
                            style={{
                                color: '#e74c3c',
                                marginLeft: '10px',
                            }}
                        >
                            {validate(value as string)}
                        </span>
                    }
                    <button
                        name={name}
                        onClick={this.handleReset}
                        className="btn btn-primary btn-sm"
                        style={{
                            marginLeft: '10px',
                        }}
                    >
                        Reset
                    </button>
                </div>;
            })}
        </div>;
    }
}
