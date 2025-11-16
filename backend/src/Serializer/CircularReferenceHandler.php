<?php

// src/Serializer/CircularReferenceHandler.php
namespace App\Serializer;

class CircularReferenceHandler
{
    public function __invoke($object)
    {
        // Retourne l'ID ou autre propriété unique
        if (method_exists($object, 'getId')) {
            return $object->getId();
        }
        return null;
    }
}