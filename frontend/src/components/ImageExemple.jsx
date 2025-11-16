import {useRef, useState, useEffect} from 'react';
import { RiImageAddFill } from "react-icons/ri";

export function UploadImage ({
    img,
    label = "Changer L'image",
    onImageChange,
    addImageLabel = "Ajouter une image" 
}) {
    const getImagePath = (name) => {
            if (!name) return null;
            return `/image/${name}`;
          };
        const [image, setImage] = useState(img ? getImagePath(img) : null);
        const fileInputRef = useRef(null);
    
    useEffect(() => {
        if (img) {
          setImage(img.startsWith("blob:") || img.startsWith("http") ? img : `/image/${img}`);
        } else {
          setImage(null);
        }
    }, [img]);
    
    const changeImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const newUrl = URL.createObjectURL(file);
            setImage(newUrl);
            onImageChange(file);
        }
    }


    if (image) {
        return (
            <div className='relative group w-fit rounded-md border border-accent'>
                <img
                    src={image}
                    alt="Aperçu de l'image"
                    className="w-40 h-40 object-cover group-hover:opacity-80 transition-opacity duration-300 rounded"
                />
                <button 
                    type="button"
                    className='
                        absolute bottom-2 left-2 right-2 
                        opacity-100 group-hover:opacity-100 transition-opacity duration-300
                        btn btn-outline btn-accent text-black' 
                        onClick={() => fileInputRef.current.click()}
                >
                    {label}
                </button>

                <input
                    type="file"
                    accept='image/*'
                    ref={fileInputRef}
                    onChange={changeImage}
                    className='hidden'
                />
            </div>
        );
    }
    return (
      <div 
          className='relative w-40  h-[60px] flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-accent cursor-pointer transition-colors duration-200'
          onClick={() => fileInputRef.current.click()}
      >
          <RiImageAddFill  className="w-20 h-20 text-accent opacity-75 hover:scale-110 hover:transition-transform hover:duration-300 " />
          <input
              type="file"
              accept='image/*'
              ref={fileInputRef}
              onChange={changeImage}
              className='hidden'
          />
      </div>
  );
    
};
