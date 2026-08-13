// Routes the lead to the central OBG mail service (Vercel + Gmail API). No secrets here:
// the front end POSTs a registered shop_id and the lead fields, and the service sends both
// the customer auto-reply and Earthbound's internal notification, branded from
// obg-mail-api/shops/earthbound.json. See obg-mail-api/api/send_lead.py.
//
// OBG's Gmail credential deliberately never reaches this app or the Netlify site it runs
// on, because that site lives on Chris's account.
import SHOP_CONFIG from '../config/shop';

const ENDPOINT = import.meta.env.VITE_LEAD_ENDPOINT || 'https://obg-mail-api.vercel.app/api/send_lead';

/**
 * The Typeform collected 13 answers across two branches. Everything the shop reads today
 * has to survive the swap, so the payload carries all of it. `project` is the human
 * summary the existing email template renders; the individual fields ride alongside so a
 * future template can lay them out properly without another migration.
 */
function buildProjectSummary(d) {
    const lines = [];
    const add = (label, value) => {
        if (value === undefined || value === null) return;
        const v = Array.isArray(value) ? value.join(', ') : String(value).trim();
        if (v) lines.push(`${label}: ${v}`);
    };

    add('Project type', d.projectTypes);

    if (d.isLiveEvent) {
        add('Event name', d.eventName);
        add('Event date', d.eventDate);
        add('Event location', d.eventLocation);
        add('Garments + headcount', d.eventDetails);
    } else {
        add('Garment types', d.garmentTypes);
        add('Quantity', d.quantity);
        add('Their vision', d.vision);
        add('Needed by', d.deadline);
    }

    add('How they heard about us', d.heardAbout);
    return lines.join('\n');
}

export const sendQuoteRequest = (formData) => {
    return fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            shop_id: SHOP_CONFIG.shop_id,

            // Contact block (Q12)
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,

            // What the current lead email renders
            project: buildProjectSummary(formData),
            quantity: formData.quantity,
            artwork: formData.artwork,

            // Structured copies, so nothing the Typeform captured is lost
            project_types: formData.projectTypes,
            garment_types: formData.garmentTypes,
            event_name: formData.eventName,
            event_date: formData.eventDate,
            event_location: formData.eventLocation,
            event_details: formData.eventDetails,
            vision: formData.vision,
            deadline: formData.deadline,
            heard_about: formData.heardAbout,

            decoration_method: (formData.projectTypes || []).join(', '),
            source: formData.heardAbout,
        }),
    }).then((r) => {
        if (!r.ok) throw new Error('Lead send failed: ' + r.status);
        return r.json();
    });
};
