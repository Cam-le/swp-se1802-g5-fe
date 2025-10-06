function Card({ children, className = "", padding = true, hover = false }) {
  const hoverClass = hover
    ? "hover:shadow-xl transition-shadow duration-200"
    : "";
  const paddingClass = padding ? "p-6" : "";

  return (
    <div
      className={`bg-slate-800 rounded-lg border border-slate-700 shadow-lg ${paddingClass} ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
}

// Card Header sub-component
function CardHeader({ children, className = "" }) {
  return (
    <div className={`border-b border-slate-700 pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}

// Card Title sub-component
function CardTitle({ children, className = "" }) {
  return (
    <h3 className={`text-xl font-semibold text-white ${className}`}>
      {children}
    </h3>
  );
}

// Card Content sub-component
function CardContent({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

// Card Footer sub-component
function CardFooter({ children, className = "" }) {
  return (
    <div className={`border-t border-slate-700 pt-4 mt-4 ${className}`}>
      {children}
    </div>
  );
}

// Attach sub-components to Card
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
