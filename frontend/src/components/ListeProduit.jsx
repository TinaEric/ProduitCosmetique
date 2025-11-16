import React from 'react';

const ListeProduit = ({product, onBuy}) => {
    return (
        <div key={product.NUM_PRODUIT}  className="group" onClick={()=> onBuy(product.NUM_PRODUIT)}>
            <img
                  alt={product.nomProduit}
                  src={product.imgUrlProduit}
                  className="aspect-square w-full rounded-lg bg-gray-200 object-cover group-hover:opacity-75 xl:aspect-7/8"
                />
            <h3 className="mt-4 text-sm ">{product.nomProduit}</h3>
            <p className="mt-1 text-lg font-medium">{product.prixProduit}</p>
        </div>
    );
};

export default ListeProduit;