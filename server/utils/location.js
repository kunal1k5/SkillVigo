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
