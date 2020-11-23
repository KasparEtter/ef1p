import { ChangeEvent, Component, MouseEvent } from 'react';

import { getRandomString, normalizeToArray, normalizeToValue } from '../utility/functions';
import { ObjectButNotFunction } from '../utility/types';

import { CustomInput, CustomTextarea } from './custom';
import { DynamicEntry, ErrorType, inputTypesWithHistory, numberInputTypes, ValueType } from './entry';
import { ProvidedStore } from './share';
import { AllEntries, clearState, getCurrentState, nextState, PersistedState, previousState, ProvidedDynamicEntries, setState } from './state';

export interface InputProps<State extends ObjectButNotFunction> {
    noHistory?: boolean; // Default: false.
    noLabels?: boolean; // Default: false.
    inline?: boolean; // Default: false.
    horizontal?: boolean; // Default: false.
    newColumn?: number; // Defaults to single column.
    submit?: string; // Defaults to no button.
    /**
     * For submit actions specific to this instantiation of the form.
     * It is triggered on pressing enter in one of the fields
     * or when the user clicks on the submit button.
     */
    onSubmit?: (newState: State) => any;
}

export class RawInput<State extends ObjectButNotFunction> extends Component<ProvidedStore<PersistedState<State>, AllEntries<State>> & ProvidedDynamicEntries<State> & InputProps<State>> {
    private readonly handle = (event: Event | ChangeEvent<any>, callOnChangeEvenWhenNoChange: boolean) => {
        const target = event.currentTarget as HTMLInputElement;
        const key = target.name as keyof State;
        // I don't know why I have to invert the checkbox value here.
        // It works without if the value is passed through `defaultChecked` instead of `checked` to the `CustomInput`.
        // However, with `defaultChecked`, other checkboxes representing the same value no longer update when the state of the value changes.
        const value = target.type === 'checkbox' ? !target.checked : (numberInputTypes.includes(target.type as any) ? Number(target.value) : target.value);
        setState(this.props.store, { [key]: value } as unknown as Partial<State>, callOnChangeEvenWhenNoChange);
    }

    private readonly onChange = (event: Event | ChangeEvent<any>) => {
        this.handle(event, false);
    }

    private readonly onEnter = (event: Event) => {
        this.handle(event, true);
        this.props.onSubmit?.(getCurrentState(this.props.store));
    }

    private readonly onInput = (event: Event) => {
        const target = event.currentTarget as HTMLInputElement;
        const value = numberInputTypes.includes(target.type as any) ? Number(target.value) : target.value;
        const key = target.name as keyof State;
        this.props.store.state.inputs[key] = value as any;
        this.props.store.state.errors[key] = false;
        this.props.store.update();
        const entry: DynamicEntry<any, State> = this.props.entries[key]!;
        const state = getCurrentState(this.props.store);
        normalizeToArray(entry.onInput).forEach(handler => handler(value, state));
    }

    private readonly onDetermine = async (event: MouseEvent<HTMLButtonElement>) => {
        const target = event.currentTarget as HTMLButtonElement;
        const key = target.name as keyof State;
        const entry: DynamicEntry<any, State> = this.props.entries[key]!;
        const state = getCurrentState(this.props.store);
        const [value, error] = await entry.determine!(state);
        if (error) {
            this.props.store.state.inputs[key] = value;
            this.props.store.state.errors[key] = false;
            this.props.store.update();
        } else {
            setState(this.props.store, { [key]: value } as Partial<State>);
        }
    }

    private readonly onSubmit = () => {
        const state = getCurrentState(this.props.store);
        normalizeToArray(this.props.store.meta.onChange).forEach(handler => handler(state, true));
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

    private readonly randomID = '-' + getRandomString();

    private labelWidth = 0;
    private someError = false;

    private renderEntry = (key: string) => {
        const entry = this.props.entries[key as keyof State] as DynamicEntry<ValueType, State>;
        const input = this.props.store.state.inputs[key as keyof State] as unknown as ValueType;
        const error = this.props.store.state.errors[key as keyof State] as ErrorType;
        const state = getCurrentState(this.props.store);
        const disabled = (this.someError && !error) ? true : (entry.disabled ? entry.disabled(state) : false);
        const history = inputTypesWithHistory.includes(entry.inputType);
        return <label
            key={key}
            title={entry.description + (disabled ? ' (Currently disabled.)' : '' )}
        >
            {
                !this.props.noLabels &&
                <span
                    className={'label-text' + (entry.inputType === 'textarea' ? ' label-for-textarea' : '') + ' cursor-help' + (disabled ? ' text-gray' : '')}
                    style={this.props.horizontal ? {} : { width: this.labelWidth + 'px' }}
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
                    {entry.selectOptions && Object.entries(normalizeToValue(entry.selectOptions, state)).map(
                        ([key, text]) => <option value={key} selected={key === input}>{text}</option>,
                    )}
                </select>
            }
            {
                entry.inputType === 'textarea' &&
                <span className="d-inline-block">
                    <CustomTextarea
                        name={key}
                        className={'form-control' + (error ? ' is-invalid' : '')}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        placeholder={normalizeToValue(entry.placeholder, state)}
                        disabled={disabled}
                        onChange={this.onChange}
                        onInput={this.onInput}
                        value={input as string}
                        rows={entry.rows ?? 5}
                        style={entry.inputWidth ? { width: entry.inputWidth + 'px' } : {}}
                    />
                    {
                        error &&
                        <div className="invalid-feedback">
                            {error}
                        </div>
                    }
                </span>
            }
            { // inputType: 'number' | 'range' | 'text' | 'password' | 'date' | 'color';
                entry.inputType !== 'checkbox' && entry.inputType !== 'switch' && entry.inputType !== 'select' && entry.inputType !== 'textarea' &&
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
                        placeholder={normalizeToValue(entry.placeholder, state)}
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
                            {normalizeToValue(entry.suggestedValues ?? [], state).concat(
                                this.props.store.state.states.map(object => object[key as keyof State] as unknown as ValueType),
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
            {
                entry.determine &&
                <button name={key} type="button" className="btn btn-primary btn-sm align-top ml-2" onClick={this.onDetermine} disabled={disabled} title="Determine a suitable value.">Determine</button>
            }
        </label>;
    };

    private renderSubmitButton = () => {
        return this.props.submit && (this.props.store.meta.onChange || this.props.onSubmit) &&
            <button
                type="button"
                className="label btn btn-sm btn-primary"
                onClick={this.onSubmit}
                disabled={this.someError}
                title={this.someError ? 'Make sure that there are no errors.' : 'Submit the input fields.'}
            >{this.props.submit}</button>;
    };

    private renderHistoryButtons = () => {
        return !this.props.noHistory &&
            <div
                className="label btn-icon btn-group btn-group-sm"
                role="group"
                aria-label="Walk through the history of values."
            >
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.onPrevious}
                    disabled={this.props.store.state.index === 0}
                    title="Go back to the previous set of values."
                >
                    <i className="fas fa-undo-alt"></i>
                </button>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.onClear}
                    disabled={this.props.store.state.states.length === 1}
                    title="Erase the history of entered values."
                >
                    <i className="fas fa-trash-alt"></i>
                </button>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.onNext}
                    disabled={this.props.store.state.index === this.props.store.state.states.length - 1}
                    title="Advance to the next set of values."
                >
                    <i className="fas fa-redo-alt"></i>
                </button>
            </div>;
    };

    public render(): JSX.Element {
        const entries = this.props.entries;
        const keys = Object.keys(entries);
        this.labelWidth = Object.values(entries).reduce((width, entry) => Math.max(width, entry!.labelWidth), 0);
        this.someError = Object.values(this.props.store.state.errors).some(error => error);
        const newColumn = this.props.newColumn;
        if (newColumn !== undefined) {
            return <div className="block-form vertical-form row">
                <div className="col-md">
                    {keys.slice(0, newColumn).map(this.renderEntry)}
                </div>
                <div className="col-md">
                    {keys.slice(newColumn).map(this.renderEntry)}
                    {this.renderSubmitButton()}
                    {this.renderHistoryButtons()}
                </div>
            </div>;
        } else {
            return <div className={
                (this.props.inline ? 'inline-form' : 'block-form') + ' ' +
                (this.props.horizontal ? 'horizontal-form' : 'vertical-form')
            }>
                {keys.map(this.renderEntry)}
                {this.renderSubmitButton()}
                {this.renderHistoryButtons()}
            </div>;
        }
    }
}
