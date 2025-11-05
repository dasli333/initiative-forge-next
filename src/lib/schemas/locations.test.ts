import { describe, it, expect } from 'vitest';
import { locationFormSchema } from './locations';

describe('locationFormSchema', () => {
  it('should validate valid location data', () => {
    const validData = {
      name: 'Waterdeep',
      location_type: 'miasto',
      parent_location_id: null,
      description_json: null,
      image_url: null,
      coordinates_json: null,
    };

    const result = locationFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate location with coordinates', () => {
    const data = {
      name: 'Neverwinter',
      location_type: 'miasto',
      coordinates_json: {
        lat: 45.123456,
        lng: -75.654321,
      },
    };

    const result = locationFormSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const data = {
      name: '',
      location_type: 'miasto',
    };

    const result = locationFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject name > 255 characters', () => {
    const data = {
      name: 'a'.repeat(256),
      location_type: 'miasto',
    };

    const result = locationFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject invalid location type', () => {
    const data = {
      name: 'Test',
      location_type: 'invalid',
    };

    const result = locationFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject invalid coordinates', () => {
    const data = {
      name: 'Test',
      location_type: 'miasto',
      coordinates_json: {
        lat: 100, // Invalid: > 90
        lng: 0,
      },
    };

    const result = locationFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should reject invalid longitude', () => {
    const data = {
      name: 'Test',
      location_type: 'miasto',
      coordinates_json: {
        lat: 0,
        lng: 200, // Invalid: > 180
      },
    };

    const result = locationFormSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should trim whitespace from name', () => {
    const data = {
      name: '  Baldurs Gate  ',
      location_type: 'miasto',
    };

    const result = locationFormSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Baldurs Gate');
    }
  });
});
