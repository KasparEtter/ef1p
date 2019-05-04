export function storeObject(key: string, object: any) {
    if (typeof(Storage) !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(object));
    }
}

export function restoreObject(key: string): any {
    if (typeof(Storage) !== 'undefined') {
        const object = localStorage.getItem(key);
        return object === null ? undefined : JSON.parse(object);
    }
    return undefined;
}
