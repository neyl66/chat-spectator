
export function debounce(callback, wait) {
    let timeout_id = null;
    return (...args) => {
        window.clearTimeout(timeout_id);
        timeout_id = window.setTimeout(() => {
            callback.apply(null, args);
        }, wait);
    };
}
