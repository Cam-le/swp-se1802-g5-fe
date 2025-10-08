// src/components/common/Button.jsx
function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  type = "button",
  fullWidth = false,
  isLoading = false,
}) {
  const baseClasses =
    "font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center";

  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-600",
    secondary: "bg-slate-600 hover:bg-slate-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled ? "cursor-not-allowed opacity-50" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variants[variant]} ${widthClass} ${disabledClass}`}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
