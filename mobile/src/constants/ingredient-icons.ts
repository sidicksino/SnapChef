// One representative emoji per ingredient name, for the ingredient-review
// list — there's no food photography, and an emoji per row reads far
// better than a bare list. Originally built against a 120-class on-device
// model's specific (often South-Asian-English) vocabulary; ingredient
// detection is now Gemini vision instead (see snapchef-ingredient-detection
// in project memory), which uses everyday English — common aliases (e.g.
// "Eggplant" alongside "Brinjal", "Bell Pepper" alongside "Capsicum") are
// kept beside the originals rather than replacing them, so both still
// resolve. Many entries are close-but-not-exact (no dedicated emoji exists
// for e.g. "Dill" or "Okra") — falls back to a sensible category emoji
// (🥬 for leafy greens, 🫘 for legumes, etc.) rather than leaving a blank.
const ICONS: Record<string, string> = {
  'Akabare Khursani': '🌶️',
  Apple: '🍎',
  Artichoke: '🥬',
  'Ash Gourd': '🥒',
  Asparagus: '🌿',
  Avocado: '🥑',
  Bacon: '🥓',
  'Bamboo Shoots': '🎋',
  Banana: '🍌',
  Beans: '🫘',
  'Beaten Rice': '🍚',
  Beef: '🥩',
  Beetroot: '🍠',
  'Bethu ko Saag': '🥬',
  'Bitter Gourd': '🥒',
  'Black Lentils': '🫘',
  'Black Beans': '🫘',
  'Bottle Gourd': '🥒',
  Bread: '🍞',
  Brinjal: '🍆',
  'Broad Beans': '🫘',
  Broccoli: '🥦',
  'Buff Meat': '🥩',
  Butter: '🧈',
  Cabbage: '🥬',
  Capsicum: '🫑',
  'Bell Pepper': '🫑', // = Capsicum above
  Carrot: '🥕',
  Cassava: '🥔',
  Cauliflower: '🥦',
  Chayote: '🥒',
  Cheese: '🧀',
  Coconut: '🥥',
  'Chicken Gizzards': '🍗',
  Chicken: '🍗',
  Chickpeas: '🫘',
  'Chili Pepper': '🌶️',
  'Chili Powder': '🌶️',
  'Chowmein Noodles': '🍜',
  Cinnamon: '🧂',
  Coriander: '🌿',
  Cilantro: '🌿', // same plant, US recipe naming — not one of the 120 trained classes
  Corn: '🌽',
  Cornflakes: '🥣',
  'Crab Meat': '🦀',
  Cucumber: '🥒',
  Dill: '🌿',
  Egg: '🥚',
  Eggplant: '🍆', // = Brinjal above
  'Farsi ko Munta': '🥬',
  'Fiddlehead Ferns': '🌿',
  Fish: '🐟',
  'Garden Peas': '🫛',
  'Garden Cress': '🌿',
  Garlic: '🧄',
  Ginger: '🫚',
  'Green Brinjal': '🍆',
  'Green Lentils': '🫘',
  'Green Mint': '🌿',
  'Green Peas': '🫛',
  'Green Soyabean': '🫛',
  Greens: '🥬', // catches "mixed greens" and similar
  Gundruk: '🥬',
  Ham: '🍖',
  Ice: '🧊',
  'Jack Fruit': '🍈',
  Grape: '🍇',
  Kale: '🥬',
  Ketchup: '🍅',
  Lapsi: '🍈',
  Lemon: '🍋',
  Lettuce: '🥬',
  Lime: '🍋',
  'Long Beans': '🫘',
  Mango: '🥭',
  Masyaura: '🫘',
  Milk: '🥛',
  'Minced Meat': '🥩',
  'Moringa Leaves': '🥬',
  Mushroom: '🍄',
  Mutton: '🥩',
  Nutrela: '🫘',
  Okra: '🌿',
  'Olive Oil': '🫒',
  'Onion Leaves': '🧅',
  Scallion: '🧅', // = Onion Leaves above
  Onion: '🧅',
  Orange: '🍊',
  Tangerine: '🍊', // close enough to Orange to share an icon
  Palak: '🥬',
  Palungo: '🥬',
  Paneer: '🧀',
  Papaya: '🍈',
  Pea: '🫛',
  Pear: '🍐',
  Pesto: '🌿',
  Pomegranate: '🌱', // no dedicated pomegranate emoji in wide use
  'Pointed Gourd': '🥒',
  Pork: '🥩',
  Potato: '🥔',
  Pumpkin: '🎃',
  Radish: '🥕',
  'Rahar ko Daal': '🫘',
  'Rayo ko Saag': '🥬',
  'Red Beans': '🫘',
  'Red Lentils': '🫘',
  Rice: '🍚',
  Sajjyun: '🥬',
  Salt: '🧂',
  // A bare "Pepper" alias would be ambiguous — could mean this spice or a
  // bell pepper/capsicum, and those need different icons. Spelling out the
  // specific compound term avoids that; it still wins over any future bare
  // "Pepper" entry since longer keys are checked first.
  'Black Pepper': '🧂',
  Sausage: '🌭',
  'Snake Gourd': '🥒',
  'Soy Sauce': '🧴',
  Soyabean: '🫘',
  'Sponge Gourd': '🥒',
  'Stinging Nettle': '🌿',
  Strawberry: '🍓',
  Sugar: '🧂',
  'Sweet Potato': '🍠',
  'Taro Leaves': '🥬',
  'Taro Root': '🥔',
  'Thukpa Noodles': '🍜',
  Tofu: '🍽️',
  Tortellini: '🍝',
  Pasta: '🍝',
  Tomato: '🍅',
  'Tori ko Saag': '🥬',
  'Tree Tomato': '🍅',
  Turnip: '🥔',
  Walnut: '🌰',
  Watermelon: '🍉',
  Wheat: '🌾',
  'Yellow Lentils': '🫘',
  Kimchi: '🥬',
  Mayonnaise: '🧴',
  Noodle: '🍜',
  Seaweed: '🌿',
};

const FALLBACK_ICON = '🍽️';

/** Looks up an emoji for a (case-insensitive) ingredient name. Falls back to
 * a plate emoji for anything not in the list above — both manual entry and
 * Gemini's detected/generated ingredient names are free-text, not
 * constrained to a fixed vocabulary. */
export function getIngredientIcon(name: string): string {
  const exact = ICONS[name];
  if (exact) return exact;
  const lower = name.trim().toLowerCase();
  const match = Object.keys(ICONS).find((key) => key.toLowerCase() === lower);
  return match ? ICONS[match] : FALLBACK_ICON;
}

const ICON_KEYS_BY_LENGTH_DESC = Object.keys(ICONS).sort((a, b) => b.length - a.length);

/** Same idea, but for a full recipe-ingredient line like "1 ripe avocado,
 * peeled, pitted, and diced" rather than a bare name — an exact match will
 * essentially never hit that, so this instead checks whether any known
 * ingredient name appears as a word within the text. Longest names are
 * checked first so e.g. "Sweet Potato" wins over a bare "Potato" match. */
export function getIngredientIconFuzzy(text: string): string {
  const lower = text.toLowerCase();
  for (const key of ICON_KEYS_BY_LENGTH_DESC) {
    const escaped = key.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Recipe text is almost always plural ("2 tomatoes", "sliced onions")
    // while the class names above are singular — allow an optional
    // trailing s/es so "tomato" still matches inside "tomatoes".
    const pattern = new RegExp(`\\b${escaped}(?:e?s)?\\b`);
    if (pattern.test(lower)) return ICONS[key];
  }
  return FALLBACK_ICON;
}
