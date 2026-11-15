/**
 * Where Trupal has been. Only what Trupal has told us: nothing is made up.
 * Country names match world-atlas; region names match us-atlas (US) and Natural Earth admin-1 (India, Canada, Australia),
 * served from public/geo.
 */

export type Country = {
    /** Name as in world-atlas. */
    name: string;
    label: string;
    /** [longitude, latitude] the globe turns to. */
    center: [number, number];
    /** States or provinces visited, when the country is split that finely on the globe. */
    regions?: { noun: string; total: number; visited: string[] };
    /** Cities visited, when Trupal has named them. */
    cities?: string[];
};

export const COUNTRIES: Country[] = [
    {
        name: 'India',
        label: 'India',
        center: [80, 23],
        regions: {
            noun: 'states & territories',
            total: 36,
            visited: [
                'Gujarat', 'Madhya Pradesh', 'Rajasthan', 'Delhi', 'Maharashtra', 'Kerala', 'Andaman and Nicobar', 'Assam',
                'Uttar Pradesh', 'Bihar', 'Uttarakhand', 'Jammu and Kashmir', 'Karnataka', 'Himachal Pradesh', 'Punjab', 'Haryana',
            ],
        },
    },
    {
        name: 'United States of America',
        label: 'United States',
        center: [-88, 37],
        regions: {
            noun: 'states',
            total: 50,
            visited: [
                'California', 'Nevada', 'Georgia', 'Florida', 'Alabama', 'South Carolina', 'North Carolina', 'Tennessee', 'Virginia',
                'West Virginia', 'Maryland', 'New York', 'New Jersey', 'Pennsylvania', 'Ohio', 'Indiana', 'Illinois', 'Michigan',
                'Massachusetts', 'District of Columbia',
            ],
        },
    },
    {
        name: 'Canada',
        label: 'Canada',
        center: [-82, 47],
        regions: { noun: 'provinces & territories', total: 13, visited: ['Ontario'] },
    },
    { name: 'Nepal', label: 'Nepal', center: [84, 28] },
    {
        name: 'Australia',
        label: 'Australia',
        center: [145, -30],
        regions: {
            noun: 'states & territories',
            total: 8,
            visited: ['Victoria', 'New South Wales', 'South Australia', 'Queensland', 'Australian Capital Territory'],
        },
        cities: ['Melbourne', 'Sydney', 'Adelaide', 'Brisbane', 'Canberra', 'Gold Coast'],
    },
];

/** Washington, D.C. is on the list but is not a state, so it is left out of the "x of 50" count. */
export const NOT_A_STATE = ['District of Columbia'];

export const US = COUNTRIES.find((c) => c.name === 'United States of America')!;
export const US_STATES_VISITED = US.regions!.visited.filter((s) => !NOT_A_STATE.includes(s));

/** Home bases the flight arcs start from. [longitude, latitude]. */
export const HOMES: { name: string; coords: [number, number] }[] = [
    { name: 'Ahmedabad', coords: [72.57, 23.02] },
    { name: 'Georgia', coords: [-83.64, 32.68] },
];

/**
 * Named places Trupal has mentioned: cities, treks and parks. [longitude, latitude].
 * State-level visits without a named place use the region on the map instead.
 */
export const PLACES: { name: string; country: string; coords: [number, number]; note?: string }[] = [
    { name: 'Ahmedabad', country: 'India', coords: [72.57, 23.02], note: 'Hometown' },
    { name: 'Rishikesh', country: 'India', coords: [78.27, 30.09], note: 'River rafting · Mar 2024' },
    { name: 'Kedarkantha', country: 'India', coords: [78.18, 31.02], note: 'Backpacking trek' },
    { name: 'Bhrigu Lake', country: 'India', coords: [77.23, 32.29], note: 'Backpacking trek' },
    { name: 'Delhi', country: 'India', coords: [77.21, 28.61] },
    { name: 'Georgia', country: 'United States', coords: [-83.64, 32.68], note: 'Home now' },
    { name: 'Orlando', country: 'United States', coords: [-81.38, 28.54], note: 'Universal Orlando' },
    { name: 'Hershey', country: 'United States', coords: [-76.65, 40.29], note: 'Hersheypark' },
    { name: 'Washington, D.C.', country: 'United States', coords: [-77.04, 38.91] },
    { name: 'Chicago', country: 'United States', coords: [-87.63, 41.88] },
    { name: 'Toronto', country: 'Canada', coords: [-79.38, 43.65], note: "Canada's Wonderland" },
    { name: 'Ottawa', country: 'Canada', coords: [-75.7, 45.42], note: 'White-water rafting · Jul 2025' },
    { name: 'Sydney', country: 'Australia', coords: [151.21, -33.87] },
    { name: 'Melbourne', country: 'Australia', coords: [144.96, -37.81] },
    { name: 'Brisbane', country: 'Australia', coords: [153.03, -27.47] },
    { name: 'Gold Coast', country: 'Australia', coords: [153.4, -28.02], note: 'Dreamworld' },
    { name: 'Adelaide', country: 'Australia', coords: [138.6, -34.93] },
    { name: 'Canberra', country: 'Australia', coords: [149.13, -35.28] },
];
