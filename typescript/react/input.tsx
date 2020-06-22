import { ChangeEvent, Component, createElement } from 'react';

import { normalizeToArray, normalizeToValue } from '../utility/functions';
import { KeysOf } from '../utility/types';

import { CustomInput } from './custom';
import { DynamicEntry, inputTypesWithHistory, numberInputTypes, ProvidedDynamicEntries, StateWithOnlyValues } from './entry';
import { ProvidedStore } from './share';
import { clear, isValueWithHistory, next, previous, setValue, Value, ValueType } from './value';

export interface RawInputProps {
    noLabels?: boolean; // Default: false.
    inline?: boolean; // Default: false.
    horizontal?: boolean; // Default: false.
}

export class RawInput<State extends StateWithOnlyValues> extends Component<ProvidedStore<State> & ProvidedDynamicEntries<State> & RawInputProps> {
    private readonly triggerChange = (key: string) => {
        this.props.store.updateComponents();
        const onChange = this.props.entries[key]!.onChange;
        normalizeToArray(onChange).forEach(handler => handler());
    }

    private readonly onChange = (event: Event | ChangeEvent<any>) => {
        const target = event.target as HTMLInputElement;
        const key = target.name;
        // I don't know why I have to invert the checkbox value here.
        // It works without if the value is passed through `defaultChecked` instead of `checked` to the `CustomInput`.
        // However, with `defaultChecked`, other checkboxes representing the same value no longer update when the state of the value changes.
        const value = target.type === 'checkbox' ? !target.checked : (numberInputTypes.includes(target.type as any) ? Number(target.value) : target.value);
        const validate = this.props.entries[key]!.validate;
        if (validate) {
            const error = validate(value as string);
            if (error) {
                this.props.store.state[key].error = error;
                this.props.store.updateComponents();
                return;
            }
        }
        setValue(this.props.store.state[key], value);
        this.triggerChange(key);
    }

    private readonly onInput = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const value = target.value;
        const key = target.name;
        this.props.store.state[key].input = value;
        this.props.store.state[key].error = false;
        this.props.store.updateComponents();
    }

    private readonly onPrevious = (event: KeyboardEvent) => {
        const target = event.target as HTMLInputElement;
        if (previous(this.props.store.state[target.name])) {
            this.triggerChange(target.name);
        }
    }

    private readonly onNext = (event: KeyboardEvent) => {
        const target = event.target as HTMLInputElement;
        if (next(this.props.store.state[target.name])) {
            this.triggerChange(target.name);
        }
    }

    private readonly onClear = (event: KeyboardEvent) => {
        const target = event.target as HTMLInputElement;
        if (clear(this.props.store.state[target.name])) {
            this.props.store.updateComponents();
        }
    }

    private readonly randomID = '-' + Math.random().toString(36).substr(2, 8);

    public render() {
        const entries = this.props.entries;
        const maxLabelWidth = Object.values(entries).reduce((width, entry) => Math.max(width, entry!.labelWidth), 0);
        return <div className={
            (this.props.inline ? 'inline-form' : 'block-form') + ' ' +
            (this.props.horizontal ? 'horizontal-form' : 'vertical-form')
        }>
            {(Object.keys(entries) as KeysOf<State>).map(rawKey => {
                const key = '' + rawKey;
                const entry = entries[key] as DynamicEntry<ValueType>;
                const value = this.props.store.state[key] as Value<ValueType>;
                const disabled = entry.disabled ? entry.disabled() : false;
                const history = inputTypesWithHistory.includes(entry.inputType);
                return <label
                    key={key}
                    title={entry.description}
                >
                    {
                        !this.props.noLabels &&
                        <span
                            className="label"
                            style={this.props.horizontal ? {} : { width: maxLabelWidth + 'px' }}
                        >
                            {entry.name}:
                        </span>
                    }{
                        (entry.inputType === 'checkbox' || entry.inputType === 'switch') &&
                        <span className={`custom-control custom-${entry.inputType} d-inline`}>
                            <CustomInput
                                name={key}
                                type="checkbox"
                                className="custom-control-input"
                                checked={value.input as boolean}
                                disabled={disabled}
                                onChange={this.onChange}
                            />
                            <span className="custom-control-label"></span>
                        </span>
                    }{
                        entry.inputType === 'select' &&
                        <select
                            name={key}
                            className="custom-select"
                            onChange={this.onChange}
                        >
                            {entry.selectOptions && Object.entries(entry.selectOptions).map(
                                ([key, text]) => <option value={key} selected={key === value.input}>{text}</option>,
                            )}
                        </select>
                    }{ // inputType: 'number' | 'range' | 'text' | 'password' | 'date' | 'color';
                        entry.inputType !== 'checkbox' && entry.inputType !== 'switch' && entry.inputType !== 'select' &&
                        <span className="d-inline-block">
                            <CustomInput
                                name={key}
                                type={entry.inputType}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                className={(entry.inputType === 'range' ? 'custom-range' : (entry.inputType === 'color' ? 'custom-color' : 'form-control')) + (value.error ? ' is-invalid' : '')}
                                value={value.input as string | number}
                                min={entry.minValue as string | number | undefined}
                                max={entry.maxValue as string | number | undefined}
                                step={entry.stepValue as string | number | undefined}
                                disabled={disabled}
                                onChange={this.onChange}
                                onInput={this.onInput}
                                onPrevious={this.onPrevious}
                                onNext={this.onNext}
                                onClear={this.onClear}
                                list={history ? key + this.randomID : undefined}
                                style={entry.inputWidth ? { width: entry.inputWidth + 'px' } : {}}
                            />
                            {
                                history &&
                                <datalist id={key + this.randomID}>
                                    {isValueWithHistory(value) &&
                                    (entry.suggestedValues ? normalizeToValue(entry.suggestedValues) : []).concat(value.history).reverse().filter(
                                        option => option !== value.input,
                                    ).map(
                                        option => <option value={'' + option}/>,
                                    )}
                                </datalist>
                            }{
                                value.error &&
                                <div className="invalid-feedback">
                                    {value.error}
                                </div>
                            }
                        </span>
                    }
                </label>;
            })}
        </div>;
    }
}
