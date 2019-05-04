// Adapted from https://gist.githubusercontent.com/Chalarangelo/4ff1e8c0ec03d9294628efbae49216db/raw/cbd2d8877d4c5f2678ae1e6bb7cb903205e5eacc/copyToClipboard.js.
export function copyToClipboard(text: string): boolean {
    const element = document.createElement('textarea');
    element.value = text;
    element.setAttribute('readonly', '');
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    document.body.appendChild(element);
    const selected = document.getSelection()!.rangeCount > 0 ? document.getSelection()!.getRangeAt(0) : false;
    element.select();
    let success: boolean;
    try {
        success = document.execCommand('copy');
    } catch (error) {
        console.error('Could not copy the text to the clipboard.', error);
        success = false;
    }
    document.body.removeChild(element);
    if (selected) {
        document.getSelection()!.removeAllRanges();
        document.getSelection()!.addRange(selected);
    }
    return success;
}
