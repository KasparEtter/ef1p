// Adapted from https://gist.githubusercontent.com/Chalarangelo/4ff1e8c0ec03d9294628efbae49216db/raw/cbd2d8877d4c5f2678ae1e6bb7cb903205e5eacc/copyToClipboard.js.
export function copyToClipboard(text: string): boolean {
    // Create and append textarea to body:
    const textarea = document.createElement('textarea');
    textarea.setAttribute('readonly', 'true'); // Method needed because of missing TypeScript definition.
    textarea.contentEditable = 'true';
    textarea.style.position = 'absolute';
    textarea.style.top = '-1000px';
    textarea.value = text;
    document.body.appendChild(textarea);

    // Save the current selection of the user:
    const selectedRange = document.getSelection()!.rangeCount > 0 ? document.getSelection()!.getRangeAt(0) : false;

    // Select the content of the textarea:
    textarea.select(); // Ordinary browsers
    textarea.setSelectionRange(0, textarea.value.length); // iOS

    // Try to copy the range to the clipboard:
    let success: boolean;
    try {
        success = document.execCommand('copy');
    } catch (error) {
        console.error('Could not copy to the clipboard.', error);
        alert('Could not copy to the clipboard.');
        success = false;
    }

    // Remove the added textarea again:
    document.body.removeChild(textarea);

    // Restore the selection of the user:
    if (selectedRange) {
        document.getSelection()!.removeAllRanges();
        document.getSelection()!.addRange(selectedRange);
    }

    return success;
}
