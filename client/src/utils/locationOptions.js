export const LOCATION_OPTIONS = {
  India: {
    Delhi: ['New Delhi'],
    Karnataka: ['Bengaluru', 'Mysuru', 'Mangaluru'],
    Maharashtra: ['Mumbai', 'Nagpur', 'Nashik', 'Pune', 'Thane'],
    Rajasthan: ['Jaipur', 'Jodhpur', 'Udaipur'],
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai'],
    'Uttar Pradesh': ['Agra', 'Ghaziabad', 'Lucknow', 'Mathura', 'Noida'],
    'West Bengal': ['Durgapur', 'Kolkata', 'Siliguri'],
  },
  Canada: {
    Alberta: ['Calgary', 'Edmonton'],
    Ontario: ['Mississauga', 'Ottawa', 'Toronto'],
  },
  'United Arab Emirates': {
    Dubai: ['Dubai'],
    Sharjah: ['Sharjah'],
  },
  'United Kingdom': {
    England: ['Birmingham', 'London', 'Manchester'],
    Scotland: ['Edinburgh', 'Glasgow'],
  },
  'United States': {
    California: ['Los Angeles', 'San Francisco', 'San Jose'],
    'New York': ['Buffalo', 'New York City'],
    Texas: ['Austin', 'Dallas', 'Houston'],
  },
};

export function getCountryOptions() {
  return Object.keys(LOCATION_OPTIONS);
}

export function getStateOptions(country = '') {
  return Object.keys(LOCATION_OPTIONS[country] || {});
}

export function getCityOptions(country = '', state = '') {
  return LOCATION_OPTIONS[country]?.[state] || [];
}

export function withCurrentValue(options = [], currentValue = '') {
  if (!currentValue || options.includes(currentValue)) {
    return options;
  }

  return [currentValue, ...options];
}

export function buildLocationLabel({ country = '', state = '', city = '' } = {}) {
  return [city, state, country].filter(Boolean).join(', ');
}

export async function reverseGeocodeCoordinates({ latitude, longitude }) {
  const params = new URLSearchParams({
    format: 'jsonv2',
    addressdetails: '1',
    lat: String(latitude),
    lon: String(longitude),
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
    {
      headers: {
        'Accept-Language': 'en',
      },
    },
  );

  if (!response.ok) {
    throw new Error('Could not fetch your current address.');
  }

  const data = await response.json();
  const address = data.address || {};
  const country = address.country || '';
  const state = address.state || address.state_district || '';
  const city =
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    '';
  const fullAddress =
    data.display_name ||
    [
      address.road,
      address.suburb,
      city,
      state,
      address.postcode,
      country,
    ]
      .filter(Boolean)
      .join(', ');

  if (!country && !state && !city) {
    throw new Error('Could not convert your current position into a usable address.');
  }

  return {
    country,
    state,
    city,
    fullAddress,
    location: buildLocationLabel({ country, state, city }),
  };
}
