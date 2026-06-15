interface Props {
  message?: string;
}

export default function LoadingSpinner({ message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      {message && <p className="text-sm text-slate-500">{message}</p>}
    </div>
  );
}

export function PageError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <p className="text-red-500 text-sm">{message}</p>
      {onRetry && <button onClick={onRetry} className="btn-secondary">Retry</button>}
    </div>
  );
}
