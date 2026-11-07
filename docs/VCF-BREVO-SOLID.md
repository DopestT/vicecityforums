# VCF newsletter — Brevo Solid (private) #3

This opt-in is exclusive to Vice City Forums. LMTYAI remains on Partytime #2.

## Before enabling
1. Set `BREVO_VCF_API_KEY` as a **Supabase Edge Function secret** in project `mzqplhhtsnahxghxpwcd`, not in public JavaScript or GitHub. The connected Brevo account must be the one with Solid list ID 3.
2. Deploy `supabase/functions/vcf-newsletter-subscribe/index.ts` in that same project with JWT verification **enabled** (default).
3. Confirm VCF has a working email-confirmation flow. Users must confirm email before the opt-in can succeed.
4. Test one controlled confirmed VCF user with consent checked. Verify their address appears in **Solid #3**, not Partytime #2; test without consent and with an unauthenticated request. Check the existing Brevo unsubscribed state stays intact. Remove the test contact if appropriate.
5. Verify forum signup, login, password reset, onboarding and privacy text remain operational on preview before production deployment.
6. Enable VCF-specific marketing/welcome automations separately; adding a contact does not send a welcome email itself.

Consent is optional, defaults off, and is independent of account creation. The endpoint derives the email from Supabase Auth instead of accepting arbitrary addresses. No production changes are performed by this PR until it is reviewed and deployed.

## Caveat
If a confirmed subscriber already exists in Brevo as unsubscribed/blacklisted, the API must not override that status. Monitor Brevo contacts and suppression behavior during the smoke test.
