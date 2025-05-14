import React from 'react'
import { Link } from 'react-router-dom'

interface Individual {
  id: number
  name: string
  role: string
  description: string
  image: string
}
interface IndividualCardProps {
  individual: Individual
}
export const IndividualCard: React.FC<IndividualCardProps> = ({
  individual,
}) => {
  const truncateDescription = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="w-64 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white shadow-xl overflow-hidden transform-gpu hover:scale-105 transition-transform duration-300">
      <div className="h-32 w-full overflow-hidden">
      
        <img
          src={individual.image}
          alt={individual.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center mb-2">
        <Link to={`/individual/${individual.id}`}>  <h3 className="text-lg font-bold text-gray-900">{individual.name}</h3></Link>
        </div>
        <p className="text-sm text-indigo-600 font-medium mb-1">
          {individual.role}
        </p>
        <p className="text-sm text-gray-600">
          {truncateDescription(individual.description, 100)}
        </p>
       =
      </div>
      
    </div>
    
  );
};
