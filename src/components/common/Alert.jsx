// src/components/common/Alert.jsx
function Alert({ type = "error", message }) {
  if (!message) return null;

  const styles = {
    error: {
      container: "bg-red-500 bg-opacity-10 border border-red-500",
      text: "text-red-400",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
    success: {
      container: "bg-green-500 bg-opacity-10 border border-green-500",
      text: "text-green-400",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
    info: {
      container: "bg-blue-500 bg-opacity-10 border border-blue-500",
      text: "text-blue-400",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      ),
    },
  };

  const style = styles[type] || styles.error;

  return (
    <div className={`${style.container} rounded-lg p-3 flex items-center mb-4`}>
      <svg
        className={`w-5 h-5 ${style.text} mr-2`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        {style.icon}
      </svg>
      <span className={`${style.text} text-sm`}>{message}</span>
    </div>
  );
}

export default Alert;
