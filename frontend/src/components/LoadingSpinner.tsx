import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-2">
      <Loader2 size={20} className="text-zinc-400 animate-spin" />
      {text && <p className="text-[13px] text-zinc-500">{text}</p>}
    </div>
  );
}
