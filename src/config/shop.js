// Earthbound Inc. (Grand Rapids, MI) - custom screen print + embroidery since 1978.
//
// Every value here is lifted from the Typeform this form replaces, so the two are
// interchangeable to a visitor. Do not "improve" them.
//
//   form  oDOWHJbD  "Earthbound Inc"   (921 completed responses, Dec 2023 - Aug 2026)
//   theme KITfG4JN  "My theme"
//
// The theme's four colors, its font, its logo placement and its corner radius are the
// whole visual identity. Typeform names them question / answer / button / background;
// the CSS custom properties below keep those names so a future diff against the API
// response is a straight read.
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

    // Typeform theme KITfG4JN, verbatim.
    theme: {
        font: 'Quantico',
        question: '#2E3035',   // question / heading ink
        answer: '#037EB4',     // typed answers + choice text
        button: '#008AC8',     // primary button fill
        background: '#F3F3F0', // page ground
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
