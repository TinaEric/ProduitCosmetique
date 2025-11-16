import React from 'react';
import { FaEdgeLegacy, FaEdit, FaUserEdit } from 'react-icons/fa';

const ProfilUser = ({ 
  onEdit,
  user, 
  size = "large",
  showStatus = true 
}) => {

  // Tailles configurables
  const sizeClasses = {
    small: {
      avatar: "w-12 h-12",
      text: "text-sm",
      status: "w-2 h-2 bottom-0 right-0"
    },
    medium: {
      avatar: "w-16 h-16",
      text: "text-base",
      status: "w-3 h-3 bottom-1 right-1"
    },
    large: {
      avatar: "w-20 h-20",
      text: "text-lg",
      status: "w-4 h-4 bottom-1 right-1"
    }
  };

  const defaultImage = "/image/image.png";

  const { avatar: avatarSize, text: textSize, status: statusSize } = sizeClasses[size];

  return (
    <div className="flex flex-col items-center gap-4 p-5 bg-transparent w-full hover:shadow-md transition-shadow duration-200">
      <div className="relative">
        <img 
          src={defaultImage} 
          alt={`${user.nom} ${user.prenom}`} 
          className={`${avatarSize} rounded-full object-cover border-2 border-white shadow-md`}
        />
        {showStatus && (
          <span 
            className={`absolute ${statusSize} rounded-full border-2 border-white bg-green-500
            }`}
          ></span>
        )}
      </div>
      
      <div className=" flex flex-col items-center text-center">
        <h2 className={`font-semibold text-gray-800 dark:text-white ${textSize}`}>
          {user.nom} {user.prenom}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{user.email}</p>
        <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{user.telephone}</p>
        <button className='btn btn-ghost btn-sm my-2 btn-accent px-4 items-center' onClick={() => onEdit()}>
          <FaEdit />
          <span className='text-sm font-gothic '>Modifier le Profil</span>
        </button>
      </div>
     
    </div>
  );
};

export default ProfilUser;