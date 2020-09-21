import { ChangeEvent, Component, createElement } from 'react';

import { normalizeToArray, normalizeToValue } from '../utility/functions';

import { CustomInput } from './custom';
import { AllEntries, clearState, DynamicEntry, getCurrentState, inputTypesWithHistory, nextState, numberInputTypes, PersistedState, previousState, ProvidedDynamicEntries, setState, StateWithOnlyValues, ValueType } from './entry';
import { ProvidedStore } from './share';

export interface RawInputProps<State extends StateWithOnlyValues> {
    noHistory?: boolean; // Default: false.
    noLabels?: boolean; // Default: false.
    inline?: boolean; // Default: false.
    horizontal?: boolean; // Default: false.
    submit?: string; // Defaults to no button.
    onSubmit?: (newState: State) => any;
}

export class RawInput<State extends StateWithOnlyValues> extends Component<ProvidedStore<PersistedState<State>, AllEntries<State>> & ProvidedDynamicEntries<State> & RawInputProps<State>> {
    private readonly handle = (event: Event | ChangeEvent<any>, forceUpdate: boolean) => {
        const target = event.target as HTMLInputElement;
        const key: keyof State = target.name;
        // I don't know why I have to invert the checkbox value here.
        // It works without if the value is passed through `defaultChecked` instead of `checked` to the `CustomInput`.
        // However, with `defaultChecked`, other checkboxes representing the same value no longer update when the state of the value changes.
        const value = target.type === 'checkbox' ? !target.checked : (numberInputTypes.includes(target.type as any) ? Number(target.value) : target.value);
        setState(this.props.store, { [key]: value } as Partial<State>, forceUpdate);
    }

    private readonly onChange = (event: Event | ChangeEvent<any>) => {
        this.handle(event, false);
    }

    private readonly onEnter = (event: Event | ChangeEvent<any>) => {
        this.handle(event, true);
        this.props.onSubmit?.(getCurrentState(this.props.store));
    }

    private readonly onInput = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const value = numberInputTypes.includes(target.type as any) ? Number(target.value) : target.value;
        const key: keyof State = target.name;
        this.props.store.state.inputs[key] = value as any;
        this.props.store.state.errors[key] = false;
        this.props.store.update();
    }

    private readonly onSubmit = () => {
        const state = getCurrentState(this.props.store);
        this.props.store.meta.onChange?.(state);
        this.props.onSubmit?.(state);
    }

    private readonly onPrevious = () => {
        previousState(this.props.store);
    }

    private readonly onNext = () => {
        nextState(this.props.store);
    }

    private readonly onClear = () => {
        if (confirm(`Are you sure you want to erase the history of ${this.props.store.state.states.length} entered values?`)) {
            clearState(this.props.store);
        }
    }

    private readonly randomID = '-' + Math.random().toString(36).substr(2, 8);

    public render() {
        const entries = this.props.entries;
        const maxLabelWidth = Object.values(entries).reduce((width, entry) => Math.max(width, entry!.labelWidth), 0);
        const errors = !Object.values(this.props.store.state.errors).every(error => !error);
        return <div className={
            (this.props.inline ? 'inline-form' : 'block-form') + ' ' +
            (this.props.horizontal ? 'horizontal-form' : 'vertical-form')
        }>
            {(Object.keys(entries)).map(key => {
                const entry = entries[key] as DynamicEntry<ValueType>;
                const input = this.props.store.state.inputs[key];
                const error = this.props.store.state.errors[key];
                const disabled = entry.disabled ? entry.disabled() : false;
                const history = inputTypesWithHistory.includes(entry.inputType);
                return <label
                    key={key}
                    title={entry.description}
                >
                    {
                        !this.props.noLabels &&
                        <span
                            className="label-text"
                            style={this.props.horizontal ? {} : { width: maxLabelWidth + 'px' }}
                        >
                            {entry.name}:
                        </span>
                    }
                    {
                        (entry.inputType === 'checkbox' || entry.inputType === 'switch') &&
                        <span className={`custom-control custom-${entry.inputType}`}>
                            <CustomInput
                                name={key}
                                type="checkbox"
                                className="custom-control-input"
                                checked={input as boolean}
                                disabled={disabled}
                                onChange={this.onChange}
                            />
                            <span className="custom-control-label"></span>
                        </span>
                    }
                    {
                        entry.inputType === 'select' &&
                        <select
                            name={key}
                            className="custom-select"
                            disabled={disabled}
                            onChange={this.onChange}
                        >
                            {entry.selectOptions && Object.entries(entry.selectOptions).map(
                                ([key, text]) => <option value={key} selected={key === input}>{text}</option>,
                            )}
                        </select>
                    }
                    { // inputType: 'number' | 'range' | 'text' | 'password' | 'date' | 'color';
                        entry.inputType !== 'checkbox' && entry.inputType !== 'switch' && entry.inputType !== 'select' &&
                        <span className="d-inline-block">
                            <CustomInput
                                name={key}
                                type={entry.inputType}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                className={(entry.inputType === 'range' ? 'custom-range' : (entry.inputType === 'color' ? 'custom-color' : 'form-control')) + (error ? ' is-invalid' : '')}
                                value={input as string | number}
                                min={entry.minValue as string | number | undefined}
                                max={entry.maxValue as string | number | undefined}
                                step={entry.stepValue as string | number | undefined}
                                placeholder={entry.placeholder}
                                disabled={disabled}
                                onChange={this.onChange}
                                onInput={this.onInput}
                                onEnter={this.onEnter}
                                list={history ? key + this.randomID : undefined}
                                style={entry.inputWidth ? { width: entry.inputWidth + 'px' } : {}}
                            />
                            {
                                history &&
                                <datalist id={key + this.randomID}>
                                    {normalizeToArray(normalizeToValue(entry.suggestedValues)).concat(
                                        this.props.store.state.states.map(object => object[key]),
                                    ).reverse().filter(
                                        (option, index, self) => option !== input && self.indexOf(option) === index,
                                    ).map(
                                        option => <option value={'' + option}/>,
                                    )}
                                </datalist>
                            }
                            {
                                error &&
                                <div className="invalid-feedback">
                                    {error}
                                </div>
                            }
                        </span>
                    }
                    {
                        entry.inputType === 'range' &&
                        <span className="range-value">{input}</span>
                    }
                </label>;
            })}
            {
                this.props.submit && (this.props.store.meta.onChange || this.props.onSubmit) &&
                <button type="button" className="label btn btn-sm btn-primary" onClick={this.onSubmit} disabled={errors} title={errors ? 'Make sure that there are no errors.' : 'Submit the input fields.'}>{this.props.submit}</button>
            }
            {
                !this.props.noHistory &&
                <div className="label btn-icon btn-group btn-group-sm" role="group" aria-label="Walk through the history of values.">
                    <button type="button" className="btn btn-primary" onClick={this.onPrevious} disabled={this.props.store.state.index === 0} title="Go back to the previous set of values."><i className="fas fa-undo-alt"></i></button>
                    <button type="button" className="btn btn-primary" onClick={this.onClear} disabled={this.props.store.state.states.length === 1} title="Erase the history of entered values."><i className="fas fa-trash-alt"></i></button>
                    <button type="button" className="btn btn-primary" onClick={this.onNext} disabled={this.props.store.state.index === this.props.store.state.states.length - 1} title="Advance to the next set of values."><i className="fas fa-redo-alt"></i></button>
                </div>
            }
        </div>;
    }
}
