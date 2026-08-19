/**
 * Typeform multiple choice. Both choice questions on this form have
 * allow_multiple_selection = true, which is what puts "Choose as many as you like"
 * above the options on the live form.
 *
 * settings.show_key_hint_on_choices is on in the API response, but the live renderer
 * shows no A/B/C/D badges at this breakpoint, so there are none here either.
 */
const ChoiceGroup = ({ choices, selected = [], onChange, multiple = true }) => {
    const toggle = (label) => {
        if (!multiple) {
            onChange([label]);
            return;
        }
        onChange(
            selected.includes(label)
                ? selected.filter((s) => s !== label)
                : [...selected, label],
        );
    };

    return (
        <>
            {multiple && <p className='field-hint'>Choose as many as you like</p>}
            <div className='choice-list'>
                {choices.map((label) => {
                    const isOn = selected.includes(label);
                    return (
                        <button
                            key={label}
                            type='button'
                            className={`choice ${isOn ? 'selected' : ''}`}
                            onClick={() => toggle(label)}
                            aria-pressed={isOn}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </>
    );
};

export default ChoiceGroup;
