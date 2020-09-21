// https://support.google.com/analytics/answer/1033068
// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export function report(category: string, action: string, label: string): void {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            event_category: category,
            event_label: label,
        });
    } else {
        // Log the reports during local development:
        console.log('Report:', { category, action, label });
    }
}
