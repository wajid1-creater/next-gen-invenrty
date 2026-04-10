export default function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 animate-fade-in">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-gray-100 rounded-full" />
        <div className="w-12 h-12 border-4 border-transparent border-t-green-500 rounded-full animate-spin absolute inset-0" />
      </div>
      <p className="text-sm text-gray-400 mt-4 font-medium">{text}</p>
    </div>
  );
}
