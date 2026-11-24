# Brochure

Put the expo brochure PDF here as `nepal-poultry-expo-brochure.pdf`
(or set `BROCHURE_FILE_NAME` to a different file name in this folder).

This folder is **not** public. The file is only served through
`/api/brochure/download?token=…`, using a signed link that is issued after a
brochure request has passed validation and reCAPTCHA and has been stored in MongoDB.
Links expire after 7 days.

Until a file is present, brochure requests are still accepted and stored; the success
screen and confirmation e-mail tell the person the brochure will be e-mailed once it
is published.
