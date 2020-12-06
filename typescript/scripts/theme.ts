import { getItem, setItem } from '../utility/storage';

// Declared in the HTML head.
declare const themes: {
    dark: string;
    light: string;
};

type Theme = keyof typeof themes;

let theme: Theme;
let setByUser: boolean;

function setStylesheetSource(): void {
    const themeElement = document.getElementById('theme') as HTMLLinkElement | null;
    if (themeElement) {
        themeElement.href = themes[theme];
    }
};

function setTogglerText(): void {
    const togglerElement = document.getElementById('theme-toggler-text') as HTMLSpanElement | null;
    if (togglerElement) {
        togglerElement.textContent = theme === 'dark' ? 'Light' : 'Dark';
    }
};

function setTheme(newTheme: Theme, newSetByUser = true): void {
    theme = newTheme;
    setByUser = newSetByUser;
    setStylesheetSource();
    setTogglerText();
}

{
    const restoredTheme = getItem('theme', setTheme);
    if (restoredTheme !== undefined) {
        theme = restoredTheme;
        setByUser = true;
    } else {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
        theme = mediaQuery.matches ? 'light' : 'dark';
        setByUser = false;
        mediaQuery.addEventListener('change', event => {
            if (!setByUser) {
                setTheme(event.matches ? 'light' : 'dark', false);
            }
        });
    }
    document.write('<link rel="stylesheet" id="theme" href="' + themes[theme] + '"/>');
}

function storeTheme(newTheme: Theme) {
    setTheme(newTheme, true);
    setItem('theme', theme);
};

document.addEventListener('DOMContentLoaded', () => {
    setTogglerText();
    const toggler = document.getElementById('theme-toggler');
    if (toggler) {
        toggler.onclick = () => storeTheme(theme === 'dark' ? 'light' : 'dark');
    }
});
