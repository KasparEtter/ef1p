import { Dictionary } from './types';

type Properties = Dictionary<string | number | boolean | null>;
type Callback = () => any;

export interface Options {
    props?: Properties;
    callback?: Callback;
}

// https://plausible.io/docs/custom-event-goals
declare function plausible(name: string, options: Options): void;

export function report(name: string, props?: Properties, callback?: Callback): void {
    if (typeof plausible !== 'undefined') {
        plausible(name, { props, callback });
    } else {
        // Log the reports to the console during development:
        console.log(`Report '${name}':`, props);
        callback?.();
    }
}
