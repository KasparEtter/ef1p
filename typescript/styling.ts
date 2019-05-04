import { restoreObject, storeObject } from './storage';

declare const themes: {
    dark: string;
    light: string;
};

let theme: 'dark' | 'light' = restoreObject('theme') || 'dark';
document.write('<link rel="stylesheet" id="theme" href="' + themes[theme] + '"/>');

const updateTheme = () => {
    const themeElement = document.getElementById('theme') as HTMLLinkElement | null;
    if (themeElement) {
        themeElement.href = themes[theme];
    }
};

const updateToggler = () => {
    const togglerElement = document.getElementById('theme-toggler-text') as HTMLSpanElement | null;
    if (togglerElement) {
        togglerElement.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }
};

const togglerClickHandler = () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    storeObject('theme', theme);
    updateTheme();
    updateToggler();
};

const contentLoadedHandler = () => {
    updateToggler();
    const toggler = document.getElementById('theme-toggler');
    if (toggler) {
        toggler.onclick = togglerClickHandler;
    }
};

document.addEventListener('DOMContentLoaded', contentLoadedHandler);
