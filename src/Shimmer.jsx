// src/components/Shimmer.jsx
import React from 'react';

export const Shimmer = ({ className = '' }) => (
  <div
    className={`
      ${className}
      bg-gradient-to-r
      from-gray-200 via-gray-300 to-gray-200
      bg-[length:200%_100%]
      animate-shimmer
      rounded
    `}
  />
);
