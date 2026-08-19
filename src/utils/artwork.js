/**
 * Customer artwork upload.
 *
 * The Typeform this replaces used Typeform File Upload, which parks the file behind
 * their account. Here the file goes to the shared OBG Firebase Storage bucket and the
 * lead email carries a download link, the same path the Earthbound calculator already
 * uses.
 *
 * What "secure" means in practice for a public, unauthenticated lead form:
 *
 *  - **Unguessable path.** `crypto.randomUUID()` per upload, so a URL cannot be walked
 *    or guessed from a filename or a timestamp. Firebase download URLs additionally
 *    carry their own access token, so the object is not readable without the full URL.
 *  - **No overwrites.** Two customers sending `logo.png` cannot collide, so nobody can
 *    clobber (or read) another customer's file by reusing a name.
 *  - **Sanitized filename.** The original name is kept for the shop's benefit but
 *    stripped of path separators and control characters, so it cannot escape the
 *    prefix or inject into the storage key.
 *  - **Type allowlist + size cap**, enforced before a byte is sent. This is a
 *    convenience gate, not a trust boundary; the bucket's own rules are the real one.
 *  - **No secrets client-side.** The Firebase web config is designed to ship in the
 *    browser. Storage rules on the bucket are what actually authorize the write.
 *
 * The one thing this deliberately does NOT do is block submission on a failed upload.
 * A lead is worth far more than its attachment, so a failure degrades to a note in the
 * email and the contact details still arrive.
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebaseConfig';

// Art files people actually send a print shop. Illustrator/EPS/PDF are the ones the
// shop wants; the raster types are what customers usually have to hand.
const ALLOWED_EXT = [
    'ai', 'eps', 'pdf', 'svg',
    'png', 'jpg', 'jpeg', 'gif', 'webp', 'heic', 'tif', 'tiff',
    'psd', 'zip',
];

// Firebase handles far more than this, but a lead form has no business accepting a
// 200MB file over a phone connection. Q11's copy already directs larger art to email.
export const MAX_BYTES = 25 * 1024 * 1024;

export const MAX_MB = MAX_BYTES / (1024 * 1024);

function sanitizeName(name) {
    return String(name || 'artwork')
        .replace(/[\\/]/g, '-')        // no path separators
        // eslint-disable-next-line no-control-regex -- stripping control characters is the point
        .replace(/[\u0000-\u001f\u007f]/g, '')  // no control characters
        .replace(/\s+/g, '-')
        .replace(/[^A-Za-z0-9._-]/g, '')
        .slice(-80) || 'artwork';       // keep the tail, that is where the extension is
}

function extensionOf(name) {
    const m = String(name || '').toLowerCase().match(/\.([a-z0-9]+)$/);
    return m ? m[1] : '';
}

/**
 * Reject before uploading. Returns an error string, or null when the file is fine.
 */
export function validateArtwork(file) {
    if (!file) return null;
    if (file.size > MAX_BYTES) {
        return `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. Anything over ${MAX_MB}MB should go to Art@Earthboundinc.com instead.`;
    }
    const ext = extensionOf(file.name);
    if (ext && !ALLOWED_EXT.includes(ext)) {
        return `We can't take .${ext} files here. Send that one to Art@Earthboundinc.com and we'll pick it up.`;
    }
    return null;
}

/**
 * Upload and return a download URL.
 * Throws on failure; the caller degrades to a filename note rather than losing the lead.
 */
export async function uploadArtwork(file) {
    const id =
        globalThis.crypto?.randomUUID?.() ||
        // Older Safari. Still unguessable enough paired with the timestamp.
        `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;

    // FLAT under `uploads/`, and it has to stay that way. The shared obg-calculator
    // bucket publishes `match /uploads/{fileName}`, and a single-segment wildcard in a
    // Firebase rule matches exactly one path segment. Anything nested falls through to
    // `match /{allPaths=**} { allow read, write: if false }` and 403s. Verified against
    // the live bucket 2026-08-19: `quote-requests/earthbound/...` -> 403,
    // `uploads/earthbound-...` -> 200. The shop prefix rides in the filename, not a folder.
    const path = `uploads/earthbound-${id}-${sanitizeName(file.name)}`;
    const storageRef = ref(storage, path);

    await uploadBytes(storageRef, file, {
        contentType: file.type || 'application/octet-stream',
        // Surfaces the original name on the object without trusting it as the key.
        customMetadata: { originalName: String(file.name || '').slice(0, 200) },
    });

    return getDownloadURL(storageRef);
}
