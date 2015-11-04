export function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

export function radiansToDegrees(radians) {
    return radians * (180 / Math.PI);
}

export function euclid_distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

export function in_rect(x1, y1, x2, y2, width, height) {
    return (x2 + width > x1 && x1 > x2) && (y2 + height > y1 && y1 > y2);
}
