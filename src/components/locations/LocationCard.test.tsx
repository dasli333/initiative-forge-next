import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocationCard } from './LocationCard';
import type { Location } from '@/types/locations';

const mockLocation: Location = {
  id: '1',
  campaign_id: 'campaign-1',
  name: 'Waterdeep',
  location_type: 'miasto',
  description_json: null,
  parent_location_id: null,
  image_url: null,
  coordinates_json: null,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('LocationCard', () => {
  it('should render location name', () => {
    render(<LocationCard location={mockLocation} childrenCount={0} onClick={vi.fn()} />);
    expect(screen.getByText('Waterdeep')).toBeInTheDocument();
  });

  it('should render location type badge', () => {
    render(<LocationCard location={mockLocation} childrenCount={0} onClick={vi.fn()} />);
    expect(screen.getByText('City')).toBeInTheDocument();
  });

  it('should render children count when > 0', () => {
    render(<LocationCard location={mockLocation} childrenCount={3} onClick={vi.fn()} />);
    expect(screen.getByText('3 locations')).toBeInTheDocument();
  });

  it('should render singular "location" when count is 1', () => {
    render(<LocationCard location={mockLocation} childrenCount={1} onClick={vi.fn()} />);
    expect(screen.getByText('1 location')).toBeInTheDocument();
  });

  it('should not render children count when 0', () => {
    render(<LocationCard location={mockLocation} childrenCount={0} onClick={vi.fn()} />);
    expect(screen.queryByText(/locations?$/)).not.toBeInTheDocument();
  });

  it('should call onClick with location id when clicked', () => {
    const onClick = vi.fn();
    render(<LocationCard location={mockLocation} childrenCount={0} onClick={onClick} />);

    fireEvent.click(screen.getByText('Waterdeep'));
    expect(onClick).toHaveBeenCalledWith('1');
  });

  it('should render image when image_url is provided', () => {
    const locationWithImage = {
      ...mockLocation,
      image_url: 'https://example.com/image.jpg',
    };

    render(<LocationCard location={locationWithImage} childrenCount={0} onClick={vi.fn()} />);
    const img = screen.getByAltText('Waterdeep');
    expect(img).toBeInTheDocument();
    // Next.js Image component generates optimized URLs
    expect(img.getAttribute('src')).toContain(encodeURIComponent('https://example.com/image.jpg'));
  });
});
