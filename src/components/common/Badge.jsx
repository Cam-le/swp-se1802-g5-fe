function Badge({ children, variant = "default", size = "md" }) {
  const variants = {
    default: "bg-gray-500",
    primary: "bg-blue-500",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
    info: "bg-cyan-500",
    orange: "bg-orange-500",
    // Allow custom colors to be passed directly
    custom: "",
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
    lg: "text-sm px-3 py-1.5",
  };

  // If variant starts with 'bg-', use it directly as a custom color
  const badgeColor = variant.startsWith("bg-")
    ? variant
    : variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${badgeColor} text-white ${sizes[size]}`}
    >
      {children}
    </span>
  );
}

export default Badge;
