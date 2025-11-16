import {Search} from "lucide-react";
import { useState } from "react";


const BarreMenu = () => {
    const [filtre, setFiltre] = useState("");
    return (
        <div className="flex w-full flex-row items-center justify-between divide-y divide-gray-700">
            <div className="input bg-[#FfFfFf] py-4 dark:bg-slate-950">
                <Search
                    size={20}
                    className="text-slate-300"
                />
                <input
                    type="text"
                    name="search"
                    id="search"
                    placeholder="Recherche..."
                    className="w-full bg-transparent text-slate-900 outline-0 placeholder:text-slate-300 dark:text-slate-50"
                />
            </div>
            <div className="flex w-1/2 items-center justify-center gap-3 text-slate-950 dark:text-gray-200">
                <label className="label">
                    <span className="label-text text-slate-950 dark:text-gray-200">Filtrer par :</span>
                </label>
                <select
                    className="select w-1/2 rounded-xl border border-slate-300 bg-[#FfFfFf] dark:border-slate-700 dark:bg-slate-950"
                    value={filtre}
                    onChange={(e) => setFiltre(e.target.value)}
                >
                    <option value={Filtres.TOUS}>{Filtres.TOUS}</option>
                    <option value={Filtres.DERNIER_A_JOUR}>{Filtres.DERNIER_A_JOUR}</option>
                    <option value={Filtres.ALPHABETIQUE}>{Filtres.ALPHABETIQUE}</option>
                    <option value={Filtres.CATEGORIE}>{Filtres.CATEGORIE}</option>
                </select>
            </div>
        </div>
    );
};

export default BarreMenu;
