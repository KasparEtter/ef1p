/*
Author: Kaspar Etter (https://kasparetter.com/)
Work: Explained from First Principles (https://ef1p.com/)
License: CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)
*/

import { Fragment } from 'react';

import { CodeBlock } from '../../react/code';
import { DynamicEntries, DynamicSingleSelectEntry, Entry } from '../../react/entry';
import { Tool } from '../../react/injection';
import { getInput } from '../../react/input';
import { getOutputEntries } from '../../react/output-entries';
import { StaticPrompt } from '../../react/prompt';
import { VersionedStore } from '../../react/versioned-store';

/* ------------------------------ Input ------------------------------ */

const operatingSystem: DynamicSingleSelectEntry<State> = {
    label: 'Operating system',
    tooltip: 'Select the operating system you are using.',
    defaultValue: (() => {
        if (navigator.platform.startsWith('Win')) {
            return 'windows';
        } else if (navigator.platform.startsWith('Mac')) {
            return 'macos';
        } else {
            return 'linux';
        }
    })(),
    inputType: 'select',
    selectOptions: {
        windows: 'Windows',
        macos: 'macOS',
        linux: 'Linux',
    },
};

const loggingLevel: DynamicSingleSelectEntry<State> = {
    label: 'Logging level',
    tooltip: 'All entries up to the specified level are logged. Use Info to log the communication without too much noise.',
    defaultValue: '3',
    inputType: 'select',
    selectOptions: {
        0: 'Disabled',
        1: 'Error',
        2: 'Warning',
        3: 'Info',
        4: 'Debug',
        5: 'Verbose',
    },
};

interface State {
    operatingSystem: string;
    loggingLevel: string;
}

const entries: DynamicEntries<State> = {
    operatingSystem,
    loggingLevel,
};

const store = new VersionedStore(entries, 'instruction-thunderbird');
const Input = getInput(store);
const OutputEntries = getOutputEntries(store);

/* ------------------------------ Output ------------------------------ */

const MOZ_LOG: Entry<string> = {
    label: 'Environment variable',
    tooltip: 'Specifies which modules shall be logged at which level.',
    defaultValue: 'MOZ_LOG',
};

const MOZ_LOG_FILE: Entry<string> = {
    label: 'Environment variable',
    tooltip: 'Specifies the path to the log file.',
    defaultValue: 'MOZ_LOG_FILE',
};

const timestamp: Entry<string> = {
    label: 'Option',
    tooltip: 'Entries are logged with the current time.',
    defaultValue: 'timestamp',
};

const append: Entry<string> = {
    label: 'Option',
    tooltip: 'When starting Thunderbird again, new entries are appended to the existing log file instead of overwriting it.',
    defaultValue: 'append',
};

const SMTP: Entry<string> = {
    label: 'Module',
    tooltip: 'Log the entries of the SMTP module at the level specified after the colon.',
    defaultValue: 'SMTP',
};

const POP3: Entry<string> = {
    label: 'Module',
    tooltip: 'Log the entries of the POP3 module at the level specified after the colon.',
    defaultValue: 'POP3',
};

const IMAP: Entry<string> = {
    label: 'Module',
    tooltip: 'Log the entries of the IMAP module at the level specified after the colon.',
    defaultValue: 'IMAP',
};

const command: Entry<string, State> = {
    label: 'Command',
    tooltip: 'The command to set an environment variable.',
    defaultValue: '',
    transform: (_, { operatingSystem }) => operatingSystem === 'Windows' ? 'set' : 'export',
};

const location: Entry<string, State> = {
    label: 'Location',
    tooltip: `The path to the log file. Thunderbird creates the log file if it doesn't exist yet.`,
    defaultValue: '',
    transform: (_, { operatingSystem }) => {
        switch (operatingSystem) {
            case 'windows':
                return '%USERPROFILE%\\Desktop\\thunderbird.moz_log';
            case 'macos':
                return '~/Downloads/thunderbird.moz_log';
            case 'linux':
                return '/tmp/thunderbird.moz_log';
            default:
                console.error('Unknown operating system:', operatingSystem);
                return 'ERROR';
        }
    },
};

const thunderbird: Entry<string, State> = {
    label: 'Command',
    tooltip: 'The command used to start Thunderbird from the command-line interface.',
    defaultValue: '',
    transform: (_, { operatingSystem }) => {
        switch (operatingSystem) {
            case 'windows':
                return '"%ProgramFiles(x86)%\\Mozilla Thunderbird\\thunderbird.exe"';
            case 'macos':
                return '/Applications/Thunderbird.app/Contents/MacOS/thunderbird-bin';
            case 'linux':
                return 'thunderbird';
            default:
                console.error('Unknown operating system:', operatingSystem);
                return 'ERROR';
        }
    },
};

/* ------------------------------ Tool ------------------------------ */

export const toolInstructionThunderbird: Tool = [
    <Fragment>
        <Input/>
        <CodeBlock>
            <StaticPrompt>
                <OutputEntries entries={{ command, MOZ_LOG }}/>=
                <OutputEntries entries={{ timestamp, append }} outputSeparator=","/>,
                <OutputEntries entries={{ SMTP }}/>:<OutputEntries entries={{ loggingLevel }}/>,
                <OutputEntries entries={{ POP3 }}/>:<OutputEntries entries={{ loggingLevel }}/>,
                <OutputEntries entries={{ IMAP }}/>:<OutputEntries entries={{ loggingLevel }}/>
            </StaticPrompt>
            <StaticPrompt>
                <OutputEntries entries={{ command, MOZ_LOG_FILE }}/>=
                <OutputEntries entries={{ location }}/>
            </StaticPrompt>
            <StaticPrompt>
                <OutputEntries entries={{ thunderbird }}/>
            </StaticPrompt>
        </CodeBlock>
    </Fragment>,
    store,
];
