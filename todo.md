* Change font in main.css to Roboto (or not)
* Deep Dive in SEO and check author schema and stuff like that -- DONE 80% SEO FOR POSTS?
* Blog Post Page
* Deep dive in customer analytics Google Analytics AND Anonymous using https://posthog.com/
* Add lang cookie that will be read to serve the correct view.
* Add a type safe system for setting cookies. (Slightly overkill)

[Violation] Added non-passive event listener to a scroll-blocking <some> event. Consider marking event handler as 'passive' to make the page more responsive. See <URL>

Περισσότερες πληροφορίες για την πολιτική απορρήτου της Cloudflare θα βρεις εδώ και ιδίως για την υπηρεσία Bot Management που χρησιμοποιούμε εδώ.
https://developers.cloudflare.com/fundamentals/reference/policies-compliances/cloudflare-cookies/#__cf_bm-cookie-for-cloudflare-bot-products
https://www.cloudflare.com/privacypolicy/

Περισσότερες πληροφορίες για την πολιτική απορρήτου της Google μπορείς να βρεις εδώ και για τη χρήση cookies στο πλαίσιο της υπηρεσίας Google Analytics εδώ. Έχεις τη δυνατότητα να αποκλείσεις συνολικά τη συλλογή δεδομένων σου μέσω Google Analytics, εγκαθιστώντας στο φυλλομετρητή σου αυτό το πρόσθετο (plug-in).

https://policies.google.com/?hl=el&gl=el
https://www.google.com/analytics/terms/us.html

* Use S3 with a cloudfront CDN in future for many reasons.

* An n8n flow that:
	1) Uses sharp to make the images into .webp or .avif.
	2) Uses a free AI to generate alt text.
	3) Translates the text into different languages provided, with Google Translate or whatever.
	4) Produce different sizes of the images based 1/2, 1/3, 1/4 etc.
