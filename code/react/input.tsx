import { ChangeEvent, Component, Fragment, MouseEvent } from 'react';

import { getRandomString, normalizeToArray, normalizeToValue } from '../utility/functions';
import { Button, ObjectButNotFunction } from '../utility/types';

import { CustomInput, CustomTextarea } from './custom';
import { DynamicEntry, ErrorType, inputTypesWithHistory, numberInputTypes, ValueType } from './entry';
import { ProvidedStore } from './share';
import { AllEntries, clearErrors, clearState, getCurrentState, hasNoErrors, nextState, previousState, ProvidedDynamicEntries, setState, validateInputs, VersionedState, VersioningEvent } from './state';

export interface InputProps<State extends ObjectButNotFunction> {
    /**
     * Whether to skip the history buttons.
     */
    noHistory?: boolean;

    /**
     * Whether to skip the input labels.
     */
    noLabels?: boolean;

    /**
     * Whether to set labels to their individual width.
     * This value is only used if 'newColumnAt' is provided.
     */
    individualLabelWidth?: boolean;

    /**
     * The index of the first entry to break into a second column.
     * Results in a vertical form with two columns if provided,
     * horizontal form otherwise.
     */
    newColumnAt?: number;

    /**
     * Whether to display the form inline instead of blocking.
     * This value is ignored if 'newColumnAt' is provided.
     */
    inline?: boolean;

    /**
     * For submit actions specific to this instantiation of the form.
     * It is triggered when the user presses enter in one of the fields or clicks on the button.
     */
    submit?: Button<State>;
}

export class RawInput<State extends ObjectButNotFunction> extends Component<ProvidedStore<VersionedState<State>, AllEntries<State>, VersioningEvent> & ProvidedDynamicEntries<State> & InputProps<State>> {
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
        if (hasNoErrors(this.props.store)) {
            this.props.submit?.onClick(getCurrentState(this.props.store));
        }
    }

    private readonly onInput = (event: Event) => {
        const target = event.currentTarget as HTMLInputElement;
        const value = numberInputTypes.includes(target.type as any) ? Number(target.value) : target.value;
        const key = target.name as keyof State;
        this.props.store.state.inputs[key] = value as any;
        clearErrors(this.props.store);
        this.props.store.update('input');
        const entry: DynamicEntry<any, State> = this.props.entries[key]!;
        const state = getCurrentState(this.props.store);
        normalizeToArray(entry.onInput).forEach(handler => handler(value, state));
    }

    private readonly onDetermine = async (event: MouseEvent<HTMLButtonElement>) => {
        const target = event.currentTarget as HTMLButtonElement;
        const key = target.name as keyof State;
        const entry: DynamicEntry<any, State> = this.props.entries[key]!;
        const state = getCurrentState(this.props.store);
        const [value, error] = await entry.determine!.onClick(state);
        if (error) {
            this.props.store.state.inputs[key] = value;
            this.props.store.state.errors[key] = error;
            this.props.store.update('input');
        } else {
            setState(this.props.store, { [key]: value } as Partial<State>);
        }
    }

    private readonly onSubmit = () => {
        validateInputs(this.props.store);
        if (hasNoErrors(this.props.store)) {
            const state = getCurrentState(this.props.store);
            normalizeToArray(this.props.store.meta.onChange).forEach(handler => handler(state, true));
            this.props.submit?.onClick(state);
        }
    }

    private readonly onPrevious = () => {
        previousState(this.props.store);
    }

    private readonly onNext = () => {
        nextState(this.props.store);
    }

    private readonly onClear = () => {
        if (confirm(`Are you sure you want to erase the history of ${this.props.store.state.states.length - 1} entered values?`)) {
            clearState(this.props.store);
        }
    }

    private readonly onCancel = () => {
        this.props.store.state.inputs = { ...getCurrentState(this.props.store) }; // It has to be a copy.
        clearErrors(this.props.store);
        this.props.store.update('input');
    }

    private readonly randomID = '-' + getRandomString();

    private renderEntry = (key: string, hasErrors: boolean, labelWidth: number) => {
        const entry = this.props.entries[key as keyof State] as DynamicEntry<ValueType, State>;
        const input = this.props.store.state.inputs[key as keyof State] as unknown as ValueType;
        const error = this.props.store.state.errors[key as keyof State] as ErrorType;
        const disabled = !error && (hasErrors ? true : (entry.disabled ? entry.disabled(this.props.store.state.inputs) : false));
        const history = inputTypesWithHistory.includes(entry.inputType);
        const state = getCurrentState(this.props.store);
        return <label
            key={key}
            title={entry.description + (disabled ? ' (Currently disabled.)' : '' )}
        >
            {
                !this.props.noLabels &&
                <span
                    className={'label-text' + (entry.inputType === 'textarea' ? ' label-for-textarea' : '') + ' cursor-help' + (disabled ? ' text-gray' : '')}
                    style={this.props.newColumnAt ? { width: (this.props.individualLabelWidth ? entry.labelWidth : labelWidth) + 'px' } : {}}
                >
                    {entry.name}:
                </span>
            }
            <span className="d-inline-block">
                {
                    (entry.inputType === 'checkbox' || entry.inputType === 'switch') &&
                    <span className={'custom-control custom-' + entry.inputType + (error ? ' is-invalid' : '')}>
                        <CustomInput
                            name={key}
                            type="checkbox"
                            className={'custom-control-input' + (error ? ' is-invalid' : '')}
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
                        className={'custom-select' + (error ? ' is-invalid' : '')}
                        disabled={disabled}
                        onChange={this.onChange}
                    >
                        {entry.selectOptions && Object.entries(normalizeToValue(entry.selectOptions, state)).map(
                            ([key, text]) => <option key={key} value={key} selected={key === input}>{text}</option>,
                        )}
                    </select>
                }
                {
                    entry.inputType === 'textarea' &&
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
                }
                { // inputType: 'number' | 'range' | 'text' | 'password' | 'date' | 'color';
                    entry.inputType !== 'checkbox' && entry.inputType !== 'switch' && entry.inputType !== 'select' && entry.inputType !== 'textarea' &&
                    <Fragment>
                        {
                            history &&
                            <datalist id={key + this.randomID}>
                                {normalizeToValue(entry.suggestedValues ?? [], state).concat(
                                    this.props.store.state.states.map(object => object[key as keyof State] as unknown as ValueType),
                                ).reverse().filter(
                                    (option, index, self) => option !== input && self.indexOf(option) === index,
                                ).map(
                                    option => <option key={'' + option} value={'' + option}/>,
                                )}
                            </datalist>
                        }
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
                    </Fragment>
                }
                {
                    error &&
                    <div className="invalid-feedback">
                        {error}
                    </div>
                }
            </span>
            {
                entry.inputType === 'range' &&
                <span className="range-value">{input}</span>
            }
            {
                entry.determine &&
                <button name={key} type="button" className="btn btn-primary btn-sm align-top ml-2" onClick={this.onDetermine} disabled={disabled} title={entry.determine.title}>{entry.determine.text}</button>
            }
        </label>;
    };

    private renderSubmitButton = (hasErrors: boolean) => {
        return this.props.submit &&
            <button
                type="button"
                className="label btn btn-sm btn-primary input-buttons-group"
                onClick={this.onSubmit}
                disabled={hasErrors}
                title={hasErrors ? 'Make sure that there are no errors.' : this.props.submit.title}
            >{this.props.submit.text}</button>;
    };

    private renderHistoryButtons = () => {
        return !this.props.noHistory &&
            <span className="label btn-icon btn-group btn-group-sm">
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
            </span>;
    };

    private renderCancelButton = (hasErrors: boolean) => {
        return hasErrors &&
            <button
                type="button"
                className="label btn btn-sm btn-primary"
                onClick={this.onCancel}
                title="Return to the valid state before before the error."
            >Cancel</button>;
    };

    private renderButtons = (hasErrors: boolean) => {
        const submitButton = this.renderSubmitButton(hasErrors);
        const historyButtons = this.renderHistoryButtons();
        const cancelButton = this.renderCancelButton(hasErrors);
        return (submitButton || historyButtons || cancelButton) &&
            <span className="horizontal-form">
                {submitButton}
                {historyButtons}
                {cancelButton}
            </span>;
    };

    public render(): JSX.Element {
        const entries = this.props.entries;
        const keys = Object.keys(entries);
        const hasErrors = !hasNoErrors(this.props.store);
        const labelWidth = this.props.individualLabelWidth || !this.props.newColumnAt ?
            0 : Math.max(...Object.values(entries).map(entry => entry!.labelWidth));
        const newColumn = this.props.newColumnAt;
        if (newColumn) {
            return <div className="block-form vertical-form row">
                <div className="col-md">
                    {keys.slice(0, newColumn).map(key => this.renderEntry(key, hasErrors, labelWidth))}
                </div>
                <div className="col-md">
                    {keys.slice(newColumn).map(key => this.renderEntry(key, hasErrors, labelWidth))}
                    {this.renderButtons(hasErrors)}
                </div>
            </div>;
        } else {
            return <div className={(this.props.inline ? 'inline-form' : 'block-form') + ' horizontal-form'}>
                {keys.map(key => this.renderEntry(key, hasErrors, labelWidth))}
                {this.renderButtons(hasErrors)}
            </div>;
        }
    }
}
