import { User } from "lucide-react";
import * as React from "react"; 

export function InputValidate({
    value,
    onChange,
    IconComponent = User,
    type = "text",
    disabled,
    placeholder = "par defaut",
    title = "nom",
    largeur = "full",
    ClassIcone = "",
    saufTitre,
    margY = "mb-4",
    className = "text-black dark:text-white",
    error = false,
    helperText = "",
    onInputs,
    optionel
}) {
    const borderClasses = error
        ? "border-red-500 ring-1 ring-red-500"
        : disabled
          ? "border-slate-300 dark:border-slate-800"
          : "border-slate-500 dark:border-slate-600 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500";

    return (
        <fieldset className={`fieldset w-${largeur} gap-y-0 ${margY}`}>
            <legend
                className={`fieldset-legend ${error ? "text-red-500" : disabled && !saufTitre ? "text-slate-400 dark:text-slate-600" : "text-gray-800 dark:text-slate-300"} `}
                disabled={disabled}
            >
                {title} {!optionel && ( <span className="text-red-500">*</span>)}
            </legend>
            <label className={`validator input flex border ${borderClasses} mt-0 w-full overflow-hidden rounded-lg bg-transparent`}>
                <IconComponent className={`h-[1em] opacity-100  ${error ? "text-red-500" : ClassIcone}`} />
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    type={type}
                    onInput={onInputs}
                    disabled={disabled}
                    placeholder={placeholder}
                    title={title}
                    className={`validator w-full bg-transparent outline-none ${className} ${error ? "" : ""}`}
                />
            </label>
            {helperText && <p className={`mt-1 text-sm ${error ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}>{helperText}</p>}
        </fieldset>
    );
}
