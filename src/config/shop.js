// Earthbound Inc. (Grand Rapids, MI) - custom screen print + embroidery since 1978.
//
// Every LAYOUT value here is lifted from the Typeform this form replaces, so the two
// behave the same to a visitor. Do not "improve" those. COLOUR and TYPE moved to the
// Ink Room brand on 2026-09-16, which was a deliberate, specced departure rather than
// drift. See earthbound-inc/brand/BRAND-SPEC.md.
//
//   form  oDOWHJbD  "Earthbound Inc"   (921 completed responses, Dec 2023 - Aug 2026)
//   theme KITfG4JN  "My theme"
//
// The theme block below keeps Typeform's own field names (question / answer / button /
// background) so a future diff against the Typeform API response is still a straight
// read, but the VALUES are now Ink Room tokens rather than the Typeform theme's. The
// CSS custom properties in App.css were renamed to --eb-* to match.
//
// shop_id must match the brand-kit file in obg-mail-api/shops/<id>.json. That registry
// owns the email styling, recipients and copy, so nothing sensitive lives in this front end.
const SHOP_CONFIG = {
    shop_id: 'earthbound',
    shop_name: 'Earthbound Inc.',
    shop_email: 'Sales@Earthboundinc.com',
    shop_owner_email: 'Art@Earthboundinc.com',
    shop_phone: '(616) 774-0096',
    owner_name: 'Nyle',

    // WAS Typeform theme KITfG4JN, verbatim. Colour and type deliberately departed
    // on 2026-09-16 under the propagation checklist in BRAND-SPEC.md. #008AC8 carries
    // a white label at 3.84:1, under the AA floor, and it is in neither the logo, the
    // 1978 sign nor the shop. The geometry below is still the measured Typeform.
    theme: {
        font: 'Poppins / Archivo',
        question: '#24221A',   // ink. headings and question copy
        answer: '#23695B',     // pine. typed answers + choice text
        button: '#23695B',     // pine. primary button fill, white label 6.48:1
        background: '#F2F0E4', // paper. the warm ground
        roundedCorners: 'small',
        transparentButton: false,
        logo: { placement: 'left', size: 'small' },
        screens: { fontSize: 'small', alignment: 'center' },
        fields: { fontSize: 'medium', alignment: 'left' },
    },

    // settings.progress_bar = 'proportion', show_progress_bar = true,
    // show_typeform_branding = false.
    progressBar: 'proportion',
};

export default SHOP_CONFIG;
