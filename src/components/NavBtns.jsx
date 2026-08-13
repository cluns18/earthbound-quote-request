const NavBtns = ({ onBack, onNext, nextLabel = 'Continue', showBack = true, disabled = false }) => {
    return (
        <div className='nav-row'>
            {showBack && (
                <button onClick={onBack} className='btn-back' type='button'>
                    Back
                </button>
            )}
            <button onClick={onNext} className='btn-primary' type='button' disabled={disabled}>
                {nextLabel}
            </button>
        </div>
    );
};

export default NavBtns;
