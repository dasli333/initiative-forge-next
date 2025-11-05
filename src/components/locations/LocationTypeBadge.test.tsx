import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LocationTypeBadge } from './LocationTypeBadge';

describe('LocationTypeBadge', () => {
  it('should render continent type', () => {
    render(<LocationTypeBadge type="kontynent" />);
    expect(screen.getByText('Continent')).toBeInTheDocument();
  });

  it('should render kingdom type', () => {
    render(<LocationTypeBadge type="królestwo" />);
    expect(screen.getByText('Kingdom')).toBeInTheDocument();
  });

  it('should render city type', () => {
    render(<LocationTypeBadge type="miasto" />);
    expect(screen.getByText('City')).toBeInTheDocument();
  });

  it('should render building type', () => {
    render(<LocationTypeBadge type="budynek" />);
    expect(screen.getByText('Building')).toBeInTheDocument();
  });

  it('should render dungeon type', () => {
    render(<LocationTypeBadge type="dungeon" />);
    expect(screen.getByText('Dungeon')).toBeInTheDocument();
  });

  it('should render other type for unknown values', () => {
    render(<LocationTypeBadge type="unknown" />);
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('should render inne type', () => {
    render(<LocationTypeBadge type="inne" />);
    expect(screen.getByText('Other')).toBeInTheDocument();
  });
});
