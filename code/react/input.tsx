/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { ChangeEvent, Component, Fragment, MouseEvent } from 'react';
import ReactDOM from 'react-dom';

import { report } from '../utility/analytics';
import { copyToClipboardWithAnimation } from '../utility/animation';
import { getColorClass } from '../utility/color';
import { getErrorMessage } from '../utility/error';
import { normalizeToArray, normalizeToValue } from '../utility/normalization';
import { filterUndefinedValues } from '../utility/object';
import { getRandomString } from '../utility/string';
import { estimateStringWidth } from '../utility/string-width';
import { Button, KeysOf, MissingOrUndefined } from '../utility/types';

import { CustomInput, CustomTextarea } from './custom-input';
import { AnyDynamicEntry, BasicState, BasicValue, DynamicEntries, numberInputTypes, ProvidedDynamicEntries, validateIndependently } from './entry';
import { ProvidedStore } from './store';
import { VersionedState, VersionedStore, VersioningEvent } from './versioned-store';

export interface InputProps<State extends BasicState<State>> {
    /**
     * Whether the inputs shall be displayed vertically in two columns.
     * Use 'newColumnAt' instead if you want to control where the column break occurs.
     */
    readonly inColumns?: boolean;

    /**
     * The index of the first entry to break into a second column.
     * Results in a vertical form with two columns if provided and a horizontal form otherwise.
     * This value is ignored if 'inColumns' is provided.
     */
    readonly newColumnAt?: number;

    /**
     * For submit actions specific to this instantiation of the form.
     * It is triggered when the user presses enter in one of the fields or clicks on the button.
     * When there are no errors, the general change handler is called before the click handler.
     */
    readonly submit?: Button<Readonly<State>>;

    /**
     * The entries whose values shall be encoded in the shared link.
     * This defaults to the entries which are displayed for input.
     */
    readonly sharedEntries?: MissingOrUndefined<DynamicEntries<State>>;

    /**
     * Whether to skip the history buttons.
     */
    readonly noHistory?: boolean;

    /**
     * Whether to set labels to their individual width.
     * This value is used only if 'inColumns' or 'newColumnAt' is provided.
     */
    readonly individualLabelWidth?: boolean;

    /**
     * Whether to display the form inline instead of blocking.
     * This value is ignored if 'inColumns' or 'newColumnAt' is provided.
     */
    readonly inline?: boolean;

    /**
     * Whether to skip the input labels.
     */
    readonly noLabels?: boolean;
}

function getInputValue(target: HTMLInputElement | HTMLSelectElement): BasicValue {
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

function getLabelWidth(entry: AnyDynamicEntry<any>): number {
    if (entry.labelWidth !== undefined) {
        return entry.labelWidth;
    } else {
        return Math.ceil(estimateStringWidth(entry.label + ':') + 0.1);
    }
}

export class RawInput<State extends BasicState<State>> extends Component<ProvidedStore<VersionedState<State>, VersioningEvent, VersionedStore<State>> & Partial<ProvidedDynamicEntries<State>> & InputProps<State>> {
    private readonly entries = this.props.entries !== undefined ? filterUndefinedValues(this.props.entries) : this.props.store.entries;

    private lastChange = 0;

    private readonly onChange = (event: Event | ChangeEvent<any>) => {
        this.lastChange = event.timeStamp;
        const target = event.currentTarget as HTMLInputElement | HTMLSelectElement;
        const key = target.name as keyof State;
        const input = getInputValue(target);
        this.props.store.setInput(key, input, true);
        this.props.store.setNewStateFromCurrentInputs();
    }

    private readonly onEnter = (event: KeyboardEvent) => {
        if (this.props.store.hasNoErrors()) {
            const currentState = this.props.store.getCurrentState();
            // If the last change happened less than 0.2 seconds ago, it was presumably triggered by pressing enter, in which case the change handler has already been called.
            if (event.timeStamp - this.lastChange > 200) {
                this.props.store.onChange?.(currentState, currentState);
            }
            this.props.submit?.onClick(currentState);
        }
    }

    private readonly onInput = (event: Event) => {
        const target = event.currentTarget as HTMLInputElement;
        const key = target.name as keyof State;
        const input = getInputValue(target);
        this.props.store.setInput(key, input);
    }

    private readonly onUpOrDown = (event: KeyboardEvent) => {
        const target = event.currentTarget as HTMLInputElement;
        const key = target.name as keyof State;
        const entry: AnyDynamicEntry<State> = this.entries[key]!;
        this.props.store.setNewStateFromCurrentInputs();
        const errors = this.props.store.getErrors();
        if ((entry.inputType === 'number' || entry.inputType === 'text') && (!entry.requireValidDependenciesForUpOrDown || normalizeToArray(entry.dependencies).every(dependency => !errors[dependency]))) {
            const inputs = this.props.store.getInputs();
            if (entry.onUpOrDown) {
                const input = entry.onUpOrDown(event.key === 'ArrowUp' ? 'up' : 'down', inputs[key] as never, inputs);
                this.props.store.setNewStateFromInput(key, input);
            } else if (entry.inputType === 'number') {
                const step = (normalizeToValue(entry.stepValue, inputs) as number | undefined ?? 1) * (event.key === 'ArrowUp' ? 1 : -1);
                while (true) {
                    const inputs = this.props.store.getInputs();
                    const input = inputs[key] as unknown as number + step;
                    const minValue = normalizeToValue(entry.minValue, inputs);
                    const maxValue = normalizeToValue(entry.maxValue, inputs);
                    if (minValue !== undefined && input < minValue) {
                        this.props.store.setNewStateFromInput(key, minValue);
                        break;
                    } else if (maxValue !== undefined && input > maxValue) {
                        this.props.store.setNewStateFromInput(key, maxValue);
                        break;
                    } else {
                        this.props.store.setNewStateFromInput(key, input);
                        if (!this.props.store.getErrors()[key]) {
                            break;
                        }
                    }
                }
            }
        }
    }

    private readonly onDetermine = async (event: MouseEvent<HTMLButtonElement>) => {
        const target = event.currentTarget as HTMLButtonElement;
        const key = target.name as keyof State;
        const entry: AnyDynamicEntry<State> = this.entries[key]!;
        const label = target.dataset.label;
        const buttons = normalizeToArray(entry.determine).filter(button => button.label === label);
        if (buttons.length === 1) {
            try {
                const inputs = this.props.store.getInputs();
                const value = await buttons[0].onClick(inputs[key] as never, inputs);
                this.props.store.setNewStateFromInput(key, value);
            } catch (error) {
                if (['text', 'textarea', 'password'].includes(entry.inputType)) {
                    this.props.store.setInput(key, '', true);
                }
                this.props.store.setError(key, getErrorMessage(error));
            }
        } else {
            throw new Error(`input.tsx: Could not find the button with the label '${label}'.`);
        }
    }

    private readonly onSubmit = () => {
        const currentState = this.props.store.getCurrentState();
        this.props.store.onChange?.(currentState, currentState);
        this.props.submit?.onClick(currentState);
    }

    private readonly onPrevious = () => {
        this.props.store.goToPreviousState();
    }

    private readonly onNext = () => {
        this.props.store.goToNextState();
    }

    private readonly onClear = () => {
        if (confirm(`Are you sure you want to erase the history of ${this.props.store.getState().states.length - 1} entered values?`)) {
            this.props.store.resetState();
        }
    }

    private readonly onShare = (event: MouseEvent<HTMLButtonElement>) => {
        let element: Element | null = ReactDOM.findDOMNode(this) as Element;
        while (element !== null && element.getAttribute('id') === null) {
            element = element.parentElement;
        }
        const id = element?.getAttribute('id');
        if (id) {
            const entries = this.props.sharedEntries !== undefined ? this.props.sharedEntries : this.entries;
            const address = window.location.origin + window.location.pathname + '#' + id + '&' + this.props.store.encodeInputs(entries).join('&');
            if (copyToClipboardWithAnimation(address, event.currentTarget as HTMLButtonElement, 'scale200')) {
                report('Copy link', { Anchor: '#' + id });
            }
        } else {
            throw new Error('input.tsx: Could not find the ID of the parent element.');
        }
    }

    private readonly onCancel = () => {
        this.props.store.cancelInputs();
    }

    private readonly randomID = '-' + getRandomString();

    private renderEntry = (key: keyof State, hasIndependentErrors: boolean, hasDependentErrors: boolean, labelWidth: number) => {
        const name = key as string;
        const entry = this.entries[key] as AnyDynamicEntry<State>;
        const inputs = this.props.store.getInputs();
        const input = inputs[key] as never;
        const errors = this.props.store.getErrors();
        const error = errors[key];
        const validDependencies = normalizeToArray(entry.dependencies).every(dependency => !errors[dependency]);
        const disabled = !error && (hasIndependentErrors || hasDependentErrors && !entry.stayEnabled || entry.disable !== undefined && entry.disable(inputs));
        const history = entry.inputType === 'text' && !entry.onUpOrDown;
        let selectOptions: Record<string, string> | undefined;
        if (entry.inputType === 'select' || entry.inputType === 'multiple') {
            selectOptions = normalizeToValue(entry.selectOptions, this.props.store.getCurrentState());
        }
        return <label
            key={name}
            title={normalizeToValue<string, never>(entry.tooltip, input) + (disabled ? ' (Currently disabled.)' : '' )}
            className={getColorClass(entry.inputColor?.(input, inputs))}
        >
            {
                !this.props.noLabels &&
                <span
                    className={'label-text' + (['multiple', 'textarea'].includes(entry.inputType) ? ' label-for-textarea' : '') + ' cursor-help' + (disabled ? ' color-gray' : '')}
                    style={this.props.inColumns || this.props.newColumnAt ? { width: (this.props.individualLabelWidth ? getLabelWidth(entry) : labelWidth) + 'px' } : {}}
                >
                    {entry.label}:
                </span>
            }
            <span className="d-inline-block">
                {
                    (entry.inputType === 'checkbox' || entry.inputType === 'switch') &&
                    <span className={'custom-control custom-' + entry.inputType + (error ? ' is-invalid' : '')}>
                        <CustomInput
                            name={name}
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
                    (entry.inputType === 'select' || entry.inputType === 'multiple') &&
                    <select
                        name={name}
                        className={'custom-select' + (error ? ' is-invalid' : '')}
                        disabled={disabled}
                        onChange={this.onChange}
                        multiple={entry.inputType === 'multiple'}
                        size={entry.inputType === 'multiple' && selectOptions ? Object.keys(selectOptions).length : undefined}
                        style={entry.inputWidth ? { width: entry.inputWidth + 'px' } : {}}
                    >
                        {selectOptions && Object.entries(selectOptions).map(([key, text]) =>
                            <option
                                key={key}
                                value={key}
                                selected={entry.inputType === 'multiple' ? (input as string[]).includes(key) : (key === input)}
                            >{text}</option>,
                        )}
                    </select>
                }
                {
                    entry.inputType === 'textarea' &&
                    <CustomTextarea
                        name={name}
                        className={'form-control' + (error ? ' is-invalid' : '')}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        placeholder={normalizeToValue(entry.placeholder, inputs)}
                        readOnly={entry.readOnly}
                        disabled={disabled}
                        onChange={this.onChange}
                        onInput={this.onInput}
                        onEscape={this.onCancel}
                        value={input as string}
                        rows={entry.rows ?? 3}
                        style={entry.inputWidth ? { width: entry.inputWidth + 'px' } : {}}
                    />
                }
                {
                    (entry.inputType === 'number' || entry.inputType === 'range' || entry.inputType === 'text' || entry.inputType === 'password' || entry.inputType === 'date' || entry.inputType === 'color') &&
                    <Fragment>
                        {
                            history &&
                            <datalist id={name + this.randomID}>
                                {normalizeToValue(entry.suggestedValues ?? [], inputs).concat(
                                    this.props.store.getState().states.map(object => object[key] as string),
                                ).reverse().filter(
                                    (option, index, self) => option !== input && self.indexOf(option) === index,
                                ).map(
                                    option => <option key={'' + option} value={'' + option}/>,
                                )}
                            </datalist>
                        }
                        <CustomInput
                            name={name}
                            type={entry.inputType}
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                            spellCheck="false"
                            className={(entry.inputType === 'range' ? 'custom-range' : (entry.inputType === 'color' ? 'custom-color' : 'form-control')) + (error ? ' is-invalid' : '')}
                            value={input as string | number}
                            allowDecimalPoint={!!(entry as any).digits}
                            min={normalizeToValue((entry as any).minValue, inputs)}
                            max={normalizeToValue((entry as any).maxValue, inputs)}
                            step={normalizeToValue((entry as any).stepValue, inputs)}
                            placeholder={normalizeToValue((entry as any).placeholder, inputs)}
                            readOnly={entry.readOnly}
                            disabled={disabled}
                            onChange={this.onChange}
                            onInput={this.onInput}
                            onEscape={this.onCancel}
                            onEnter={this.onEnter}
                            onUpOrDown={entry.inputType === 'number' || (entry.inputType === 'text' && entry.onUpOrDown) ? this.onUpOrDown : undefined}
                            list={history ? name + this.randomID : undefined}
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
                <span className={'range-value' + (disabled ? ' color-gray' : '')}>{entry.transform !== undefined ? entry.transform(input as number, inputs) : (input as number).toFixed(entry.digits ?? 0)}</span>
            }
            {
                normalizeToArray(entry.determine).filter(button => button.hide === undefined || !button.hide(input, inputs)).map(button =>
                    <button
                        name={name}
                        key={button.label}
                        data-label={button.label}
                        type="button"
                        className="btn btn-primary btn-sm align-top ml-2"
                        disabled={disabled || button.requireValidDependencies && !validDependencies || button.requireIndependentlyValidInput && !!validateIndependently(entry, input, inputs) || button.disable !== undefined && button.disable(input, inputs)}
                        onClick={this.onDetermine}
                        title={button.tooltip}
                    >{button.label}</button>,
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
                title={hasErrors ? 'Make sure that there are no errors.' : this.props.submit.tooltip}
            >{this.props.submit.label}</button>;
    };

    private renderHistoryButtons = () => {
        const state = this.props.store.getState();
        return !this.props.noHistory &&
            <span className="label btn-icon btn-group btn-group-sm">
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.onPrevious}
                    disabled={state.index === 0}
                    title="Go back to the previous set of values."
                >
                    <i className="fas fa-undo-alt"></i>
                </button>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.onNext}
                    disabled={state.index === state.states.length - 1}
                    title="Advance to the next set of values."
                >
                    <i className="fas fa-redo-alt"></i>
                </button>
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={this.onClear}
                    disabled={state.states.length === 1}
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
            <span className="horizontal-form form-buttons">
                {submitButton}
                {historyButtons}
                {cancelButton}
            </span>;
    };

    public render(): JSX.Element {
        const keys = Object.keys(this.entries) as unknown as KeysOf<State>;
        const hasIndependentErrors = this.props.store.hasIndependentErrors();
        const hasDependentErrors = this.props.store.hasDependentErrors();
        const hasErrors = hasIndependentErrors || hasDependentErrors;
        const labelWidth = (this.props.inColumns || this.props.newColumnAt) && !this.props.individualLabelWidth ?
            Math.max(...Object.values(this.entries).map(entry => getLabelWidth(entry as AnyDynamicEntry<any>))) : 0;
        const newColumnIndex = this.props.inColumns ? Math.ceil(keys.length / 2) : this.props.newColumnAt;
        if (newColumnIndex) {
            return <div className="block-form vertical-form row">
                <div className="col-md">
                    {keys.slice(0, newColumnIndex).map(key => this.renderEntry(key, hasIndependentErrors, hasDependentErrors, labelWidth))}
                </div>
                <div className="col-md">
                    {keys.slice(newColumnIndex).map(key => this.renderEntry(key, hasIndependentErrors, hasDependentErrors, labelWidth))}
                    {this.renderButtons(hasErrors)}
                </div>
            </div>;
        } else {
            return <div className={(this.props.inline ? 'inline-form' : 'block-form') + ' horizontal-form'}>
                {keys.map(key => this.renderEntry(key, hasIndependentErrors, hasDependentErrors, labelWidth))}
                {this.renderButtons(hasErrors)}
            </div>;
        }
    }
}

export function getInput<State extends BasicState<State>>(store: VersionedStore<State>) {
    return store.injectStore<Partial<ProvidedDynamicEntries<State>> & InputProps<State>>(RawInput, 'input');
}
