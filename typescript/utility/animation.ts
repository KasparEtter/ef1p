import { copyToClipboard } from './clipboard';

// See https://www.sitepoint.com/css3-animation-javascript-event-handlers/ (oanimationend is Opera):
const animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

export type AnimationEffect = 'scale2' | 'scale4';

export function copyToClipboardWithAnimation(
    text: string,
    target: HTMLElement,
    effect: AnimationEffect = 'scale2',
): boolean {
    if (copyToClipboard(text)) {
        const element = $(target);
        element.addClass(effect).one(animationEnd, () => element.removeClass(effect));
        return true;
    } else {
        return false;
    }
}
