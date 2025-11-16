import {useRef, useState,useEffect} from 'react';
import { RiImageAddFill } from "react-icons/ri";
export function UploadImage ({
    img,
    label = "Changer L'image",
    onImageChange
}) {
    
    const getImagePath = (name) => {
        if (!name) return null;
        return `/image/${name}`;
      };
    const [image, setImage] = useState(img ? getImagePath(img) : null);
    const fileInputRef = useRef(null);

    // useEffect(() => {
    //     if (img) {
    //         console.log(img)
    //         // setImage(`/image/${img}`)
    //        setImage(img.startsWith("blob:") || img.startsWith("http") ? img : `/image/${img}`);
    //     } else {
    //       setImage(null);
    //     }
    //   }, [img]);
    
      useEffect(() => {
        if (typeof img === 'string' && img) { 
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
        <div className='relative  group w-fit rounded-md border border-accent '>
            {image ? (
                <img
                src={image}
                alt="Aperçu"
                className="w-40 h-40 object-cover group-hover:opacity-80 transition-opacity duration-300 rounded"
                />
            ) : (
                <img
                src="/image/image.png"
                alt="Image par défaut"
                className="w-40 h-40 object-cover opacity-70 rounded"
                />
            )}
            <button 
                type="button"
                className='
                    absolute bottom-2 left-2 right-2 
                    opacity-100 group-hover:opacity-100 transition-transform duration-300
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
              className='relative w-60  h-[100px] flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-accent cursor-pointer transition-colors duration-200'
              onClick={() => fileInputRef.current.click()}
          >
                <RiImageAddFill  className="w-16 h-16 text-accent opacity-75 hover:scale-110 hover:transition-transform hover:duration-300 " />
                <span className="absolute bottom-1 text-accent">
                    Ajouter l'image du produit
                </span>
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


const ImageAddIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-image-up">
        <path d="M10.3 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9.5" />
        <path d="M16 10l-4.3 4.3a2 2 0 0 0-2.2 0L3 17" />
        <line x1="19" x2="19" y1="22" y2="16" />
        <line x1="16" x2="22" y1="19" y2="19" />
        <circle cx="10" cy="8" r="2" />
    </svg>
);



export function UploadImages ({
    img, 
    label = "Changer l'image",
    addImageLabel = "Ajouter l'image du produit",
    onImageChange
}) {
    
    const fileInputRef = React.useRef(null);

    // CRUCIAL: Déterminer l'URL d'affichage basée sur la prop (qui est soit une URL blob, soit un nom de fichier)
    const imageUrl = React.useMemo(() => {
        if (typeof img !== 'string' || !img) {
            return null;
        }
        if (img.startsWith("blob:") || img.startsWith("http")) {
            return img;
        }
        // Sinon, suppose que c'est un nom de fichier nécessitant un préfixe
        return `/image/${img}`;
    }, [img]);
    
    const changeImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            onImageChange(file); // Envoie le File object au parent
        }
        e.target.value = null; 
    }

    const accentColor = "text-indigo-600 border-indigo-600";

    if (imageUrl) {
        return (
            <div className='relative group w-64 h-48 rounded-lg overflow-hidden border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300'>
                <img
                    src={imageUrl}
                    alt="Aperçu de l'image"
                    className="w-full h-full object-cover group-hover:opacity-60 transition-opacity duration-300"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/256x192/f0f0f0/888888?text=Erreur+Image";
                    }}
                />
                <button 
                    type="button"
                    className={`
                        absolute inset-0 m-2 flex items-center justify-center
                        bg-white bg-opacity-90 text-sm font-semibold 
                        rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300
                         border-2 ${accentColor} text-black transform scale-90 group-hover:scale-100
                    `}
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
            className={`
                w-64 h-48 flex flex-col items-center justify-center gap-2 
                rounded-lg border-2 border-dashed ${accentColor} bg-white 
                cursor-pointer shadow-md hover:bg-indigo-50 hover:shadow-lg transition-all duration-200
            `}
            onClick={() => fileInputRef.current.click()}
        >
            <ImageAddIcon className={`w-12 h-12 ${accentColor} opacity-75`} />
            <span className={`text-base font-medium ${accentColor} mt-2`}>
                {addImageLabel}
            </span>
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