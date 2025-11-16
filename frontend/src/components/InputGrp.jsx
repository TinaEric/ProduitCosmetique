import { User } from "lucide-react";

export function InputText({value,onChange, 
    IconComponent = User,
    type="text",
    disabled, 
    placeholder = "par defaut", 
    title = "nom", 
    limite = "Champs n'est autorisé!" ,
    largeur = "full",
    ClassIcone = "",
    saufTitre,
    margY = "mb-4",
    className ="  text-black dark:text-white" }) {
    return (
        <fieldset className={`fieldset w-${largeur} gap-y-0 ${margY}`}>
            <legend className={`fieldset-legend  ${(disabled && !saufTitre) ? "text-slate-400 dark:text-slate-600" : "dark:text-slate-300 text-gray-800"} `} disabled={disabled}>{title}</legend>
            <label className={`validator input flex border  ${disabled ? "border-slate-300 dark:border-slate-800" : "border-slate-500 dark:border-slate-600"} mt-0  w-full  bg-transparent`}>
                <IconComponent className={`h-[1em] opacity-100 ${ClassIcone}`} />
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    type={type}
                    disabled={disabled}
                    required
                    placeholder={placeholder}
                    // minLength="0" text-slate-500 dark:text-slate-500
                    // maxLength="100"
                    title={title}
                    className={`w-full bg-transparent validator ${className} `}
                />
                <p className="validator-hint"></p>
            </label>
        </fieldset>
    );
}

