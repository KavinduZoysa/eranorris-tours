// Destination photo galleries. The first photo of every gallery is the destination's main
// photo (DESTS[].photo in destinations.mjs); the names listed here are added after it.
//
// Only the business's own photos are used for these extra slides: the owner's tour album
// (~/villas/tours) and photos already published on eranorrissrilanka.com. Each one was
// chosen only where the subject and place are identifiable from the photo itself; anything
// uncertain was left out. Confirm with site.config.mjs → confirmed.photoRights (rights, and
// that people shown are happy to appear). Photo gaps are listed in docs/research/photos.md.
//
// GALLERY_IMAGES fields
//   alt      what the photo shows (required)
//   caption  optional visible caption — use it when the subject is near, not in, the place
//   focus    [x, y] focal point (0–1) for the 3:2 crop
//   from     source file: 'tours:<path under ~/villas/tours>' or 'villa-site:<path under the
//            villa site's assets/images>' (used only by scripts/prepare-images.mjs)

export const GALLERY_IMAGES = {
  'sigiriya-lion-paws': {
    alt: 'The giant stone lion’s paws at the foot of the final staircase up Sigiriya rock',
    focus: [0.5, 0.6],
    from: 'tours:sigiriya/WhatsApp Image 2026-10-14 at 12.35.22 PM.jpeg',
  },
  'sigiriya-water-gardens': {
    alt: 'The straight path through the water gardens leading towards Sigiriya rock',
    focus: [0.55, 0.45],
    from: 'tours:sigiriya/WhatsApp Image 2026-10-14 at 12.35.22 PM (3).jpeg',
  },
  'sigiriya-summit-ruins': {
    alt: 'Brick foundations of the palace on the summit of Sigiriya, with forest stretching to the hills',
    focus: [0.5, 0.5],
    from: 'tours:sigiriya/WhatsApp Image 2026-10-14 at 12.35.15 PM (2).jpeg',
  },
  'sigiriya-summit-view': {
    alt: 'View from the top of Sigiriya over unbroken forest, with the rock’s shadow below',
    focus: [0.5, 0.6],
    from: 'tours:sigiriya/WhatsApp Image 2026-10-14 at 12.35.19 PM (1).jpeg',
  },

  'galle-clock-tower-bastion': {
    alt: 'Galle Fort’s clock tower above the grassy ramparts and a stone bastion',
    focus: [0.55, 0.5],
    from: 'villa-site:whale-watching-and-galle/webp/gall_fort_tour_3.webp',
  },
  'galle-fort-from-above': {
    alt: 'The clock tower and land-side ramparts of Galle Fort, with the harbour beyond',
    focus: [0.5, 0.55],
    from: 'villa-site:whale-watching-and-galle/webp/galle_fort_tour_1.webp',
  },
  'galle-ramparts-sea': {
    alt: 'Walkway along Galle Fort’s ramparts beside the sea',
    focus: [0.45, 0.6],
    from: 'tours:galle-fort/WhatsApp Image 2026-10-14 at 12.36.34 PM (1).jpeg',
  },
  'galle-jungle-beach': {
    alt: 'Clear turquoise water at Jungle Beach',
    caption: 'Jungle Beach, near Unawatuna, a short drive from Galle',
    focus: [0.5, 0.55],
    from: 'villa-site:whale-watching-and-galle/webp/jungle_beach_tour_1.webp',
  },

  'mirissa-whale-tail': {
    alt: 'A whale’s tail rising out of the sea',
    caption: 'Whale watching off Mirissa — sightings are never guaranteed',
    focus: [0.5, 0.45],
    from: 'villa-site:whale-watching-and-galle/whale_watching_1.jpg',
  },
  'mirissa-coconut-tree-hill': {
    alt: 'Tall coconut palms on the headland of Coconut Tree Hill above the sea',
    focus: [0.5, 0.5],
    from: 'villa-site:whale-watching-and-galle/coconut_tree_hill_1.jpeg',
  },

  'yala-elephants': {
    alt: 'Wild elephants beside a waterhole in dry scrub',
    focus: [0.75, 0.5],
    from: 'tours:yala/WhatsApp Image 2026-10-14 at 12.38.18 PM.jpeg',
  },
  'yala-buffalo': {
    alt: 'A water buffalo standing at the edge of a lake',
    focus: [0.3, 0.6],
    from: 'tours:yala/WhatsApp Image 2026-10-14 at 12.38.16 PM (1).jpeg',
  },
  'yala-crocodile': {
    alt: 'A crocodile with open jaws basking at the water’s edge',
    focus: [0.5, 0.5],
    from: 'tours:yala/WhatsApp Image 2026-10-14 at 12.38.17 PM (1).jpeg',
  },
  'yala-spotted-deer': {
    alt: 'Two spotted deer grazing among dry trees',
    focus: [0.5, 0.5],
    from: 'tours:yala/WhatsApp Image 2026-10-14 at 12.38.17 PM (2).jpeg',
  },

  'hikkaduwa-tsunami-museum': {
    alt: 'A rusted railway carriage on display at the Tsunami Museum',
    caption: 'The Tsunami Museum, near Hikkaduwa',
    focus: [0.5, 0.5],
    from: 'villa-site:around-hikkaduwa/webp/tsunami_museum_1.webp',
  },
  'hikkaduwa-rathgama-lagoon': {
    alt: 'Sunset over the still water of Rathgama Lagoon',
    caption: 'Rathgama Lagoon, a short drive south of Hikkaduwa',
    focus: [0.5, 0.5],
    from: 'villa-site:kayak/kayak1.jpeg',
  },
  'hikkaduwa-turtle-hatchery': {
    alt: 'A sea turtle swimming in a tank at a hatchery',
    caption: 'A turtle hatchery near Hikkaduwa — a captive facility, not a wild sighting',
    focus: [0.5, 0.5],
    from: 'villa-site:around-hikkaduwa/webp/turtle_5.webp',
  },

  'ella-nine-arches-bridge': {
    alt: 'The stone Nine Arches Bridge curving through the jungle',
    focus: [0.6, 0.5],
    from: 'tours:galle/WhatsApp Image 2026-10-14 at 12.34.39 PM.jpeg',
  },

  'nuwara-eliya-tea-estate': {
    alt: 'Rows of tea bushes on a hill-country estate under a blue sky',
    focus: [0.5, 0.6],
    from: 'tours:galle/WhatsApp Image 2026-10-14 at 12.34.49 PM.jpeg',
  },
  'nuwara-eliya-labookellie': {
    alt: 'The Labookellie sign on a hillside of tea bushes',
    caption: 'Labookellie tea estate, on the road from Kandy to Nuwara Eliya',
    focus: [0.5, 0.3],
    from: 'tours:galle/WhatsApp Image 2026-10-14 at 12.34.53 PM.jpeg',
  },
};

export const GALLERIES = {
  sigiriya: ['sigiriya-lion-paws', 'sigiriya-water-gardens', 'sigiriya-summit-ruins', 'sigiriya-summit-view'],
  galle: ['galle-clock-tower-bastion', 'galle-fort-from-above', 'galle-ramparts-sea', 'galle-jungle-beach'],
  mirissa: ['mirissa-whale-tail', 'mirissa-coconut-tree-hill'],
  yala: ['yala-elephants', 'yala-buffalo', 'yala-crocodile', 'yala-spotted-deer'],
  hikkaduwa: ['hikkaduwa-tsunami-museum', 'hikkaduwa-rathgama-lagoon', 'hikkaduwa-turtle-hatchery'],
  ella: ['ella-nine-arches-bridge'],
  'nuwara-eliya': ['nuwara-eliya-tea-estate', 'nuwara-eliya-labookellie'],
};
