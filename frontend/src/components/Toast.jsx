import { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export const Toast = ({ type = "info", message, onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const bgColors = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    error: "bg-rose-50 border-rose-200 text-rose-900",
    info: "bg-indigo-50 border-indigo-200 text-indigo-900",
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-indigo-600 flex-shrink-0" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce-in">
      <div className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg ${bgColors[type] || bgColors.info}`}>
        {icons[type]}
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-black/5 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );
};
