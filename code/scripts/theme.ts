import { getItem, setItem } from '../utility/storage';

document.getElementById('theme')?.remove();

// Declared in the HTML head.
declare const themes: {
    dark: string;
    light: string;
};

type Theme = keyof typeof themes;

let theme: Theme = 'dark';
let setByUser: boolean = true;

function setStylesheetSource(): void {
    const themeElement = document.getElementById('theme') as HTMLLinkElement | null;
    if (themeElement) {
        themeElement.href = themes[theme];
    }
}

function setTogglerText(): void {
    const togglerElement = document.getElementById('theme-toggler-text') as HTMLSpanElement | null;
    if (togglerElement) {
        togglerElement.textContent = theme === 'dark' ? 'Light' : 'Dark';
    }
}

function listener(event: MediaQueryListEvent): void {
    setTheme(event.matches ? 'light' : 'dark', false);
}

const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');

function setTheme(newTheme: Theme | undefined, newSetByUser = true, siteLoaded = true): void {
    if (!setByUser && newSetByUser) {
        mediaQuery.removeEventListener('change', listener);
    }
    if (newTheme !== undefined) {
        theme = newTheme;
        setByUser = newSetByUser;
    } else {
        if (setByUser) {
            mediaQuery.addEventListener('change', listener);
        }
        theme = mediaQuery.matches ? 'light' : 'dark';
        setByUser = false;
    }
    if (siteLoaded) {
        setStylesheetSource();
        setTogglerText();
    }
}

setTheme(getItem('theme', setTheme), true, false);
document.write('<link rel="stylesheet" id="theme" href="' + themes[theme] + '"/>');

function storeTheme(newTheme: Theme) {
    setTheme(newTheme);
    setItem('theme', theme);
}

document.addEventListener('DOMContentLoaded', () => {
    setTogglerText();
    const toggler = document.getElementById('theme-toggler');
    if (toggler) {
        toggler.onclick = () => storeTheme(theme === 'dark' ? 'light' : 'dark');
    }
});
