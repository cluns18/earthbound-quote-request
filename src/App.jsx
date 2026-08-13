import { useState } from 'react';
import './App.css';
import Slide from './components/Slide';
import ChoiceGroup from './components/ChoiceGroup';
import SlideTransition from './components/SlideTransition';
import { sendQuoteRequest } from './utils/emailService';
import { uploadArtwork, validateArtwork } from './utils/artwork';
import conversionValue from './utils/conversionValue';

/**
 * A rebuild of Typeform oDOWHJbD ("Earthbound Inc"), question for question.
 *
 * Copy, order, branching, images, fonts and colors are taken from the Typeform API
 * rather than rewritten, because that form has 921 completed responses behind it and
 * is the shop's main lead intake. Anything that reads like an improvement here is a
 * regression.
 *
 * The Typeform branches once, on Q1:
 *   "Live on Site Printing"  -> Q2 event name, Q3 date, Q4 location, Q5 details,
 *                               Q6 artwork, then jumps straight to Q12 contact
 *   anything else            -> Q7 garments, Q8 quantity, Q9 vision, Q10 deadline,
 *                               Q11 artwork, Q12 contact
 * Both paths finish on Q13.
 */

const EVENT_CHOICE = 'Live on Site Printing';
const ART_EMAIL = 'Art@Earthboundinc.com';

const EVENT_PATH = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q12', 'q13'];
const STANDARD_PATH = ['q1', 'q7', 'q8', 'q9', 'q10', 'q11', 'q12', 'q13'];

const emptyAddress = { address: '', address_line_2: '', city: '', state: '', zip_code: '', country: '' };
const emptyContact = { first_name: '', last_name: '', phone_number: '', email: '', company: '' };

function App() {
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState('left');
    const [done, setDone] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [projectTypes, setProjectTypes] = useState([]);
    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventLocation, setEventLocation] = useState(emptyAddress);
    const [eventDetails, setEventDetails] = useState('');
    const [garmentTypes, setGarmentTypes] = useState([]);
    const [quantity, setQuantity] = useState('');
    const [vision, setVision] = useState('');
    const [deadline, setDeadline] = useState('');
    const [contact, setContact] = useState(emptyContact);
    const [heardAbout, setHeardAbout] = useState('');

    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState('');

    const isLiveEvent = projectTypes.includes(EVENT_CHOICE);
    const path = isLiveEvent ? EVENT_PATH : STANDARD_PATH;
    const current = path[step];
    // settings.progress_bar = "proportion"
    const progress = (step + 1) / path.length;

    const next = () => { setDirection('left'); setStep((s) => Math.min(s + 1, path.length - 1)); };
    const back = () => { setDirection('right'); setStep((s) => Math.max(s - 1, 0)); };

    const pickFile = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        const err = validateArtwork(f);
        if (err) { setFileError(err); setFile(null); e.target.value = ''; return; }
        setFileError('');
        setFile(f);
    };

    const submit = async () => {
        setIsSubmitting(true);

        // Upload artwork if there is any. A failure must never cost the lead, so it
        // degrades to a note in the email and the contact details still go out.
        let artwork = 'None provided';
        if (file) {
            try {
                artwork = await uploadArtwork(file);
            } catch (err) {
                console.error('Artwork upload failed:', err);
                artwork = `Upload failed - customer has "${file.name}", ask them to email it to ${ART_EMAIL}`;
            }
        }

        const loc = Object.values(eventLocation).filter(Boolean).join(', ');
        const payload = {
            name: `${contact.first_name} ${contact.last_name}`.trim(),
            email: contact.email,
            phone: contact.phone_number,
            company: contact.company,
            projectTypes,
            isLiveEvent,
            eventName,
            eventDate,
            eventLocation: loc,
            eventDetails,
            garmentTypes,
            quantity,
            vision,
            deadline,
            heardAbout,
            artwork,
        };

        try {
            await sendQuoteRequest(payload);
        } catch (err) {
            console.error('Lead send failed:', err);
        }

        // Fire the conversion on the PARENT page. The iframe is cross-origin, so a
        // gtag call in here cannot see the parent's gclid cookie and would not attribute.
        try {
            const value = conversionValue(isLiveEvent ? eventDetails : quantity, projectTypes);
            window.parent.postMessage({
                event: 'obgform_submission',
                name: payload.name,
                quantity: quantity || eventDetails,
                conversion_value: value,
                totalQuote: value,
                value,
                currency: 'USD',
                decoration_method: projectTypes.join(', '),
                source: heardAbout,
            }, '*');
        } catch { /* not framed */ }

        setIsSubmitting(false);
        setDone(true);
    };

    if (done) {
        return (
            <SlideTransition keyProp='done' direction='left'>
                <Slide
                    image='/img/q12-contact.jpg'
                    brightness={-0.2}
                    progress={1}
                    heading='All done! Thanks for your time.'
                    sub={`We'll be in touch shortly with a price for your project. Keep an eye out for an email from us.`}
                    showBack={false}
                    onNext={() => { window.location.href = 'https://www.earthboundinc.com/pages/about-us'; }}
                    nextLabel='Meet Earthbound'
                />
            </SlideTransition>
        );
    }

    const shell = (props) => (
        <Slide
            progress={progress}
            onBack={back}
            onNext={next}
            showBack={step > 0}
            {...props}
        />
    );

    return (
        <SlideTransition keyProp={current} direction={direction}>
            {current === 'q1' && shell({
                image: '/img/q1-intro.jpg',
                imageAlt: 'Earthbound Inc. press in Grand Rapids',
                heading: "Hey I'm Nyle. \nWelcome to Earthbound Inc.  We've Been Providing Michigan With Generational Craftsmanship Since 1978.",
                required: true,
                sub: "You're in great hands.\nWhat kind of project do you have? ",
                children: <ChoiceGroup choices={['Screen Printing', 'Live on Site Printing', 'Embroidery', 'Promotional Products']} selected={projectTypes} onChange={setProjectTypes} />,
                // The only required question on the form.
                disabled: projectTypes.length === 0,
            })}

            {current === 'q2' && shell({
                heading: "Got a Live Event You Need Shirts Printed at? What's it Called?",
                sub: "We've been printing at events in front of customers for over 30 years, and we'd love to join your next event. ",
                children: <input className='slide-input' value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder='Type your answer here...' autoFocus />,
                nextLabel: eventName.trim() ? 'Continue' : 'Skip',
            })}

            {current === 'q3' && shell({
                heading: 'When is your event?',
                sub: "A few weeks notice is great but it's always worth a conversation.",
                children: <input className='slide-input' type='date' value={eventDate} onChange={(e) => setEventDate(e.target.value)} />,
                nextLabel: eventDate ? 'Continue' : 'Skip',
            })}

            {current === 'q4' && shell({
                heading: 'Where is the Event?',
                sub: "We're in Grand Rapids and are willing to travel within reason. ",
                children: (
                    <div className='field-grid'>
                        {[
                            ['address', 'Address'], ['address_line_2', 'Address line 2'],
                            ['city', 'City/Town'], ['state', 'State/Region/Province'],
                            ['zip_code', 'Zip/Post Code'], ['country', 'Country'],
                        ].map(([key, label]) => (
                            <div key={key}>
                                <label className='field-label' htmlFor={key}>{label}</label>
                                <input id={key} className='slide-input' value={eventLocation[key]}
                                    onChange={(e) => setEventLocation((p) => ({ ...p, [key]: e.target.value }))} />
                            </div>
                        ))}
                    </div>
                ),
                nextLabel: Object.values(eventLocation).some(Boolean) ? 'Continue' : 'Skip',
            })}

            {current === 'q5' && shell({
                heading: "Tell us what types of garments you'd want us to bring, and roughly how many people we can expect to see. ",
                children: <textarea className='slide-textarea' rows={4} value={eventDetails} onChange={(e) => setEventDetails(e.target.value)} placeholder='Type your answer here...' autoFocus />,
                nextLabel: eventDetails.trim() ? 'Continue' : 'Skip',
            })}

            {(current === 'q6' || current === 'q11') && shell({
                heading: current === 'q6'
                    ? 'Upload any artwork you want printed'
                    : "Got Art? Upload it Here.\nNot Yet? Just Skip For Now and \nWe'll Help You Get Artwork. ",
                sub: current === 'q6' ? 'or hit enter to skip for now' : undefined,
                children: (
                    <>
                        <label className='upload-btn'>
                            {file ? file.name : 'Upload file'}
                            <input type='file' hidden onChange={pickFile} />
                        </label>
                        {fileError && <p className='upload-error'>{fileError}</p>}
                        {current === 'q11' && (
                            <p className='upload-note'>
                                Adobe illustrator files preferred, but we will happily accept anything you have for now. For larger files: please email art to{' '}
                                <a href={`mailto:${ART_EMAIL}`} style={{ color: 'var(--tf-answer)' }}>{ART_EMAIL}</a>
                            </p>
                        )}
                    </>
                ),
                nextLabel: file ? 'Continue' : 'Skip',
            })}

            {current === 'q7' && shell({
                image: '/img/q7-garments.jpg',
                imageAlt: 'Denver, the Earthbound shop dog',
                brightness: -0.09,
                heading: 'What Type of Garments Were You Thinking?',
                sub: '(Meet our shop dog, Denver)',
                children: <ChoiceGroup choices={['Shirts', 'Hoodies', 'Crew-necks', 'Sweat Pants', 'Tote Bags', 'Polos']} selected={garmentTypes} onChange={setGarmentTypes} />,
                nextLabel: garmentTypes.length ? 'Continue' : 'Skip',
            })}

            {current === 'q8' && shell({
                image: '/img/q8-quantity.jpg',
                brightness: 0,
                heading: 'How Many Do You Need?',
                sub: 'A rough estimate is okay for now.',
                children: <input className='slide-input' value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder='Type your answer here...' autoFocus />,
                nextLabel: quantity.trim() ? 'Continue' : 'Skip',
            })}

            {current === 'q9' && shell({
                image: '/img/q9-vision.jpg',
                brightness: 0,
                heading: 'Share a Bit of Your Vision For This Project.',
                sub: "We'd love to hear how you see your final product coming out of the box.",
                children: <input className='slide-input' value={vision} onChange={(e) => setVision(e.target.value)} placeholder='Type your answer here...' autoFocus />,
                nextLabel: vision.trim() ? 'Continue' : 'Skip',
            })}

            {current === 'q10' && shell({
                image: '/img/q10-deadline.jpg',
                brightness: 0,
                heading: 'When Do You Need This Project Done By?',
                children: <input className='slide-input' type='date' value={deadline} onChange={(e) => setDeadline(e.target.value)} />,
                nextLabel: deadline ? 'Continue' : 'Skip',
            })}

            {current === 'q12' && shell({
                image: '/img/q12-contact.jpg',
                brightness: -0.2,
                heading: "Let's Get You a Price For This Project.",
                sub: "Keep an eye out for an email from us.\nWe're here to help make this process painless and fun for you.",
                children: (
                    <div className='field-grid two-col'>
                        {[
                            ['first_name', 'First name', 'text'], ['last_name', 'Last name', 'text'],
                            ['phone_number', 'Phone number', 'tel'], ['email', 'Email', 'email'],
                            ['company', 'Company', 'text'],
                        ].map(([key, label, type]) => (
                            <div key={key}>
                                <label className='field-label' htmlFor={key}>{label}</label>
                                <input id={key} type={type} className='slide-input' value={contact[key]}
                                    onChange={(e) => setContact((p) => ({ ...p, [key]: e.target.value }))} />
                            </div>
                        ))}
                    </div>
                ),
                // Every contact sub-field is required on the Typeform.
                disabled: Object.values(contact).some((v) => !String(v).trim()),
            })}

            {current === 'q13' && shell({
                image: '/img/q13-heard.jpg',
                brightness: 0,
                heading: 'How Did You Hear About Us?',
                sub: 'Ex: Google, Instagram, a Friend, a Prior Project',
                children: <input className='slide-input' value={heardAbout} onChange={(e) => setHeardAbout(e.target.value)} placeholder='Type your answer here...' autoFocus />,
                onNext: submit,
                nextLabel: isSubmitting ? 'Sending...' : 'Submit',
                disabled: isSubmitting,
            })}
        </SlideTransition>
    );
}

export default App;
