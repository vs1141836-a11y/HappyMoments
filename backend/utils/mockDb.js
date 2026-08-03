import bcrypt from 'bcryptjs';

// In-Memory Database Fallbacks
export const mockDb = {
  users: [
    {
      _id: 'user_admin_123',
      name: 'HappyMoments Admin',
      email: 'admin@happymoments.com',
      password: '', // will be hashed in init
      role: 'admin',
      contact: '9876543210',
      wishlistDecorations: [],
      wishlistRentals: [],
    },
    {
      _id: 'user_customer_456',
      name: 'Vijay Kumar',
      email: 'vijay@gmail.com',
      password: '', // will be hashed in init
      role: 'customer',
      contact: '9998887776',
      wishlistDecorations: [],
      wishlistRentals: [],
    }
  ],
  categories: [
    { _id: 'cat_2', name: 'Birthday Decorations', slug: 'birthday-decorations', type: 'decor', description: 'Colorful, themed balloon designs and custom backdrop setups.' },
    { _id: 'cat_3', name: 'Baby Shower Decorations', slug: 'baby-shower-decorations', type: 'decor', description: 'Cute baby themes, pastels, teddy bear props, and balloon arches.' },
    { _id: 'cat_4', name: 'Anniversary Decorations', slug: 'anniversary-decorations', type: 'decor', description: 'Elegant romantic floral setups, rose gold themes, and fairy lights.' },
    { _id: 'cat_9', name: 'Naming Ceremony Decorations', slug: 'naming-ceremony-decorations', type: 'decor', description: 'Floral cradles, hanging wreaths, elegant drapes and name reveal stages.' },
    { _id: 'cat_5', name: 'LED & Neon Lights', slug: 'led-neon-lights', type: 'rental', description: 'Alphabet marquee letters, neon signboards, and ambient event lighting.' },
    { _id: 'cat_6', name: 'Backdrops & Walls', slug: 'backdrops-walls', type: 'rental', description: 'Shimmer walls, round ring backdrops, and artificial flower walls.' },
    { _id: 'cat_7', name: 'Tables & Stands', slug: 'tables-stands', type: 'rental', description: 'Acrylic plinths, cylindrical pedestals, and decorative dessert tables.' },
    { _id: 'cat_8', name: 'Themed Props', slug: 'themed-props', type: 'rental', description: 'Life-sized teddy bears, photo booths, and cartoon props.' },
  ],
  decorations: [
    {
      _id: 'decor_2',
      title: 'Fairy Princess Birthday Stage',
      description: 'Transform your child\'s birthday into a magical wonderland with our Fairy Princess setup. This theme includes organic balloon arches in pastel pink, purple, and peach, beautiful custom plinths wrapped in fairy characters, hanging butterfly shapes, floral details, and warm LED marquee letters.',
      category: 'cat_2',
      theme: 'Fairy & Butterfly',
      price: 16000,
      includedItems: [
        'Custom Circular Backdrop Panel',
        'Pastel Balloon Garland (Pink, Lavender, Orange, White)',
        '3 Character-Wrapped Cylindrical Plinths',
        'LED Marquee Birthday Lettering Sign',
        'Cutout Butterfly Accents & Side Props',
        'Ambient Spotlighting & Floor Framing',
        'Complete On-site Assembly & Teardown'
      ],
      images: [
        'http://localhost:5000/uploads/fairy_birthday_decor.jpg'
      ],
      averageRating: 4.8,
      numReviews: 14
    },
    {
      _id: 'decor_3',
      title: 'Dream Castle Royal Birthday Setup',
      description: 'Make your child feel like royalty with our signature Dream Castle Stage. Featuring a large castle wall cutout backdrop with a rainbow overlay, customized front birthday print table, organic balloon arch in pink and gold chrome, and gold crown accent props.',
      category: 'cat_2',
      theme: 'Royal Castle',
      price: 25000,
      includedItems: [
        'Large Castle Backdrop Frame with Rainbow Overlay',
        'Custom High-Gloss Pink Birthday Banner Table',
        'Royal Crown Stands & Pedestals',
        'Premium Balloon Arch (Pink, Purple, White, Gold Chrome)',
        'Floral Runs & Artificial Rose Borders',
        'Warm LED Uplights & Backlight Panels',
        'Full Setup, Assembly & On-site Teardown'
      ],
      images: [
        'http://localhost:5000/uploads/pink_castle_decor.jpg'
      ],
      averageRating: 4.9,
      numReviews: 18
    },
    {
      _id: 'decor_4',
      title: 'Princess Butterfly Birthday Stage',
      description: 'A fairy tale setting featuring custom princess figures, double arched backdrop panels, and elegant gold butterfly overlays. Accompanied by organic sky blue, pink and white balloon arches, warm string lights, and custom table runners.',
      category: 'cat_2',
      theme: 'Princess & Butterfly',
      price: 22000,
      includedItems: [
        'Double Arched Backdrop Panel Set',
        'Custom Princess Silhouette Cutouts',
        'Organic Balloon Garland (Light Blue, Pink, White)',
        'Hanging Gold Butterly Ornaments',
        'Tall Gold Flower Vase Accents',
        'White Sequin Table runner & Setup',
        'Teardown & Cleanup Services'
      ],
      images: [
        'http://localhost:5000/uploads/princess_butterfly_decor.jpg'
      ],
      averageRating: 4.7,
      numReviews: 9
    },
    {
      _id: 'decor_5',
      title: 'Luxe Purple & Silver Birthday Setup',
      description: 'Celebrate milestone events in style. This luxury setup features deep purple arched panel walls, dimmable neon "Happy Birthday" signs, a large LED lighted "50" sign, white and silver plinths, and a massive purple, lavender, and silver chrome balloon arch.',
      category: 'cat_2',
      theme: 'Purple & Silver',
      price: 19000,
      includedItems: [
        'Triple Arched Deep Purple Backdrop Panels',
        'Dimmable Neon "Happy Birthday" Signboard',
        'Large Dimmable LED "50" Lighted Stand',
        'Organic Balloon Arch (Purple, Lavender, Silver Chrome)',
        'White Cylindrical Pedestal Cake Stands',
        'Artificial Flower Vase Stands',
        'Styling, On-site Delivery & Assembly'
      ],
      images: [
        'http://localhost:5000/uploads/purple_50th_decor.jpg'
      ],
      averageRating: 4.9,
      numReviews: 15
    },
    {
      _id: 'decor_6',
      title: 'Spider Superhero Cartoon Birthday Stage',
      description: 'A spectacular superhero action-themed birthday stage decoration. Includes custom spiderweb-patterned pedestals, large spider superhero character cutouts, and massive balloon garlands in bright red, deep blue, and black chrome.',
      category: 'cat_2',
      theme: 'Superhero Spider',
      price: 18000,
      includedItems: [
        'Arched Cityscape Silhouette Backdrops',
        'Large Spider-Hero Standing Cutout Props',
        'Custom Spiderweb Printed Pedestal Pillars',
        'Organic Balloon Garland (Red, Blue, Black Chrome)',
        'Hanging Spider & Web Overhead Ornaments',
        'High-Power Warm LED Spotlights',
        'On-site Layout Setup & Styling Assembly'
      ],
      images: [
        'http://localhost:5000/uploads/spider_superhero_decor.jpg'
      ],
      averageRating: 4.8,
      numReviews: 19
    },
    {
      _id: 'decor_7',
      title: 'Jungle Cartoon Theme Birthday Stage',
      description: 'A cheerful cartoon animal-themed birthday stage setup for kids. Features friendly jungle cartoon animal cutouts (lions, giraffes, zebras), a vibrant colorful backdrop print, and massive organic balloon arches in shades of green, yellow, and orange.',
      category: 'cat_2',
      theme: 'Jungle Cartoon',
      price: 15000,
      includedItems: [
        'Jungle Canopy Backdrop Arch',
        'Friendly Jungle Animal character Standees',
        'Forest Green & Pastel Yellow Balloon Arch',
        'Custom Wild One Grass Mat Stage Setup',
        'Plush Giraffe & Safari Prop Accents',
        'Children Event Safety Non-toxic Setup',
        'Delivery, Assembly & Teardown Services'
      ],
      images: [
        'http://localhost:5000/uploads/jungle_cartoon_decor.jpg'
      ],
      averageRating: 4.9,
      numReviews: 24
    },
    {
      _id: 'decor_8',
      title: 'Elegance Curtain & Fairy Lights Setup',
      description: 'A beautiful and minimalist outdoor backdrop. White drapery curtains are set on a steel frame, highlighted by hanging warm string fairy lights, a glowing neon "Happy Birthday" sign, and clusters of elegant gold and white balloons at the base.',
      category: 'cat_2',
      theme: 'White, Gold & Lights',
      price: 9500,
      includedItems: [
        'White Chiffon Drapery Backdrop Curtains',
        'Warm Fairy Lights Hanging Garland Strings',
        'Dimmable Neon "Happy Birthday" Light Sign',
        'Base Balloon Garland Accents (Gold & Ivory White)',
        'Heavy Duty Backdrop Steel Stands & Alignments',
        'Delivery, Assembly & Prompt Teardown Setup'
      ],
      images: [
        'http://localhost:5000/uploads/curtain_neon_birthday.jpg'
      ],
      averageRating: 4.8,
      numReviews: 14
    },
    {
      _id: 'decor_9',
      title: 'Blue & Purple LED Birthday Stage',
      description: 'Transform your indoor venue with this luxury purple drapery setup. Adorned with high-density LED hanging string lights, a golden glowing neon "Happy Birthday" sign, organic balloon arches in white, silver, and dark navy, a blue stage carpet, and a custom pedestal cake plinth.',
      category: 'cat_2',
      theme: 'Blue & Purple Neon',
      price: 16500,
      includedItems: [
        'Royal Purple Chiffon Stage Drapery Backdrops',
        'Warm Glowing Neon "Happy Birthday" Signboard',
        'Organic Balloon Arch Garland (White, Silver Chrome, Navy)',
        'Vibrant Royal Blue Carpet Stage Runner Floor',
        'High-density LED Fairy Light Backdrop Hanging',
        'Cylindrical Pedestal Cake Stand (White)',
        'Professional On-site Styling, Assembly & Logistics'
      ],
      images: [
        'http://localhost:5000/uploads/blue_purple_stage.jpg'
      ],
      averageRating: 4.9,
      numReviews: 18
    },
    {
      _id: 'decor_10',
      title: 'Navy Blue & Silver 70th Milestone Backdrop',
      description: 'An elegant milestone birthday backdrop setup. Features a deep navy blue background wall, a "Happy 70th Birthday" silver glitter calligraphy script, organic helium-inflated balloon clusters in navy and silver chrome floating overhead, floor candles in glass vases, and a fresh white flower arrangement.',
      category: 'cat_2',
      theme: 'Navy & Silver 70th',
      price: 14500,
      includedItems: [
        'Deep Navy Blue Custom Backdrop Wall Panel',
        'Silver Glitter Calligraphy Callout script',
        'Helium Floating Balloon Bunches (Navy & Silver Chrome)',
        'Warm Glass Hurricane Floating Wax Candles',
        'Premium Fresh White Rose & Orchid vase floral',
        'Floor Sparkles, Custom Styling & Delivery logistics'
      ],
      images: [
        'http://localhost:5000/uploads/navy_silver_70th.jpg'
      ],
      averageRating: 4.9,
      numReviews: 22
    },
    {
      _id: 'decor_11',
      title: 'Luxury White & Gold Butterfly Ring Board',
      description: 'A premium circular event decoration package. Features a large round white board decorated with gold borders, gold calligraphy script "Indumathi Happy Birthday", a large metallic gold butterfly cutout, a massive white and gold balloon arch, cardboard cylindrical plinths, golden dessert birdcages, a small ferris wheel prop, suitcase trunks, and custom neon sideboards.',
      category: 'cat_2',
      theme: 'White & Gold Butterfly',
      price: 24500,
      includedItems: [
        'Large Circular Custom White & Gold Backdrop Board',
        'White and Gold Chrome Organic Balloon Arch',
        'Brushed Cardboard Pedestal cake columns',
        'Golden Butterfly Cutout Accent Prop',
        'Golden Birdcage stands & Ferris Wheel table props',
        'Decorative Antique suitcase trunks props',
        'On-site Layout Styling, Delivery & Teardown'
      ],
      images: [
        'http://localhost:5000/uploads/white_gold_butterfly.jpg',
        'http://localhost:5000/uploads/sky_blue_floral_arch.jpg',
        'http://localhost:5000/uploads/blue_white_floral_canopy.jpg',
        'http://localhost:5000/uploads/yellow_white_curtain.jpg',
        'http://localhost:5000/uploads/purple_hanging_fairy_lights.jpg'
      ],
      averageRating: 4.8,
      numReviews: 16
    },
    {
      _id: 'decor_12',
      title: 'Vibrant Purple Chrome Balloon Ring Setup',
      description: 'Celebrate in color with this massive circular ring setup. Features a curtain backdrop with fairy lights, a full circular framing wrapped in metallic purple, pink, and gold chrome balloons, a glowing neon sign, white dessert plinths, and lighted alphabet marquee letter signs.',
      category: 'cat_2',
      theme: 'Vibrant Purple & Pink',
      price: 18500,
      includedItems: [
        'Circular Ring frame board structures',
        'Metallic Balloon arch (Purple, Pink, Gold Chrome)',
        'Warm Fairy Lights Curtain Drapery Background',
        'White Pedestal Dessert cake column Stands',
        'Dimmable Neon "Happy Birthday" Signboard',
        'On-site custom setup, delivery & logistical assembly'
      ],
      images: [
        'http://localhost:5000/uploads/purple_chrome_ring.jpg'
      ],
      averageRating: 4.9,
      numReviews: 28
    },
    {
      _id: 'decor_13',
      title: 'Royal Golden Castle Fantasy Backdrop',
      description: 'A fairy tale castle-themed golden birthday stage setup. Includes white drapery, warm string lights, custom gold castle silhouettes, organic balloon arches in white and gold, cylindrical gold pedestals, and dessert tier stands.',
      category: 'cat_2',
      theme: 'Gold Castle',
      price: 22000,
      includedItems: [
        'White Drapery Curtain Panel backdrop walls',
        'Gold Castle silhouette props & lights panels',
        'White & Metallic Gold Chrome Balloon Arch garland',
        'Cylindrical Gold Pedestal stands for cake/sweets',
        'Tiered Golden Birdcage stands & tray displays',
        'Full setup assembly, alignment styling & teardown'
      ],
      images: [
        'http://localhost:5000/uploads/gold_castle_birthday.jpg'
      ],
      averageRating: 4.9,
      numReviews: 20
    },
    {
      _id: 'decor_14',
      title: 'Pastel Clouds & Teddy Baby Shower Canopy',
      description: 'A dreamlike pastel baby shower canopy decoration. Features hanging 3D clouds, glowing stars, a large glowing crescent moon prop, a life-sized teddy bear prop, and a gorgeous organic pastel blue, white, and silver balloon garland.',
      category: 'cat_3',
      theme: 'Teddy Cloud Moon',
      price: 19500,
      includedItems: [
        'Organic Pastel Blue, White, Silver Balloon Garland',
        'Hanging 3D Cloud props & hanging star lights',
        'Large Glowing LED Crescent Moon display standee',
        'Life-sized Soft Plush Teddy Bear prop',
        'White Cylindrical Pedestal Cake Stands',
        'Logistics, Custom Styling Layout & Assembly Teardown'
      ],
      images: [
        'http://localhost:5000/uploads/cloud_bear_babyshower.jpg'
      ],
      averageRating: 4.9,
      numReviews: 31
    },
    {
      _id: 'decor_15',
      title: 'Gender Reveal Pink & Blue Canopy',
      description: 'A beautiful blue and pink canopy setup for baby showers and gender reveals. Features two comfortable lounge chairs, a blue and pink foil backdrop curtain, gold foil "BABY SHOWER" balloon letters, gold star balloons, baby boy and girl characters, and elegant balloon pillars.',
      category: 'cat_3',
      theme: 'Pink & Blue Reveal',
      price: 12000,
      includedItems: [
        'Blue & Pink Metallic Foil Fringe Curtain Backdrop',
        'Gold Foil "BABY SHOWER" Alphabet Balloons',
        'Foil Baby Boy & Baby Girl Balloon Standees',
        'Metallic Pink, Blue, & Gold Star Balloon Garlands',
        'Lounge Armchairs Setup for Parents-to-be',
        'Full setup assembly, prompt delivery & teardown'
      ],
      images: [
        'http://localhost:5000/uploads/baby_shower_pink_blue.jpg'
      ],
      averageRating: 4.8,
      numReviews: 14
    },
    {
      _id: 'decor_16',
      title: 'Pastel Rainbow Balloon Arch Setup',
      description: 'A cheerful and colorful pastel rainbow balloon arch backdrop. Features a multi-color organic balloon arch wrapping around a white wall backdrop with string fairy lights, a callout banner saying "Baby Shower", and metallic gold flower balloon props.',
      category: 'cat_3',
      theme: 'Rainbow Pastel Lights',
      price: 11000,
      includedItems: [
        'White Backdrop Panel with Warm Hanging LED Lights',
        'Organic Balloon Arch (Yellow, Blue, Violet, Mint, Pink)',
        'Custom "Baby Shower" Script Calligraphy Banner',
        'Metallic Gold Flower Accent Balloon Props',
        'Full set delivery, layout installation & teardown'
      ],
      images: [
        'http://localhost:5000/uploads/baby_shower_rainbow_lights.jpg'
      ],
      averageRating: 4.9,
      numReviews: 9
    },
    {
      _id: 'decor_17',
      title: 'Baby Shower Fairy Light Curtain',
      description: 'A premium dreamlike baby shower decoration. Features a high-gloss white curtain panel background adorned with bright warm fairy lights strings, organic blue-and-pink balloon cascades on both corners, and a large pink/blue callout baby shower banner.',
      category: 'cat_3',
      theme: 'Pink & Blue Fairy Curtain',
      price: 13500,
      includedItems: [
        'Premium Chiffon Backdrop Wall with Fairy Lights',
        'Hanging Custom Baby Shower Banner',
        'Pastel Pink & Baby Blue organic balloon cloud clusters',
        'Heavy-duty frames, alignments, delivery & logistics'
      ],
      images: [
        'http://localhost:5000/uploads/baby_shower_fairy_curtain.jpg'
      ],
      averageRating: 4.9,
      numReviews: 16
    },
    {
      _id: 'decor_18',
      title: 'Traditional Pink & White Cradle Stage',
      description: 'A luxurious floral cradle decoration package. Features a large crescent moon prop adorned with pink, white, and purple roses, a hanging basket cradle wrapped in orchids, a soft pink curtain panel background, and a rose-patterned floor sheet.',
      category: 'cat_9',
      theme: 'Pink Rose Cradle',
      price: 18000,
      includedItems: [
        'White and Pink Rose Flower Crescent Arch Board',
        'Suspended Hanging Flower Cradle Basket',
        'Pink Silk Curtain Backdrop Drapery Panels',
        'High-power Halogen Floor Spotlighting',
        'Rose-patterned Premium Stage Carpet Runner',
        'Delivery, professional alignment & setup teardown'
      ],
      images: [
        'http://localhost:5000/uploads/naming_ceremony_pink_floral.jpg'
      ],
      averageRating: 4.9,
      numReviews: 12
    },
    {
      _id: 'decor_19',
      title: 'Elegant White Floral Cradle Setup',
      description: 'A traditional and pristine white floral stage for name reveal ceremonies. Features a curtain backdrop, white gerbera daisies arch borders, a suspended circular flower-wrapped cradle basket, and wall-hanging circular flower wreaths.',
      category: 'cat_9',
      theme: 'White Gerbera Cradle',
      price: 15500,
      includedItems: [
        'Gerbera Daisy & Green Leaf stage framing borders',
        'Suspended Cradle wrapped with fresh red/white flowers',
        'White Satin backdrop curtain drapes panels',
        'Wall-hanging circular floral ring props',
        'Layout alignment, delivery, installation & teardown'
      ],
      images: [
        'http://localhost:5000/uploads/naming_ceremony_cradle_white.jpg'
      ],
      averageRating: 4.8,
      numReviews: 9
    },
    {
      _id: 'decor_20',
      title: 'Boho Hanging Cradle with Fairy Lights',
      description: 'A modern bohemian naming ceremony backdrop. Features white drapery with hanging warm LED fairy lights, a circular cane-wicker suspended swing cradle decorated with blue and white flowers, and flower corners on the stands.',
      category: 'cat_9',
      theme: 'Boho Wicker Cradle',
      price: 14000,
      includedItems: [
        'Cane-wicker suspended circular swing cradle',
        'White drapery curtains backdrop panels',
        'Warm hanging LED string fairy lights garland',
        'Blue & White daisy corner floral arrangements',
        'Red/orange carpet stage flooring runner',
        'Full setup assembly, prompt delivery & teardown'
      ],
      images: [
        'http://localhost:5000/uploads/naming_ceremony_wreath_lights.jpg'
      ],
      averageRating: 4.9,
      numReviews: 14
    },
    {
      _id: 'decor_21',
      title: 'Luxe Mint Green & White Rose Cradle',
      description: 'A premium, refreshing naming ceremony stage decoration. Features soft mint green chiffon drapes, a dense white rose flower wall header, suspended floral pom-poms, a flower-patterned basket cradle, and matching floor flower vases.',
      category: 'cat_9',
      theme: 'Mint & White Rose',
      price: 19500,
      includedItems: [
        'Mint Green & Cream chiffon stage drapery',
        'Dense White Rose Header horizontal panel wall',
        'Hanging flower sphere pom-poms props',
        'Stylized floral basket cradle with silk cushions',
        'Urn pedestal flower vases with white roses',
        'Delivery, premium styling alignment & teardown logistics'
      ],
      images: [
        'http://localhost:5000/uploads/naming_ceremony_mint_roses.jpg'
      ],
      averageRating: 4.9,
      numReviews: 20
    },
    {
      _id: 'decor_22',
      title: 'Heavenly Blue & Gold Cradle Drapery',
      description: 'A gorgeous celestial naming ceremony stage. Features sky blue and white chiffon curtains draped in a criss-cross pattern, warm fairy lights, a suspended floral cradle, and a gold metal square frame base.',
      category: 'cat_9',
      theme: 'Sky Blue & Gold Cradle',
      price: 16500,
      includedItems: [
        'Criss-cross Sky Blue & Ivory backdrop draperies',
        'Gold Metal Square Backdrop frame setup',
        'Warm string fairy lights curtain backgrounds',
        'Suspended flower cradle basket with blue hydrangeas',
        'Decorative gold cages with ivy creepers props',
        'Logistics, delivery, custom assembly & teardown'
      ],
      images: [
        'http://localhost:5000/uploads/naming_ceremony_sky_drapes.jpg'
      ],
      averageRating: 4.9,
      numReviews: 18
    }
  ],
  rentals: [
    {
      _id: 'rental_1_0',
      title: 'LED Marquee Number "0"',
      description: 'Brighten your milestone event with our warm white 4ft LED Marquee Number "0". Combine multiple marquee numbers in your cart to spell out specific ages or years.',
      category: 'cat_5',
      rentalPrice: 600,
      availableColors: ['Warm White', 'Cool White', 'Multicolor'],
      availableSizes: ['4ft', '3ft'],
      quantityAvailable: 5,
      availabilityStatus: 'available',
      images: [
        'http://localhost:5000/uploads/marquee_digit_0.jpg'
      ],
      averageRating: 4.9,
      numReviews: 8
    },
    {
      _id: 'rental_1_1',
      title: 'LED Marquee Number "1"',
      description: 'Brighten your milestone event with our warm white 4ft LED Marquee Number "1". Combine multiple marquee numbers in your cart to spell out specific ages or years.',
      category: 'cat_5',
      rentalPrice: 600,
      availableColors: ['Warm White', 'Cool White', 'Multicolor'],
      availableSizes: ['4ft', '3ft'],
      quantityAvailable: 5,
      availabilityStatus: 'available',
      images: [
        'http://localhost:5000/uploads/marquee_digit_1.jpg'
      ],
      averageRating: 4.9,
      numReviews: 12
    },
    {
      _id: 'rental_1_2',
      title: 'LED Marquee Number "2"',
      description: 'Brighten your milestone event with our warm white 4ft LED Marquee Number "2". Combine multiple marquee numbers in your cart to spell out specific ages or years.',
      category: 'cat_5',
      rentalPrice: 600,
      availableColors: ['Warm White', 'Cool White', 'Multicolor'],
      availableSizes: ['4ft', '3ft'],
      quantityAvailable: 5,
      availabilityStatus: 'available',
      images: [
        'http://localhost:5000/uploads/marquee_digit_2.jpg'
      ],
      averageRating: 4.8,
      numReviews: 7
    },
    {
      _id: 'rental_1_3',
      title: 'LED Marquee Number "3"',
      description: 'Brighten your milestone event with our warm white 4ft LED Marquee Number "3". Combine multiple marquee numbers in your cart to spell out specific ages or years.',
      category: 'cat_5',
      rentalPrice: 600,
      availableColors: ['Warm White', 'Cool White', 'Multicolor'],
      availableSizes: ['4ft', '3ft'],
      quantityAvailable: 5,
      availabilityStatus: 'available',
      images: [
        'http://localhost:5000/uploads/marquee_digit_3.jpg'
      ],
      averageRating: 4.9,
      numReviews: 9
    },
    {
      _id: 'rental_1_4',
      title: 'LED Marquee Number "4"',
      description: 'Brighten your milestone event with our warm white 4ft LED Marquee Number "4". Combine multiple marquee numbers in your cart to spell out specific ages or years.',
      category: 'cat_5',
      rentalPrice: 600,
      availableColors: ['Warm White', 'Cool White', 'Multicolor'],
      availableSizes: ['4ft', '3ft'],
      quantityAvailable: 5,
      availabilityStatus: 'available',
      images: [
        'http://localhost:5000/uploads/marquee_digit_4.jpg'
      ],
      averageRating: 4.7,
      numReviews: 6
    },
    {
      _id: 'rental_1_5',
      title: 'LED Marquee Number "5"',
      description: 'Brighten your milestone event with our warm white 4ft LED Marquee Number "5". Combine multiple marquee numbers in your cart to spell out specific ages or years.',
      category: 'cat_5',
      rentalPrice: 600,
      availableColors: ['Warm White', 'Cool White', 'Multicolor'],
      availableSizes: ['4ft', '3ft'],
      quantityAvailable: 5,
      availabilityStatus: 'available',
      images: [
        'http://localhost:5000/uploads/marquee_digit_5.jpg'
      ],
      averageRating: 4.9,
      numReviews: 15
    },
    {
      _id: 'rental_1_6',
      title: 'LED Marquee Number "6"',
      description: 'Brighten your milestone event with our warm white 4ft LED Marquee Number "6". Combine multiple marquee numbers in your cart to spell out specific ages or years.',
      category: 'cat_5',
      rentalPrice: 600,
      availableColors: ['Warm White', 'Cool White', 'Multicolor'],
      availableSizes: ['4ft', '3ft'],
      quantityAvailable: 5,
      availabilityStatus: 'available',
      images: [
        'http://localhost:5000/uploads/marquee_digit_6.jpg'
      ],
      averageRating: 4.9,
      numReviews: 8
    },
    {
      _id: 'rental_1_7',
      title: 'LED Marquee Number "7"',
      description: 'Brighten your milestone event with our warm white 4ft LED Marquee Number "7". Combine multiple marquee numbers in your cart to spell out specific ages or years.',
      category: 'cat_5',
      rentalPrice: 600,
      availableColors: ['Warm White', 'Cool White', 'Multicolor'],
      availableSizes: ['4ft', '3ft'],
      quantityAvailable: 5,
      availabilityStatus: 'available',
      images: [
        'http://localhost:5000/uploads/marquee_digit_7.jpg'
      ],
      averageRating: 4.8,
      numReviews: 9
    },
    {
      _id: 'rental_1_8',
      title: 'LED Marquee Number "8"',
      description: 'Brighten your milestone event with our warm white 4ft LED Marquee Number "8". Combine multiple marquee numbers in your cart to spell out specific ages or years.',
      category: 'cat_5',
      rentalPrice: 600,
      availableColors: ['Warm White', 'Cool White', 'Multicolor'],
      availableSizes: ['4ft', '3ft'],
      quantityAvailable: 5,
      availabilityStatus: 'available',
      images: [
        'http://localhost:5000/uploads/marquee_digit_8.jpg'
      ],
      averageRating: 4.9,
      numReviews: 11
    },
    {
      _id: 'rental_1_9',
      title: 'LED Marquee Number "9"',
      description: 'Brighten your milestone event with our warm white 4ft LED Marquee Number "9". Combine multiple marquee numbers in your cart to spell out specific ages or years.',
      category: 'cat_5',
      rentalPrice: 600,
      availableColors: ['Warm White', 'Cool White', 'Multicolor'],
      availableSizes: ['4ft', '3ft'],
      quantityAvailable: 5,
      availabilityStatus: 'available',
      images: [
        'http://localhost:5000/uploads/marquee_digit_9.jpg'
      ],
      averageRating: 4.9,
      numReviews: 10
    },
    {
      _id: 'rental_2',
      title: 'Neon "Happy Birthday" Sign Board',
      description: 'Add a contemporary glow to your birthday background setup. Our premium silicone-sleeved neon sign reading "Happy Birthday" comes with a clear acrylic backing, dimmable controls, and hanging chains. Safe to handle and consumes low power.',
      category: 'cat_5',
      rentalPrice: 900,
      availableColors: ['Pink', 'Warm White', 'Ice Blue', 'Golden Yellow'],
      availableSizes: ['Medium (3ft wide)', 'Large (4.5ft wide)'],
      quantityAvailable: 8,
      availabilityStatus: 'available',
      images: [
        'http://localhost:5000/uploads/neon_hb_warm.jpg',
        'http://localhost:5000/uploads/neon_hb_pink.jpg',
        'http://localhost:5000/uploads/curtain_neon_birthday.jpg',
        'http://localhost:5000/uploads/blue_purple_stage.jpg',
        'http://localhost:5000/uploads/purple_chrome_ring.jpg'
      ],
      averageRating: 4.7,
      numReviews: 19
    },
    {
      _id: 'rental_3',
      title: 'Circular Metal Ring Backdrop Frame',
      description: 'A structural favorite for balloon artists and floral designers. Our heavy-duty circular backdrop frame measures 8 feet in diameter, comes in a sleek metallic gold finish, and disassembles into 5 pieces for easy transport. Features dual support legs for maximum stability.',
      category: 'cat_6',
      rentalPrice: 2000,
      availableColors: ['Gold', 'White', 'Silver', 'Black'],
      availableSizes: ['8ft Diameter', '6ft Diameter'],
      quantityAvailable: 10,
      availabilityStatus: 'available',
      images: [
        'http://localhost:5000/uploads/white_gold_butterfly.jpg',
        'http://localhost:5000/uploads/purple_chrome_ring.jpg',
        'http://localhost:5000/uploads/curtain_neon_birthday.jpg',
        'http://localhost:5000/uploads/blue_purple_stage.jpg',
        'http://localhost:5000/uploads/gold_castle_birthday.jpg',
        'http://localhost:5000/uploads/sky_blue_floral_arch.jpg',
        'http://localhost:5000/uploads/blue_white_floral_canopy.jpg',
        'http://localhost:5000/uploads/yellow_white_curtain.jpg',
        'http://localhost:5000/uploads/purple_hanging_fairy_lights.jpg'
      ],
      averageRating: 4.6,
      numReviews: 11
    },
    {
      _id: 'rental_4',
      title: 'Cylindrical Pedestals Set (Acrylic)',
      description: 'Set of three premium cylindrical plinths of varying heights. These elegant stands are excellent for holding cakes, dessert arrays, flower vases, or centerpiece sculptures. Made of durable, high-gloss acrylic that is easy to wipe clean.',
      category: 'cat_7',
      rentalPrice: 2500,
      availableColors: ['White Glossy', 'Gold Chrome', 'Clear Transparent', 'Matte Black'],
      availableSizes: ['Standard Set (3 Pieces)'],
      quantityAvailable: 6,
      availabilityStatus: 'available',
      images: [
        'http://localhost:5000/uploads/white_gold_butterfly.jpg',
        'http://localhost:5000/uploads/purple_chrome_ring.jpg',
        'http://localhost:5000/uploads/gold_castle_birthday.jpg',
        'http://localhost:5000/uploads/cloud_bear_babyshower.jpg',
        'http://localhost:5000/uploads/blue_purple_stage.jpg'
      ],
      averageRating: 4.8,
      numReviews: 15
    },
    {
      _id: 'rental_6',
      title: 'Plush Baby Teddy Bear Prop',
      description: 'An adorable addition to baby showers and children’s birthday parties. Standing 4.5 feet tall, this ultra-soft, premium-quality stuffed teddy bear is posed sitting down and serves as the perfect photo companion for guests.',
      category: 'cat_8',
      rentalPrice: 700,
      availableColors: ['Classic Brown', 'Fluffy White', 'Pastel Pink', 'Pastel Blue'],
      availableSizes: ['4.5ft Height'],
      quantityAvailable: 12,
      availabilityStatus: 'available',
      images: [
        'https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&w=600&q=80'
      ],
      averageRating: 4.5,
      numReviews: 14
    }
  ],
  bookings: [],
  payments: [],
  reviews: [],
  carts: {} // key user_id -> items array
};

// Initialize password hashes in mockDB
const initMockDB = async () => {
  const salt = await bcrypt.genSalt(10);
  mockDb.users[0].password = await bcrypt.hash('adminpassword123', salt);
  mockDb.users[1].password = await bcrypt.hash('password123', salt);
};

initMockDB();
