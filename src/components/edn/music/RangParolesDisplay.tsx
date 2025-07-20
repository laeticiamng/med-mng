
import React from 'react';

interface RangParolesDisplayProps {
  rang: 'A' | 'B';
  paroles: string;
  textColor: string;
}

export const RangParolesDisplay: React.FC<RangParolesDisplayProps> = ({
  rang,
  paroles,
  textColor
}) => {
  return (
    <>
      <h4 className={`font-medium ${textColor} mb-2`}>Rang {rang} :</h4>
      <p className={`text-sm ${textColor} whitespace-pre-wrap mb-4`}>
        {paroles.substring(0, 200)}
        {paroles.length > 200 && '...'}
      </p>
    </>
  );
};
