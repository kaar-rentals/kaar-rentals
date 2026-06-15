import type { Car } from '@/services/api';

/** Normalize API/static car payloads so pages don't crash on missing fields */
export function normalizeCar(raw: Record<string, unknown>): Car {
  const ownerRaw = raw.ownerId ?? raw.owner;
  let owner = raw.owner as Car['owner'] | undefined;
  let ownerId = raw.ownerId as string | undefined;

  if (ownerRaw && typeof ownerRaw === 'object') {
    const o = ownerRaw as Record<string, unknown>;
    ownerId = String(o._id ?? o.id ?? ownerId ?? '');
    owner = {
      _id: ownerId,
      name: (o.name as string) || '',
      email: (o.email as string) || '',
      phone: o.phone as string | undefined,
      ...(o.location ? { location: o.location as string } : {}),
      ...(o.unique_id ? { unique_id: o.unique_id as string } : {}),
    } as Car['owner'];
  } else if (typeof ownerRaw === 'string') {
    ownerId = ownerRaw;
  }

  const isRented = Boolean(raw.isRented);
  const status =
    (raw.status as string) || (isRented ? 'rented' : 'available');

  return {
    ...(raw as unknown as Car),
    _id: String(raw._id ?? raw.id ?? ''),
    features: Array.isArray(raw.features) ? (raw.features as string[]) : [],
    images: Array.isArray(raw.images) ? (raw.images as string[]) : [],
    status: status as 'available' | 'rented',
    isRented,
    ownerId,
    owner: owner ?? (raw.owner as Car['owner']),
    pricePerDay: Number(raw.pricePerDay ?? raw.price ?? 0),
    price: Number(raw.price ?? raw.pricePerDay ?? 0),
    viewCount:
      raw.viewCount !== undefined && raw.viewCount !== null
        ? Number(raw.viewCount)
        : undefined,
  };
}

export function getCarOwnerId(car: {
  ownerId?: unknown;
  owner?: { _id?: string; id?: string };
}): string | null {
  const o = car.ownerId ?? car.owner;
  if (!o) return null;
  if (typeof o === 'string') return o;
  if (typeof o === 'object') {
    const obj = o as { _id?: string; id?: string };
    return obj._id || obj.id || null;
  }
  return null;
}
