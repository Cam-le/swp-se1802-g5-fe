import React, { useState, useRef } from "react";

function VehicleSelectRich({ id, name, label, value, onChange, options = [], error, placeholder = "Select vehicle", disabled = false, required = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    // Handle focus/blur for custom dropdown
    const handleFocus = () => setIsOpen(true);
    const handleBlur = (e) => {
        // Only close if focus leaves the wrapper
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsOpen(false);
        }
    };

    const selectedOption = options.find(o => o.value === value);

    return (
        <div tabIndex={-1} onBlur={handleBlur} className="relative">
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">
                    {label}
                    {required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}
            <button
                type="button"
                ref={selectRef}
                className={`w-full px-4 py-3 bg-slate-700 border ${error ? "border-red-500" : "border-slate-600"} rounded-lg text-white text-left placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:opacity-50 disabled:cursor-not-allowed appearance-none flex items-center justify-between`}
                onClick={() => setIsOpen((open) => !open)}
                onFocus={handleFocus}
                disabled={disabled}
                tabIndex={0}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                id={id}
                name={name}
            >
                {selectedOption ? (
                    <span className="flex items-center gap-2">
                        {selectedOption.imageUrl && (
                            <img src={selectedOption.imageUrl} alt={selectedOption.label} className="w-8 h-6 object-cover rounded bg-slate-700" />
                        )}
                        {selectedOption.label}
                    </span>
                ) : (
                    <span className="text-slate-400">{placeholder}</span>
                )}
                <svg className="w-4 h-4 ml-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {isOpen && (
                <ul className="absolute left-0 right-0 mt-2 z-20 bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto" role="listbox">
                    {options.length === 0 && (
                        <li className="px-4 py-3 text-slate-400">No vehicles available</li>
                    )}
                    {options.map((option) => (
                        <li
                            key={option.value}
                            role="option"
                            aria-selected={option.value === value}
                            tabIndex={0}
                            className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-700 ${option.value === value ? "bg-slate-700" : ""}`}
                            onClick={() => {
                                onChange({ target: { name, value: option.value } });
                                setIsOpen(false);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    onChange({ target: { name, value: option.value } });
                                    setIsOpen(false);
                                }
                            }}
                        >
                            {option.imageUrl && (
                                <img src={option.imageUrl} alt={option.label} className="w-12 h-10 object-cover rounded bg-slate-700" />
                            )}
                            <div>
                                <div className="font-semibold text-white">{option.label}</div>
                                {option.stock !== undefined && (
                                    <div className="text-xs text-slate-400">Stock: <span className="text-white font-bold">{option.stock}</span></div>
                                )}
                                {option.status && (
                                    <div className="text-xs text-slate-400">Status: <span className="text-white font-bold">{option.status}</span></div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
        </div>
    );
}

export default VehicleSelectRich;
