import NavBtns from './NavBtns';

/**
 * One Typeform screen: logo top-left, proportion progress bar across the top, question
 * and help text on the left, photo on the right.
 *
 * Screens with no `image` render full width, matching the Typeform questions that carry
 * no attachment (the whole live-event branch and both file uploads).
 */
const Slide = ({
    image,
    imageAlt = '',
    brightness = 0,
    heading,
    required = false,
    sub,
    progress,
    children,
    onBack,
    onNext,
    nextLabel = 'Continue',
    showBack = true,
    disabled = false,
}) => (
    <div className={`slide-wrap ${image ? '' : 'no-image'}`}>
        <div className='progress-track'>
            <div className='progress-fill' style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>

        <img src='/img/logo.png' alt='Earthbound Inc.' className='slide-logo' />

        <div className='slide-content'>
            <h1 className='slide-heading'>
                {heading}
                {required && <span className='required-star'> *</span>}
            </h1>
            {sub && <p className='slide-sub'>{sub}</p>}
            {children}
            <NavBtns
                onBack={onBack}
                onNext={onNext}
                nextLabel={nextLabel}
                showBack={showBack}
                disabled={disabled}
            />
        </div>

        {image && (
            <img
                src={image}
                alt={imageAlt}
                className='slide-image'
                // Not lazy. Only one slide is mounted at a time, so its photo is always
                // in view, and lazy only bought a beat of empty beige on the first paint
                // of the shop's main intake.
                fetchPriority='high'
                // Typeform stores a per-image brightness adjustment on the attachment.
                style={brightness ? { filter: `brightness(${1 + brightness})` } : undefined}
            />
        )}
    </div>
);

export default Slide;
