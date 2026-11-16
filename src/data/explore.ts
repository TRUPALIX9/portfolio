/**
 * Where Trupal still wants to go, from Trupal's own Google Maps lists ("Travel plans", "Goa", "Want to go").
 * Travel places only: restaurants, cafés, hotels and home addresses from those lists are left out.
 * Coordinates are [latitude, longitude] as saved in Google Maps.
 */

export type ExploreKind = 'hike' | 'water' | 'forest' | 'desert' | 'coast' | 'city' | 'country' | 'landmark' | 'adventure' | 'fun';

export type ExploreSpot = {
    name: string;
    /** Town, park or state, for the line under the name. */
    where: string;
    country: string;
    kind: ExploreKind;
    at: [number, number];
};

/** Kinds of place, in the order the filter lists them. Icons live in components/travel/KindIcon. */
export const KINDS: Record<ExploreKind, { label: string; color: string }> = {
    hike: { label: 'Hikes & peaks', color: '#2a9d8f' },
    water: { label: 'Lakes & waterfalls', color: '#118ab2' },
    forest: { label: 'Parks & forests', color: '#5a9e3a' },
    desert: { label: 'Deserts & canyons', color: '#e07a2f' },
    coast: { label: 'Beaches & islands', color: '#00a6d6' },
    city: { label: 'Cities & towns', color: '#8338ec' },
    country: { label: 'Whole countries', color: '#3a56d4' },
    landmark: { label: 'Landmarks & history', color: '#c9971a' },
    adventure: { label: 'Adventure', color: '#ef233c' },
    fun: { label: 'Fun & experiences', color: '#ff4d8d' },
};

export const CONTINENTS = ['Asia', 'North America', 'Europe', 'Africa', 'Oceania', 'South America'] as const;
export type Continent = (typeof CONTINENTS)[number];

/** Flag code and continent for every country on the list. */
const COUNTRY: Record<string, [string, Continent]> = {
    'United States': ['US', 'North America'], Mexico: ['MX', 'North America'], 'Saint Lucia': ['LC', 'North America'],
    Brazil: ['BR', 'South America'], Bolivia: ['BO', 'South America'],
    India: ['IN', 'Asia'], Vietnam: ['VN', 'Asia'], Kazakhstan: ['KZ', 'Asia'], Malaysia: ['MY', 'Asia'], China: ['CN', 'Asia'],
    Philippines: ['PH', 'Asia'], Indonesia: ['ID', 'Asia'], Azerbaijan: ['AZ', 'Asia'], Jordan: ['JO', 'Asia'], 'Saudi Arabia': ['SA', 'Asia'], Yemen: ['YE', 'Asia'],
    Switzerland: ['CH', 'Europe'], Greece: ['GR', 'Europe'], Italy: ['IT', 'Europe'], Romania: ['RO', 'Europe'], Norway: ['NO', 'Europe'], Portugal: ['PT', 'Europe'],
    Tunisia: ['TN', 'Africa'], Nigeria: ['NG', 'Africa'], Kenya: ['KE', 'Africa'], Tanzania: ['TZ', 'Africa'], Egypt: ['EG', 'Africa'], Seychelles: ['SC', 'Africa'],
    Australia: ['AU', 'Oceania'],
};

export const continentOf = (country: string): Continent => COUNTRY[country]?.[1] ?? 'Asia';

/** Flag emoji from the two-letter country code. */
export const flagOf = (country: string) => {
    const code = COUNTRY[country]?.[0];
    return code ? String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)) : '📍';
};

const us = (name: string, where: string, kind: ExploreKind, at: [number, number]): ExploreSpot => ({ name, where, country: 'United States', kind, at });
const ind = (name: string, where: string, kind: ExploreKind, at: [number, number]): ExploreSpot => ({ name, where, country: 'India', kind, at });

export const EXPLORE: ExploreSpot[] = [
    // California: Yosemite
    us('Half Dome', 'Yosemite, California', 'hike', [37.7459, -119.5332]),
    us('Taft Point', 'Yosemite, California', 'hike', [37.713, -119.6046]),
    us('Glacier Point', 'Yosemite, California', 'forest', [37.7282, -119.5735]),
    us('Tunnel View', 'Yosemite, California', 'forest', [37.7158, -119.6775]),
    us('Yosemite Falls', 'Yosemite, California', 'water', [37.7566, -119.5969]),
    // California: Sequoia & Kings Canyon
    us('General Sherman Tree', 'Sequoia National Park, California', 'forest', [36.5817, -118.7514]),
    us('The President Tree', 'Sequoia National Park, California', 'forest', [36.5733, -118.7501]),
    us('McKinley Tree', 'Sequoia National Park, California', 'forest', [36.5735, -118.7536]),
    us('Tunnel Log', 'Sequoia National Park, California', 'forest', [36.5526, -118.7614]),
    us('Moro Rock Trail', 'Sequoia National Park, California', 'hike', [36.5468, -118.7657]),
    us('Boole Tree Loop Trail', 'Kings Canyon, California', 'hike', [36.8222, -118.9607]),
    us('Panoramic Point', 'Kings Canyon, California', 'forest', [36.7544, -118.9442]),
    us('Buck Rock Lookout', 'Sequoia National Forest, California', 'hike', [36.7374, -118.859]),
    us('Blue Ridge Vista Point', 'Sierra National Forest, California', 'forest', [36.7337, -119.0209]),
    // California: Eastern Sierra
    us('June Lake Loop', 'June Lake, California', 'water', [37.7829, -119.0731]),
    us('Silver Lake', 'June Lake, California', 'water', [37.7763, -119.1253]),
    // California: Santa Monica Mountains & Conejo Valley
    us('Sandstone Peak', 'Santa Monica Mountains, California', 'hike', [34.1204, -118.932]),
    us('Split Rock & Chamberlin Trail', 'Santa Monica Mountains, California', 'hike', [34.1096, -118.9712]),
    us('Serrano Valley', 'Point Mugu State Park, California', 'hike', [34.0997, -118.9799]),
    us('Mugu Peak via Chumash Trail', 'Point Mugu State Park, California', 'hike', [34.0927, -119.055]),
    us('Simi Peak', 'Simi Valley, California', 'hike', [34.189, -118.7844]),
    us('Paradise Falls', 'Wildwood Park, Thousand Oaks', 'hike', [34.2144, -118.9106]),
    us('Teepee Overlook', 'Wildwood Park, Thousand Oaks', 'hike', [34.2143, -118.9095]),
    us('Camarillo Grove Park', 'Camarillo, California', 'hike', [34.2029, -118.9721]),
    us('Santa Paula Punch Bowls', 'Santa Paula, California', 'water', [34.4491, -119.0566]),
    // California: coast
    us('Stearns Wharf', 'Santa Barbara, California', 'landmark', [34.41, -119.686]),
    us('Shoreline Park', 'Santa Barbara, California', 'coast', [34.3964, -119.7068]),
    us('One Thousand Steps', 'Santa Barbara, California', 'coast', [34.3956, -119.7134]),
    us('Santa Barbara Zoo', 'Santa Barbara, California', 'fun', [34.4204, -119.6671]),
    us('Oceano Dunes', 'Oceano, California', 'adventure', [35.1055, -120.6309]),
    us('Point Reyes National Seashore', 'Marin County, California', 'coast', [38.0539, -122.8876]),
    us('Mount Tamalpais', 'Mill Valley, California', 'hike', [37.9291, -122.5777]),
    us('Glass Beach', 'Fort Bragg, California', 'coast', [39.4526, -123.8135]),
    // Southwest
    us('Monument Valley', 'Utah & Arizona', 'desert', [36.9814, -110.1124]),
    us('Forrest Gump Point', 'Mexican Hat, Utah', 'landmark', [37.1033, -109.9881]),
    us('Outpost X', 'Beryl, Utah', 'desert', [37.8571, -113.6052]),
    us('Kanab', 'Utah', 'city', [37.0424, -112.5122]),
    us('Cave Peak', 'Wasatch Range, Utah', 'hike', [40.8499, -111.8349]),
    us("Devil's Bridge", 'Sedona, Arizona', 'hike', [34.8976, -111.8077]),
    us('Dobbins Lookout', 'South Mountain, Phoenix', 'hike', [33.3455, -112.0586]),
    // Las Vegas
    us('Fremont Street Experience', 'Las Vegas, Nevada', 'fun', [36.1707, -115.1438]),
    us('SlotZilla Zipline', 'Las Vegas, Nevada', 'adventure', [36.1695, -115.1413]),
    us('Stadium Swim', 'Las Vegas, Nevada', 'fun', [36.1723, -115.1456]),
    us('Downtown Container Park', 'Las Vegas, Nevada', 'fun', [36.1676, -115.1385]),
    us('Sphere', 'Las Vegas, Nevada', 'fun', [36.1212, -115.162]),
    us('Bellagio Conservatory', 'Las Vegas, Nevada', 'landmark', [36.112, -115.1766]),
    us('Welcome to Fabulous Las Vegas sign', 'Las Vegas, Nevada', 'landmark', [36.0821, -115.1728]),
    // Pacific Northwest, Alaska, Maine
    us('The Enchantments', 'Leavenworth, Washington', 'hike', [47.4785, -120.8192]),
    us('Inspiration Lake', 'Leavenworth, Washington', 'hike', [47.4824, -120.801]),
    us('Sahale Arm', 'North Cascades, Washington', 'hike', [48.4779, -121.0558]),
    us('Icy Strait Zipline', 'Hoonah, Alaska', 'adventure', [58.1308, -135.4657]),
    us('Beehive Trail', 'Acadia, Maine', 'hike', [44.3316, -68.1853]),

    // India
    ind('Parashar Lake', 'Mandi, Himachal Pradesh', 'hike', [31.7544, 77.1011]),
    ind('Shangarh', 'Kullu, Himachal Pradesh', 'forest', [31.7443, 77.3956]),
    ind('Naggar', 'Manali, Himachal Pradesh', 'city', [32.1036, 77.1619]),
    ind('Skydiving', 'Narnaul, Haryana', 'adventure', [28.0758, 76.2012]),
    ind('Rambagh Palace', 'Jaipur, Rajasthan', 'landmark', [26.8981, 75.8081]),
    ind('Grand Canyon of India', 'Kota, Rajasthan', 'desert', [25.1181, 75.728]),
    ind('Purohito Ka Talab', 'Udaipur, Rajasthan', 'water', [24.6688, 73.7493]),
    ind('Wari Chora', 'Baghmara, Meghalaya', 'water', [25.3342, 90.5682]),
    ind('Vasai Fort', 'Vasai, Maharashtra', 'landmark', [19.3306, 72.8156]),
    ind('Sky hammock at Shelu', 'Karjat, Maharashtra', 'adventure', [19.0546, 73.3292]),
    ind('Gokarna', 'Karnataka', 'coast', [14.5479, 74.3188]),
    ind('Alleppey backwaters', 'Alappuzha, Kerala', 'water', [9.4905, 76.3468]),
    ind('Surfing in Varkala', 'Varkala, Kerala', 'adventure', [8.7448, 76.6985]),
    // Goa
    ind('Arambol Beach', 'North Goa', 'coast', [15.6871, 73.7029]),
    ind('Sweet Lake', 'Arambol, Goa', 'water', [15.6979, 73.6982]),
    ind('Chapora Fort', 'Anjuna, Goa', 'landmark', [15.6046, 73.737]),
    ind('Anjuna Beach', 'North Goa', 'coast', [15.5733, 73.741]),
    ind('Parra coconut tree road', 'Parra, Goa', 'landmark', [15.5778, 73.782]),
    ind('Sinquerim Fort viewpoint', 'Candolim, Goa', 'landmark', [15.4976, 73.7649]),
    ind('Basilica of Bom Jesus', 'Old Goa', 'landmark', [15.5008, 73.9114]),
    ind('Our Lady of the Immaculate Conception', 'Panaji, Goa', 'landmark', [15.4986, 73.8296]),
    ind('Jalavne Falls', 'Surla, Goa', 'water', [15.6486, 74.1939]),
    ind('Butterfly Beach', 'Canacona, Goa', 'coast', [15.0196, 74.0016]),
    ind('Kayaking in Canacona', 'South Goa', 'adventure', [15.0691, 73.9709]),

    // Asia & the Pacific
    { name: 'Bali', where: 'Indonesia', country: 'Indonesia', kind: 'coast', at: [-8.4095, 115.1889] },
    { name: 'Gili Trawangan', where: 'Lombok, Indonesia', country: 'Indonesia', kind: 'coast', at: [-8.3568, 116.0309] },
    { name: 'Labuan Bajo', where: 'Flores, Indonesia', country: 'Indonesia', kind: 'coast', at: [-8.4925, 119.8773] },
    { name: 'Tumpak Sewu Waterfall', where: 'East Java, Indonesia', country: 'Indonesia', kind: 'water', at: [-8.2315, 112.9176] },
    { name: 'Philippines', where: 'The whole country', country: 'Philippines', kind: 'country', at: [12.8797, 121.774] },
    { name: 'Coron island hopping', where: 'Palawan, Philippines', country: 'Philippines', kind: 'coast', at: [11.9943, 120.2115] },
    { name: 'Kawasan Canyoneering', where: 'Cebu, Philippines', country: 'Philippines', kind: 'adventure', at: [9.8145, 123.3704] },
    { name: 'Phu Quoc', where: 'Vietnam', country: 'Vietnam', kind: 'coast', at: [10.2229, 103.9626] },
    { name: 'Langkawi', where: 'Kedah, Malaysia', country: 'Malaysia', kind: 'coast', at: [6.35, 99.8] },
    { name: 'Chuiyun Tongtian River', where: 'Zhejiang, China', country: 'China', kind: 'water', at: [29.9243, 119.5317] },
    { name: 'Almaty', where: 'Kazakhstan', country: 'Kazakhstan', kind: 'city', at: [43.238, 76.8829] },
    { name: 'Baku', where: 'Azerbaijan', country: 'Azerbaijan', kind: 'city', at: [40.4093, 49.8671] },
    { name: 'Gantheaume Point', where: 'Broome, Western Australia', country: 'Australia', kind: 'coast', at: [-17.9739, 122.1775] },
    { name: 'Lucky Bay', where: 'Esperance, Western Australia', country: 'Australia', kind: 'coast', at: [-33.9932, 122.2356] },
    { name: 'Puffing Billy Railway', where: 'Dandenong Ranges, Victoria', country: 'Australia', kind: 'fun', at: [-37.9077, 145.3566] },

    // Europe
    { name: 'Switzerland', where: 'The whole country', country: 'Switzerland', kind: 'country', at: [46.8182, 8.2275] },
    { name: 'Bernese Alps', where: 'Switzerland', country: 'Switzerland', kind: 'hike', at: [46.4167, 7.75] },
    { name: 'Lake Como', where: 'Lombardy, Italy', country: 'Italy', kind: 'water', at: [46.016, 9.2572] },
    { name: 'Taormina', where: 'Sicily, Italy', country: 'Italy', kind: 'city', at: [37.8545, 15.2889] },
    { name: 'Palmarola', where: 'Pontine Islands, Italy', country: 'Italy', kind: 'coast', at: [40.9358, 12.8587] },
    { name: 'Milos', where: 'Cyclades, Greece', country: 'Greece', kind: 'coast', at: [37.8289, 24.0316] },
    { name: 'Santorini', where: 'Cyclades, Greece', country: 'Greece', kind: 'coast', at: [36.4183, 25.4323] },
    { name: 'Ios', where: 'Cyclades, Greece', country: 'Greece', kind: 'coast', at: [36.6844, 25.3795] },
    { name: 'Lysevegen', where: 'Lysebotn, Norway', country: 'Norway', kind: 'adventure', at: [59.0483, 6.655] },
    { name: 'Therme București', where: 'near Bucharest, Romania', country: 'Romania', kind: 'fun', at: [44.6051, 26.0854] },
    { name: 'Azores', where: 'Portugal', country: 'Portugal', kind: 'coast', at: [37.7412, -25.6756] },

    // Middle East & Africa
    { name: 'Wadi Rum', where: 'Jordan', country: 'Jordan', kind: 'desert', at: [29.5468, 35.4344] },
    { name: 'Aqaba', where: 'Red Sea, Jordan', country: 'Jordan', kind: 'coast', at: [29.413, 34.9787] },
    { name: 'AlUla', where: 'Saudi Arabia', country: 'Saudi Arabia', kind: 'desert', at: [26.762, 37.8589] },
    { name: 'Marassi', where: 'North Coast, Egypt', country: 'Egypt', kind: 'coast', at: [30.9752, 28.7529] },
    { name: 'Socotra', where: 'Yemen', country: 'Yemen', kind: 'desert', at: [12.4634, 53.8237] },
    { name: 'Tunisia', where: 'The whole country', country: 'Tunisia', kind: 'country', at: [33.8869, 9.5375] },
    { name: 'Lagos', where: 'Nigeria', country: 'Nigeria', kind: 'city', at: [6.6137, 3.3553] },
    { name: 'Abuja', where: 'Nigeria', country: 'Nigeria', kind: 'city', at: [9.0563, 7.4985] },
    { name: 'Mombasa', where: 'Kenya', country: 'Kenya', kind: 'city', at: [-4.0435, 39.6682] },
    { name: 'Zanzibar', where: 'Unguja, Tanzania', country: 'Tanzania', kind: 'coast', at: [-6.1357, 39.3621] },
    { name: 'Seychelles', where: 'The whole country', country: 'Seychelles', kind: 'country', at: [-4.6796, 55.492] },

    // The Americas
    { name: 'Wejulia Beach', where: 'Cabo San Lucas, Mexico', country: 'Mexico', kind: 'coast', at: [22.8747, -109.9077] },
    { name: 'Saint Lucia', where: 'The whole country', country: 'Saint Lucia', kind: 'country', at: [13.9094, -60.9789] },
    { name: 'Fernando de Noronha', where: 'Pernambuco, Brazil', country: 'Brazil', kind: 'coast', at: [-3.8448, -32.4269] },
    { name: 'Uyuni Salt Flat', where: 'Bolivia', country: 'Bolivia', kind: 'desert', at: [-20.1338, -67.4891] },
];

/** A Google Maps link for a spot, by name and coordinates. */
export const mapsLink = (s: ExploreSpot) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.name} ${s.at[0]},${s.at[1]}`)}`;
