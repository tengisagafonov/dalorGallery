/**
 * Runde 2: die im Review abgelehnten Vorlagen bekommen mehr Farbe und Licht.
 * Kritik war durchgehend "zu basic, keine Farben, schaut tot aus" — geändert
 * werden deshalb Lichtstimmung und Farbigkeit, nicht das Layout.
 */
const fs = require('fs');
const dir = 'C:/Users/User/OneDrive/Desktop/dalor-gallery/real-estate-specs/';
const dateien = ['01-10.json', '11-20.json', '21-30.json', '31-40.json', '41-50.json'];

// slug -> Liste von [alt, neu]
const patches = {
  'real-estate-just-listed-suburban-home': [
    ['Late morning light, clear sky, a young maple beside the covered porch.',
     'Warm late afternoon sun rakes across the facade, a deep blue sky above, a red leaved maple beside the covered porch and flower beds along the path.'],
    ['Clean daylight architectural photography, straight verticals, crisp readable typography.',
     'Rich colour architectural photography in golden light, saturated blue sky and green lawn, warm shadows, high contrast, crisp readable typography.'],
  ],
  'real-estate-sold-family-house': [
    ['photographed straight on from the pavement in soft afternoon light.',
     'photographed straight on from the pavement in warm low evening sun that makes the brick glow orange.'],
    ['Hedges to both sides, an empty driveway.',
     'Deep green hedges to both sides, a blue sky, flowering pots on the step.'],
    ['Documentary daylight photography, soft shadows, crisp readable typography.',
     'Warm evening photography, glowing brick, saturated greens, long shadows, strong colour, crisp readable typography.'],
  ],
  'real-estate-new-development-render': [
    ['Bright even sky, a landscaped path in front, a few figures walking, rendered in the clean flat light typical of a project visual.',
     'Deep blue sky with light cloud, a landscaped path with flowering beds in front, a few figures walking, rendered in warm late afternoon sun with long shadows.'],
    ['Architectural visualisation style, clean flat daylight, crisp readable typography.',
     'Architectural visualisation in warm golden light, saturated sky and planting, strong colour contrast, crisp readable typography.'],
  ],
  'real-estate-agency-dream-home': [
    ['Soft late afternoon sun, a bicycle leaning by the path.',
     'Strong golden hour sun, a deep blue sky, a red bicycle leaning by the path and a border of bright flowers.'],
    ['Warm lifestyle architectural photography, soft golden light, crisp readable typography.',
     'Warm lifestyle architectural photography in rich golden hour light, saturated colour, glowing windows, crisp readable typography.'],
  ],
  'real-estate-price-drop-apartment': [
    ['Empty and freshly painted, daylight flooding in from the left, {{detail_note}} visible through the glass.',
     'Warm afternoon sun floods in from the left and lays bright patches across the floor, a large plant in the corner and {{detail_note}} in full colour through the glass.'],
    ['Bright interior real estate photography, natural window light, crisp readable typography.',
     'Sunlit interior photography, warm oak tones against white walls, strong light patches, rich colour, crisp readable typography.'],
  ],
  'real-estate-commercial-office-space': [
    ['Cool neutral daylight, no furniture, structural columns receding into depth.',
     'Low afternoon sun pours through the window band and throws long bright bars across the floor, a blue sky and green street trees outside, structural columns receding into depth.'],
    ['Cool architectural interior photography, wide angle, neutral white balance, crisp readable typography.',
     'Wide angle interior photography in warm raking sunlight, strong light and shadow, warm concrete against a blue sky, crisp readable typography.'],
  ],
  'real-estate-land-for-sale-plot': [
    ['Hard midday light, short shadows.',
     'Late golden hour light, long tree shadows across the grass, the meadow in vivid greens with wildflowers, neighbouring fields in gold and deep green.'],
    ['Aerial drone photography, top down perspective, high midday sun, crisp readable typography.',
     'Aerial drone photography, top down perspective, warm low sun, saturated greens and golds, crisp readable typography.'],
  ],
  'real-estate-rental-studio-city': [
    ['Lamps on, city dusk outside the glass, everything tidy and neutral in tone.',
     'Lamps on and glowing amber, a burning orange sunset over the city outside the glass, a patterned rug and coloured cushions on the bed.'],
    ['Warm interior photography, mixed lamp and dusk light, crisp readable typography.',
     'Warm interior photography, amber lamp light against a violet and orange sunset, rich saturated colour, crisp readable typography.'],
  ],
  'real-estate-interior-collage-loft': [
    ['Consistent daylight and colour across all four.',
     'Warm afternoon sun in every frame, glowing red brick, green plants and deep coloured textiles, consistent rich colour across all four.'],
    ['Consistent interior real estate photography, natural daylight, crisp readable typography.',
     'Consistent interior photography in warm sunlight, saturated brick and foliage, strong contrast, crisp readable typography.'],
  ],
  'real-estate-under-contract-bungalow': [
    ['Late afternoon sun from the side throws long shadows over the path. Calm suburban street, no cars.',
     'Low golden sun from the side sets the grasses alight and throws long shadows over the path, a deep blue sky, flowering shrubs along the front. Calm suburban street, no cars.'],
    ['Late afternoon architectural photography, long shadows, crisp readable typography.',
     'Golden hour architectural photography, glowing grasses, saturated sky, long shadows, crisp readable typography.'],
  ],
  'real-estate-open-house-weekend-flyer': [
    ['Bright breezy daylight, a few clouds, balloons tied to the gate post in plain colours.',
     'Bright breezy sunshine under a deep blue sky, bright red and yellow balloons tied to the gate post, flower beds either side of the path.'],
    ['Bright natural daylight photography, light breeze, crisp readable typography.',
     'Bright saturated daylight photography, strong blue sky, vivid colour, cheerful and lively, crisp readable typography.'],
  ],
  'real-estate-investment-opportunity': [
    ['Flat overcast daylight so the facade reads evenly, a row of street trees in front.',
     'Clear afternoon sun on the facade under a deep blue sky, a row of green street trees casting shadows across the pavement.'],
    ['Flat overcast architectural photography, even facade lighting, crisp readable typography.',
     'Sunlit architectural photography, blue sky, warm facade and green foliage, clean strong colour, crisp readable typography.'],
  ],
  'real-estate-virtual-tour-promo': [
    ['Clean daylight, warm neutral tones.',
     'Warm afternoon sun falls in bright patches across the floor, green plants and a deep coloured rug lift the room.'],
    ['Text layout: a large circular play button in {{accent_color}} sits dead centre with a soft shadow. Above it "{{headline_text}}" in two short lines of bold caps. Below the button, small and centred, "{{duration_line}}".',
     'Text layout: "{{headline_text}}" is set across the upper image in two short lines of bold caps over a soft {{accent_color}} gradient. Under it, small and centred, "{{duration_line}}".'],
    ['Interior walkthrough photography, wide framing, clean daylight, crisp readable typography.',
     'Interior walkthrough photography, wide framing, warm sunlight and saturated colour, crisp readable typography.'],
  ],
  'real-estate-free-valuation-offer': [
    ['Bright even daylight, nothing else in the frame.',
     'Warm evening sun on the siding under a deep blue sky, a vivid green lawn and a flowering shrub by the porch.'],
    ['Bright daylight exterior photography, low angle, clean sky, crisp readable typography.',
     'Golden hour exterior photography, low angle, saturated blue sky and green lawn, crisp readable typography.'],
  ],
  'real-estate-suburban-new-build-row': [
    ['Fresh turf, young trees staked with ties, clean morning light.',
     'Fresh turf in vivid green, young trees in leaf, warm morning sun glowing on the brick under a clear blue sky.'],
    ['Clean morning architectural photography, receding perspective, fresh landscaping, crisp readable typography.',
     'Warm morning architectural photography, glowing brick, saturated sky and turf, receding perspective, crisp readable typography.'],
  ],
  'real-estate-retail-space-lease': [
    ['Flat daylight, the reflection of the opposite buildings faint in the glass.',
     'Warm afternoon sun down the street, coloured awnings and a blue sky mirrored in the glass, the young plane tree in full green leaf.'],
    ['Flat daylight street photography, glass reflections, crisp readable typography.',
     'Sunlit street photography, colourful reflections in the glass, warm stone and green foliage, crisp readable typography.'],
  ],
  'real-estate-sold-above-asking': [
    ['photographed from a slight angle in flat morning light, {{facade_note}}, tidy front hedge, a For Sale board at the gate with a blank white panel.',
     'photographed from a slight angle in warm morning sun under a blue sky, {{facade_note}}, a deep green hedge and flowering pots, a For Sale board at the gate with a blank white panel.'],
    ['Flat morning exterior photography, even facade light, crisp readable typography.',
     'Warm morning exterior photography, blue sky, saturated hedge and painted door, crisp readable typography.'],
  ],
  'real-estate-listing-carousel-cover': [
    ['shot straight on in bright even light, the frame cropped tight so the building fills it edge to edge. A slim strip of sky at the top, a clipped lawn at the bottom, deliberate and graphic.',
     'shot straight on in strong afternoon sun, the frame cropped tight so the building fills it edge to edge. A slim strip of deep blue sky at the top, a vivid green lawn at the bottom, deliberate and graphic.'],
    ['Straight on architectural photography, bright even light, graphic framing, crisp readable typography.',
     'Straight on architectural photography, hard sunlight and crisp shadows, saturated blue and green, graphic framing, crisp readable typography.'],
  ],
  'real-estate-auction-notice': [
    ['photographed square on in flat overcast light. Weeds along the path, blinds down in the upper windows, a plain hoarding panel on the ground floor.',
     'photographed square on in warm low sun that picks out the worn paint, ivy climbing one side, weeds along the path, blinds down in the upper windows, a plain hoarding panel on the ground floor.'],
    ['Flat overcast documentary photography, square on framing, crisp readable typography.',
     'Documentary photography in warm low sun, weathered colour and green ivy against a blue sky, square on framing, crisp readable typography.'],
  ],
  'real-estate-home-office-study': [
    ['Morning light across the desk, a closed notebook and a cup on it, the garden soft and green outside.',
     'Warm morning sun lays a bright band across the desk, coloured book spines fill the shelves, a closed notebook and a cup on the desk, the garden vivid green outside.'],
    ['Morning interior photography, warm wood tones, soft garden light, crisp readable typography.',
     'Morning interior photography, glowing wood, coloured spines and vivid garden green, strong light band, crisp readable typography.'],
  ],
  'real-estate-relocation-service': [
    ['the door standing open to daylight and a van tailgate beyond. Nobody in frame, mid morning light, everything still.',
     'the door standing open to warm sunlight and a van tailgate beyond. Nobody in frame, the sun throwing a bright wedge across the floor, a green street outside, everything still.'],
    ['Documentary interior photography on moving day, mid morning daylight, crisp readable typography.',
     'Documentary interior photography on moving day, warm sun through the open door, saturated colour, crisp readable typography.'],
  ],
};

let geaendert = 0;
const nichtGefunden = [];

for (const datei of dateien) {
  const pfad = dir + datei;
  const daten = JSON.parse(fs.readFileSync(pfad, 'utf8'));
  let dirty = false;
  for (const t of daten) {
    const p = patches[t.slug];
    if (!p) continue;
    for (const [alt, neu] of p) {
      if (!t.prompt.includes(alt)) { nichtGefunden.push(t.slug + ' :: ' + alt.slice(0, 45)); continue; }
      t.prompt = t.prompt.replace(alt, neu);
      dirty = true;
    }
    geaendert++;
  }
  if (dirty) fs.writeFileSync(pfad, JSON.stringify(daten, null, 2) + '\n');
}

console.log('gepatchte Vorlagen: ' + geaendert + ' von ' + Object.keys(patches).length);
if (nichtGefunden.length) {
  console.log('NICHT GEFUNDEN:');
  nichtGefunden.forEach(x => console.log('  - ' + x));
}
