import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const showGlobalLoader = () => {
  if (document.getElementById('global-loader')) return;
  const loader = document.createElement('div');
  loader.id = 'global-loader';
  loader.innerHTML = '<div class="spinner"></div>';
  document.body.appendChild(loader);
};

export const hideGlobalLoader = () => {
  const loader = document.getElementById('global-loader');
  if (loader) {
    document.body.removeChild(loader);
  }
};
