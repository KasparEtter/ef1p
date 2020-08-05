import { restoreObject, storeObject } from '../utility/storage';

// Declared in the HTML head.
declare const themes: {
    dark: string;
    light: string;
};

type Theme = keyof typeof themes;

const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
let theme: Theme = restoreObject('theme') ?? (mediaQuery.matches ? 'light' : 'dark');
document.write('<link rel="stylesheet" id="theme" href="' + themes[theme] + '"/>');

const setStylesheetSource = () => {
    const themeElement = document.getElementById('theme') as HTMLLinkElement | null;
    if (themeElement) {
        themeElement.href = themes[theme];
    }
};

const setTogglerText = () => {
    const togglerElement = document.getElementById('theme-toggler-text') as HTMLSpanElement | null;
    if (togglerElement) {
        togglerElement.textContent = theme === 'dark' ? 'Light' : 'Dark';
    }
};

const setTheme = (newTheme: Theme) => {
    theme = newTheme;
    storeObject('theme', theme);
    setStylesheetSource();
    setTogglerText();
};

mediaQuery.addListener(event => setTheme(event.matches ? 'light' : 'dark'));
const togglerClickHandler = () => setTheme(theme === 'dark' ? 'light' : 'dark');

const contentLoadedHandler = () => {
    setTogglerText();
    const toggler = document.getElementById('theme-toggler');
    if (toggler) {
        toggler.onclick = togglerClickHandler;
    }
};

document.addEventListener('DOMContentLoaded', contentLoadedHandler);
