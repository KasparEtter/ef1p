/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { ChangeEvent, Component, Fragment, MouseEvent } from 'react';
import ReactDOM from 'react-dom';

import { report } from '../utility/analytics';
import { copyToClipboardWithAnimation } from '../utility/animation';
import { colorClass } from '../utility/color';
import { normalizeToArray, normalizeToValue } from '../utility/normalization';
import { getRandomString } from '../utility/string';
import { Button, ObjectButNotFunction } from '../utility/types';

import { estimateStringWidth } from '../svg/utility/string';

import { CustomInput, CustomTextarea } from './custom';
import { DynamicEntry, ErrorType, inputTypesWithArtificialOnInput, inputTypesWithHistory, numberInputTypes, ValueType } from './entry';
import { ProvidedStore, shareStore } from './share';
import { AllEntries, clearErrors, clearState, DynamicEntries, encodeInputs, getCurrentState, hasNoErrors, nextState, previousState, ProvidedDynamicEntries, setState, validateInputs, VersionedState, VersioningEvent } from './state';
import { Store } from './store';

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
     * When there are no errors, the general change handler is called before the click handler.
     */
    submit?: Button<State>;
}

function getValue(target: HTMLInputElement | HTMLSelectElement): ValueType {
    if (target.type === 'checkbox') {
        // I don't know why I have to invert the checkbox value here.
        // It works without if the value is passed through `defaultChecked` instead of `checked` to the `CustomInput`.
        // However, with `defaultChecked`, other checkboxes representing the same value no longer update when the state of the value changes.
        return !(target as HTMLInputElement).checked;
    } else if (target.multiple) {
        return [...(target as HTMLSelectElement).options].filter(option => option.selected).map(option => option.value);
    } else if (numberInputTypes.includes(target.type as any)) {
        return Number(target.value);
    } else {
        return target.value;
    }
}

function getLabelWidth(entry: DynamicEntry<any, any>): number {
    if (entry.labelWidth !== undefined) {
        return entry.labelWidth;
    } else {
        return Math.ceil(estimateStringWidth(entry.name + ':') + 0.1);
    }
}

export class RawInput<State extends ObjectButNotFunction> extends Component<ProvidedStore<VersionedState<State>, AllEntries<State>, VersioningEvent> & Partial<ProvidedDynamicEntries<State>> & InputProps<State>> {
    private readonly entries = this.props.entries !== undefined ? this.props.entries : this.props.store.meta.entries as Partial<DynamicEntries<State>>;

    private readonly handle = (event: Event | ChangeEvent<any>, callMetaOnChangeEvenWhenNothingChanged: boolean) => {
        const target = event.currentTarget as HTMLInputElement | HTMLSelectElement;
        const key = target.name as keyof State;
        const value = getValue(target);
        const entry: DynamicEntry<any, State> = this.entries[key]!;
        if (inputTypesWithArtificialOnInput.includes(entry.inputType)) {
            const state = getCurrentState(this.props.store);
            normalizeToArray(entry.onInput).forEach(handler => handler(value, state, this.props.store));
        }
        const partialNewState = { [key]: value } as unknown as Partial<State>;
        setState(this.props.store, partialNewState, callMetaOnChangeEvenWhenNothingChanged);
    }

    private readonly onChange = (event: Event | ChangeEvent<any>) => {
        this.handle(event, false);
    }

    private readonly onEnter = (event: KeyboardEvent) => {
        this.handle(event, true);
        if (hasNoErrors(this.props.store)) {
            this.props.submit?.onClick(getCurrentState(this.props.store));
        }
    }

    private readonly onInput = (event: Event) => {
        const target = event.currentTarget as HTMLInputElement;
        const key = target.name as keyof State;
        const value = getValue(target);
        this.props.store.state.inputs[key] = value as any;
        clearErrors(this.props.store);
        this.props.store.update('input');
        const entry: DynamicEntry<any, State> = this.entries[key]!;
        const state = getCurrentState(this.props.store);
        normalizeToArray(entry.onInput).forEach(handler => handler(value, state, this.props.store));
    }

    private readonly onUpOrDown = (event: KeyboardEvent) => {
        const target = event.currentTarget as HTMLInputElement;
        const key = target.name as keyof State;
        const entry: DynamicEntry<ValueType, State> = this.entries[key]!;
        const inputs = this.props.store.state.inputs;
        if (entry.inputType === 'number') {
            const step = (entry.stepValue as number | undefined ?? 1) * (event.key === 'ArrowUp' ? 1 : -1);
            while (true) {
                const value = inputs[key] as unknown as number + step;
                if (entry.minValue !== undefined && value < entry.minValue) {
                    inputs[key] = entry.minValue as any;
                    break;
                } else if (entry.maxValue !== undefined && value > entry.maxValue) {
                    inputs[key] = entry.maxValue as any;
                    break;
                } else {
                    inputs[key] = value as any;
                    validateInputs(this.props.store);
                    if (hasNoErrors(this.props.store)) {
                        break;
                    }
                }
            }
        } else if (entry.onUpOrDown) {
            inputs[key] = entry.onUpOrDown(event.key === 'ArrowUp' ? 'up' : 'down', inputs[key] as unknown as string, inputs) as any;
        }
        const value = inputs[key] as any;
        const state = getCurrentState(this.props.store);
        normalizeToArray(entry.onInput).forEach(handler => handler(value, state, this.props.store));
        setState(this.props.store);
    }

    private readonly onDetermine = async (event: MouseEvent<HTMLButtonElement>) => {
        const target = event.currentTarget as HTMLButtonElement;
        const key = target.name as keyof State;
        const entry: DynamicEntry<any, State> = this.entries[key]!;
        const text = target.dataset.text;
        const buttons = normalizeToArray(entry.determine).filter(button => button.text === text);
        if (buttons.length === 1) {
            const input = this.props.store.state.inputs[key];
            const state = getCurrentState(this.props.store);
            const [value, error] = await buttons[0].onClick(input, state);
            if (error) {
                this.props.store.state.inputs[key] = value;
                this.props.store.state.errors[key] = error;
                this.props.store.update('input');
            } else {
                setState(this.props.store, { [key]: value } as Partial<State>);
            }
        } else {
            throw new Error(`Could not find the button with the text '${text}'.`);
        }
    }

    private readonly onSubmit = () => {
        validateInputs(this.props.store);
        this.props.store.update('input');
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

    private readonly onShare = (event: MouseEvent<HTMLButtonElement>) => {
        let element: Element | null = ReactDOM.findDOMNode(this) as Element;
        while (element !== null && element.getAttribute('id') === null) {
            element = element.parentElement;
        }
        const id = element?.getAttribute('id');
        if (id) {
            const address = window.location.origin + window.location.pathname + '#' + id + '&' + encodeInputs(this.entries, this.props.store).join('&');
            if (copyToClipboardWithAnimation(address, event.currentTarget as HTMLButtonElement, 'scale200')) {
                report('Copy link', { Anchor: '#' + id });
            }
        } else {
            throw new Error('Could not find the ID of the parent element.');
        }
    }

    private readonly onCancel = () => {
        this.props.store.state.inputs = { ...getCurrentState(this.props.store) }; // It has to be a copy.
        clearErrors(this.props.store);
        this.props.store.update('input');
    }

    private readonly randomID = '-' + getRandomString();

    private renderEntry = (key: string, hasErrors: boolean, labelWidth: number) => {
        const entry = this.entries[key as keyof State] as DynamicEntry<ValueType, State>;
        const value = this.props.store.state.inputs[key as keyof State] as unknown as ValueType;
        const error = this.props.store.state.errors[key as keyof State] as ErrorType;
        const disabled = !error && (hasErrors ? true : entry.disable !== undefined && entry.disable(this.props.store.state.inputs));
        const history = inputTypesWithHistory.includes(entry.inputType) && !entry.onUpOrDown;
        const state = getCurrentState(this.props.store);
        return <label
            key={key}
            title={entry.description + (disabled ? ' (Currently disabled.)' : '' )}
            className={colorClass(entry.inputColor?.(value, this.props.store.state.inputs), '')}
        >
            {
                !this.props.noLabels &&
                <span
                    className={'label-text' + (['multiple', 'textarea'].includes(entry.inputType) ? ' label-for-textarea' : '') + ' cursor-help' + (disabled ? ' color-gray' : '')}
                    style={this.props.newColumnAt ? { width: (this.props.individualLabelWidth ? getLabelWidth(entry) : labelWidth) + 'px' } : {}}
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
                            checked={value as boolean}
                            disabled={disabled}
                            onChange={this.onChange}
                        />
                        <span className="custom-control-label"></span>
                    </span>
                }
                {
                    (entry.inputType === 'select' || entry.inputType === 'multiple') &&
                    <select
                        name={key}
                        className={'custom-select' + (error ? ' is-invalid' : '')}
                        disabled={disabled}
                        onChange={this.onChange}
                        multiple={entry.inputType === 'multiple'}
                        size={entry.inputType === 'multiple' && entry.selectOptions ? Object.entries(normalizeToValue(entry.selectOptions, state)).length : undefined}
                    >
                        {entry.selectOptions && Object.entries(normalizeToValue(entry.selectOptions, state)).map(([key, text]) =>
                            <option
                                key={key}
                                value={key}
                                selected={entry.inputType === 'multiple' ? (value as string[]).includes(key) : key === value}
                            >{text}</option>,
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
                        readOnly={entry.readOnly}
                        disabled={disabled}
                        onChange={this.onChange}
                        onInput={this.onInput}
                        value={value as string}
                        rows={entry.rows ?? 5}
                        style={entry.inputWidth ? { width: entry.inputWidth + 'px' } : {}}
                    />
                }
                { // inputType: 'number' | 'range' | 'text' | 'password' | 'date' | 'color';
                    entry.inputType !== 'checkbox' && entry.inputType !== 'switch' && entry.inputType !== 'select' && entry.inputType !== 'multiple' && entry.inputType !== 'textarea' &&
                    <Fragment>
                        {
                            history &&
                            <datalist id={key + this.randomID}>
                                {normalizeToValue(entry.suggestedValues ?? [], state).concat(
                                    this.props.store.state.states.map(object => object[key as keyof State] as unknown as ValueType),
                                ).reverse().filter(
                                    (option, index, self) => option !== value && self.indexOf(option) === index,
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
                            value={value as string | number}
                            min={entry.minValue as string | number | undefined}
                            max={entry.maxValue as string | number | undefined}
                            step={entry.stepValue as string | number | undefined}
                            placeholder={normalizeToValue(entry.placeholder, state)}
                            readOnly={entry.readOnly}
                            disabled={disabled}
                            onChange={this.onChange}
                            onInput={this.onInput}
                            onEnter={this.onEnter}
                            onUpOrDown={entry.inputType === 'number' || (entry.inputType === 'text' && entry.onUpOrDown) ? this.onUpOrDown : undefined}
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
                <span className={'range-value' + (disabled ? ' color-gray' : '')}>{value}</span>
            }
            {
                normalizeToArray(entry.determine).filter(button => button.hide === undefined || !button.hide(value, state)).map(button =>
                    <button
                        name={key}
                        key={button.text}
                        data-text={button.text}
                        type="button"
                        className="btn btn-primary btn-sm align-top ml-2"
                        disabled={disabled || button.disable !== undefined && button.disable(value, state)}
                        onClick={this.onDetermine}
                        title={button.title}
                    >{button.text}</button>,
                )
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
                    onClick={this.onNext}
                    disabled={this.props.store.state.index === this.props.store.state.states.length - 1}
                    title="Advance to the next set of values."
                >
                    <i className="fas fa-redo-alt"></i>
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
                    onClick={this.onShare}
                    title="Copy a link to the current values for sharing."
                >
                    <i className="fas fa-share"></i>
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
        const keys = Object.keys(this.entries);
        const hasErrors = !hasNoErrors(this.props.store);
        const labelWidth = this.props.individualLabelWidth || !this.props.newColumnAt ?
            0 : Math.max(...Object.values(this.entries).map(entry => getLabelWidth(entry as DynamicEntry<any, any>)));
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

export function getInput<State extends ObjectButNotFunction>(store: Store<VersionedState<State>, AllEntries<State>, VersioningEvent>) {
    return shareStore<VersionedState<State>, Partial<ProvidedDynamicEntries<State>> & InputProps<State>, AllEntries<State>, VersioningEvent>(store, 'input')(RawInput);
}
