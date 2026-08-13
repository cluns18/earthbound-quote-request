/**
 * Slide swap, done with CSS rather than AnimatePresence.
 *
 * The rogue-lab base used `AnimatePresence mode="wait"` from `motion`. On React 19.1
 * under StrictMode that deadlocks: the double-mount loses the exit callback, so the
 * outgoing slide never finishes exiting, the incoming one never animates in, and the
 * form freezes at `opacity: 0` with the customer's click already registered. State had
 * advanced; the screen had not. Verified on this build before the swap.
 *
 * On a form whose entire job is to not lose a lead, a navigation freeze is the worst bug
 * available, so the swap does not get to depend on animation library reconciliation.
 * Changing `keyProp` remounts the div, and a CSS keyframe plays on mount. There is no
 * exit animation, which is fine: the Typeform's own transition is a quick fade and the
 * outgoing frame is barely perceptible.
 */
const SlideTransition = ({ children, keyProp, direction = 'left' }) => (
    <div
        key={keyProp}
        className={`slide-enter ${direction === 'right' ? 'from-left' : 'from-right'}`}
    >
        {children}
    </div>
);

export default SlideTransition;
