export const prompts: Record<number, string> = {
  1: `Create a vertical 9:16 premium sneaker sale poster, ultra high resolution, photorealistic product photography, EXACT REPLICA.

LAYOUT:
- Top center: text "{{store_name}}" very small serif, white #FFFFFF, extreme letter-spacing 500, all caps
- Center: text "{{headline}}" in ONE SINGLE LINE, massive scale, elegant thin Didone serif, color navy #0A1931, tracking 200, centered
- Below: text "{{discount_offer}}" small sans-serif, {{main_color}}, tracking 400, centered
- Bottom center: text "{{contact_information}}  •  {{website_instagram}}" ultra tiny minimalist sans-serif, white, tracking 200

BACKGROUND:
gradient from solid dark navy #0A1931 at top, via radial spotlight off-white #F8F6F0 textured paper in middle, to solid electric blue {{main_color}} at bottom, soft concrete paper grain, paper texture, minimal blueprint lines - only 4-5 ultra-thin diagonal and orthogonal lines in {{main_color}} at 40% opacity crossing the poster

FRAME:
DOUBLE ultra-thin offset frame - outer line white at 20% opacity, inner line {{main_color}} at 40% opacity offset by 8px, 20px margin from edge, plus 2 small overlapping offset rectangles at bottom area, architectural blueprint style

SNEAKER - EXACT MODEL:
ONE white chunky runner sneaker, white mesh panels at side and toebox, white leather overlays, thick white midsole with small blue rubber outsole pads only at heel and toe, blue heel tab, blue tongue tag with white stripe, blue curved side stripe on mesh, blue zigzag stitching at edges (toebox, side panel, heel), white laces, small fabric pull-tab at heel, floating angled 3/4 side view in center-lower area, large very soft diffused realistic drop shadow 100px below, studio lighting, 8k detail

STYLE:
minimalist luxury, premium sneaker boutique, exceptionally clean product design, high-end fashion magazine cover, empty negative space, sophisticated

NEGATIVE:
no two lines for {{headline}}, no cartoon, no illustration, no outline sneaker, no dark background only, no cheap sale graphics, no extra text, no people, no dense grid

--ar 9:16 --style raw --quality high --chaos 5`,

  2: `Elegant luxury perfume e-commerce advertisement, dark midnight theme.

On the left side, large elegant serif typography in champagne gold:
Top text: "{{campaign_headline}}" in big capital letters, stacked in two balanced lines
Middle: "{{offer}}" very large, elegant serif
Bottom small: "{{brand}} {{product}}"

On the right side: a luxury perfume bottle, rectangular with rounded edges, dark deep purple translucent glass with vertical ribbed texture at bottom, black label with gold text "{{brand}}" on top, "{{product}}" in middle, "EAU DE PARFUM • 50 ML" small at bottom. Gold faceted geometric cap.

Background: dark gradient from black to deep midnight purple #1A1025, with subtle golden dust particles, stars, and soft smoky mist. Studio lighting, high-end commercial, ultra realistic, 8k, sharp focus.

Foreground decoration at the base of the bottle: one purple orchid flower, dried dark petals, small lavender sprigs, tiny clear amethyst crystals scattered.

Aspect ratio 1:1, photorealistic, luxury magazine ad style -- no other text, no people, no hands.`,

  3: `Create an ultra eye-catching, professional fast food advertising poster, vertical 4:5 format, black background.

At the top: text "{{restaurant}}" in small white bold sans-serif, centered.

Below: big bold text "{{meal}}" in massive yellow capital letters, extra bold, centered. Under it "{{offer}}" in the same yellow but with a glowing neon outline effect, bright yellow neon glow.

In the center: ultra-realistic "{{product_type}}" photography - two thick crusty smashed beef patties, real melted cheddar cheese dripping down heavily, sesame bun with visible sesame seeds, pickles and thin white onion slices, cinematic studio lighting, sharp focus, no AI artifacts.

To the right of the burger: "{{side_dish}}", styled as a premium appetizing side dish.

Background effects: intense dramatic fire flames behind burger and fries, sparks and embers flying around, thick grill smoke swirling on both sides, orange fire light reflecting on the bun and fries, cinematic lighting.

Style: commercial food photography like a premium global fast food campaign, ultra-realistic, not AI-looking, high contrast, mouth-watering.

NO small text at bottom, NO price tag, clean bottom area, only the burger, fries and fire.`,

  4: `Create a minimalist e-commerce furniture promo image for "{{brand}} - {{collection}}". Clean, modern, Scandinavian interior with warm autumn tones - beige, taupe, warm wood, linen. A beautiful minimalist "{{room_type}}" with a low-profile beige linen sofa on the right side, wooden low coffee table in center, neutral decor with pampas grass in ceramic vase.

Left side has a large off-white / light beige gradient overlay for text readability.

Typography layout:
Top left small caps: "{{eyebrow}}" - letter spaced, light brown/gray
Center left HUGE bold condensed sans-serif: "{{headline}}" split across balanced lines, color dark warm brown #4A3728
Bottom left: "{{brand}}" in black modern sans-serif, below it "{{collection}}" in smaller brown
Bottom left button: rounded rectangle in taupe #C19A7A with white text "{{cta}}"

Soft natural light from large window in background, autumn trees blurred outside, wooden slat wall detail on right, jute rug, ceramic vases on floor, editorial high-end e-commerce banner style, 16:9 horizontal, ultra clean, aesthetic, photorealistic, 8k.`,

  5: `Create a clean beauty skincare social media post for brand "{{brand}}", product "{{product}}", main benefit "{{claim}}".

Design aesthetic: minimal clean beauty campaign, text "{{headline}}" bold at the top, "{{subheadline}}" smaller below it, brand name "{{brand}}" and "{{product}} - {{claim}}" on the bottle label and at the bottom.

Soft gradient background from light yellow to soft pink. Elegant, modern, glowing skin vibe, with a minimalist transparent serum bottle with beige dropper cap, filled with golden serum and water droplets, with dried pampas grass and eucalyptus decor, dewy aesthetic, natural soft light, high-end skincare launch post, 1:1 square format, photorealistic, studio lighting.`,

  6: `Premium dark tech product launch ad for brand "{{brand}}", product "{{product}}", key feature "{{feature}}".

Design aesthetic: premium dark launch visual for modern technology, minimalist futuristic, black background with subtle dark blue gradient and smoky texture, elegant modern typography with text "{{headline}}" bold white at top left, "{{subheadline}}" smaller light blue below, brand "{{brand}}" and "{{product}} - {{feature}}" in light blue at bottom center.

High-end headphones centered, sleek matte black over-ear headphones with soft glowing blue edge light floating, studio lighting, photorealistic, ultra-detailed, modern tech campaign, 1:1 square format, luxury electronics ad.`,

  7: `Real estate luxury flyer for agency "{{agency}}", property type "{{property}}" in "{{location}}", premium modern aesthetic.

VISUAL:
Elegant modern black cube villa, 2-story, floor-to-ceiling glass windows, warm interior lights, twilight blue hour, infinity pool on right, landscaped garden with olive trees and soft ground lights, {{location}} city skyline in background with soft lights, ultra photorealistic, cinematic lighting, 8K, luxury architecture photography.

LAYOUT & TEXT:
Top left: circular beige logo with letter "A" and text "{{agency}}" in gold serif.
Bottom dark navy banner covering 30% of image.
Text in banner:
- Headline in large gold serif bold: "{{headline}}"
- Subline: location pin icon + "{{property}} • {{location}}" in white
- Details line: "{{bedrooms}} • {{bathrooms}} • {{area}} • {{features}}"
- Small line: "Exclusively Listed by {{agency}} • {{listing_details}}"
- Footer right small: "{{cta}} • {{contact}} • {{email}} • {{website}}"

Style: premium dark luxury real estate flyer, minimalist elegant, gold and beige typography on dark navy, sophisticated, modern.

Format: vertical 4:5.`,

  8: `Fashion lookbook editorial campaign for brand "{{brand}}", collection "{{season}}", call to action "{{cta}}".

VISUAL:
High-end fashion model, young woman with long dark wavy hair, natural makeup, wearing "{{garment}}" in "{{garment_color}}" with refined editorial details, lightweight fabric blowing softly, walking pose, side profile looking to right, editorial studio lighting, soft dreamy background with pastel pink to light lavender gradient, minimalistic, high-fashion magazine style, ultra photorealistic, high detail, luxury fashion photography, 8K.

TYPOGRAPHY & LAYOUT:
Top left corner:
- Text "{{headline}}" in a large elegant serif, split across balanced lines, burgundy dark red #8B1A2A
- Below that small: "{{cta}}" in thin spaced sans-serif, burgundy, letter-spacing wide
Bottom center small text: "{{brand}} — {{season}}" in burgundy serif thin

Negative space on left side for text, model on right side of frame.
Style: premium minimalist fashion lookbook, romantic, soft, modern editorial.

Format: vertical 4:5.`,

  9: `Energetic "{{event_type}}" poster for event name "{{event}}", date "{{date}}", location "{{location}}, {{country}}".

VISUAL:
Photorealistic happy diverse group of young adults at a music festival during golden hour sunset, 5 friends in foreground cheering with hands up, laughing, genuine natural faces, not AI-perfect, slight skin texture, confetti falling in orange-gold sky, blurred festival stage with warm lights in background far right, summer atmosphere, natural candid festival photography, documentary style, 8K, shallow depth of field.

LAYOUT & TYPOGRAPHY:
Top section: solid warm orange to yellow gradient sky background.
- Text "{{event}}" in large bold white sans-serif, all caps, thick weight, centered at the top and stacked across two balanced lines
- Below in smaller white sans-serif spaced out, all caps: "{{date}} • {{location}} • {{country}}"

Bottom: soft yellow-orange gradient vignette blending into the crowd, NO banners, NO extra text, NO logos, NO info boxes.

Style: clean modern festival poster, minimal, vibrant, energetic, less graphic design, more real photography, less visibly AI-generated.

Format: vertical 4:5.

Negative prompt: no text at bottom, no LIVE MUSIC banner, no FOOD TRUCKS, no ticket information, no over-sharpened faces, no plastic skin.`,

  10: `Create a premium luxury watch ad, vertical 4:5.

Brand: "{{brand}}"
Collection: "{{collection}}"
Call to action: "{{cta}}"

Visual: black background with subtle dark brown gradient glow bottom right, luxury "{{watch_color}}" automatic watch with matching crocodile leather strap floating centered, studio lighting with soft reflection, ultra photorealistic, 8K, timeless premium campaign.

Text layout: top left in bold white serif: "{{headline}}", below smaller "{{slogan}}". Bottom small: "{{brand}} - {{collection}}" and a small pill button "{{cta}}".

Style: dark luxury e-commerce, minimalist, elegant.`,

  11: `Create a clean shoes promotion ad, vertical 4:5.

Brand: "{{brand}}"
Product name: "{{product}}"
Call to action: "{{cta}}"

Visual: soft off-white to light beige gradient background, modern minimal sneaker "{{product}}" in "{{shoe_color}}" floating centered with soft shadow underneath, premium sneaker studio photography, ultra detailed.

Text layout: top left bold black sans-serif: "{{headline}}" split across balanced lines, "{{slogan}}" small and spaced below that. Bottom: "{{brand}} - {{product}}" and call to action "{{cta}}".

Style: clean launch campaign for footwear, minimalist, light luxury.`,

  12: `Create a refined accessories promo ad, vertical 4:5.

Brand name: "{{brand}}"
Product: "{{product}}"
Call to action: "{{cta}}"

Visual: soft cream to pale yellow gradient background, luxury structured "{{product_color}}" leather handbag with gold hardware on minimal pedestal, editorial studio lighting, timeless elegance, ultra photorealistic.

Text layout: top left black serif: "{{headline}}" big and bold, "{{subheadline}}" small below. Bottom: "{{brand}} - {{product}}" and "{{cta}}".

Style: refined editorial promotion for timeless accessories, minimal fashion.`,
};
