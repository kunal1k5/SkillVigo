export function buildLocationLabel({ city = '', state = '', country = '' } = {}) {
  return [city, state, country]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(', ');
}

export function normalizeLocationFields(payload = {}) {
  const country = String(payload.country || '').trim();
  const state = String(payload.state || '').trim();
  const city = String(payload.city || '').trim();
  const fullAddress = String(payload.fullAddress || '').trim();

  return {
    country,
    state,
    city,
    fullAddress,
    location: buildLocationLabel({ city, state, country }),
  };
}

export function hasCompleteLocationFields(locationFields = {}) {
  return Boolean(
    locationFields.country &&
      locationFields.state &&
      locationFields.city &&
      locationFields.fullAddress,
  );
}

function parseCoordinate(value) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

function resolveCoordinateCandidate(payload = {}) {
  const locationCoordinates =
    payload && typeof payload.locationCoordinates === 'object' && payload.locationCoordinates !== null
      ? payload.locationCoordinates
      : {};

  return {
    latitude:
      locationCoordinates.latitude ??
      locationCoordinates.lat ??
      payload.latitude ??
      payload.lat,
    longitude:
      locationCoordinates.longitude ??
      locationCoordinates.lng ??
      locationCoordinates.lon ??
      payload.longitude ??
      payload.lng ??
      payload.lon,
  };
}

export function normalizeLocationCoordinates(payload = {}) {
  const coordinateCandidate = resolveCoordinateCandidate(payload);
  const latitude = parseCoordinate(coordinateCandidate.latitude);
  const longitude = parseCoordinate(coordinateCandidate.longitude);

  if (latitude === null || longitude === null) {
    return null;
  }

  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }

  return {
    latitude: Number(latitude.toFixed(6)),
    longitude: Number(longitude.toFixed(6)),
  };
}

export function hasLocationCoordinates(payload = {}) {
  return Boolean(normalizeLocationCoordinates(payload));
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

export function getDistanceBetweenCoordinates(firstCoordinates, secondCoordinates) {
  const first = normalizeLocationCoordinates({ locationCoordinates: firstCoordinates });
  const second = normalizeLocationCoordinates({ locationCoordinates: secondCoordinates });

  if (!first || !second) {
    return null;
  }

  const earthRadiusKm = 6371;
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitudeRadians = toRadians(first.latitude);
  const secondLatitudeRadians = toRadians(second.latitude);
  const haversineValue =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitudeRadians) * Math.cos(secondLatitudeRadians) * Math.sin(longitudeDelta / 2) ** 2;
  const angularDistance = 2 * Math.atan2(Math.sqrt(haversineValue), Math.sqrt(1 - haversineValue));

  return earthRadiusKm * angularDistance;
}
