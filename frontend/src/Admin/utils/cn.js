import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

//class condittionnelle
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
