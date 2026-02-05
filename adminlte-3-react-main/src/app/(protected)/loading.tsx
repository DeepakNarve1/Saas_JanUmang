import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full animate-in fade-in duration-500">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-[#00563B]/10 border-t-[#00563B] animate-spin"></div>
        <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-[#00563B]" />
      </div>
      <p className="mt-6 text-sm font-bold text-[#00563B] uppercase tracking-widest animate-pulse">
        Initializing Module...
      </p>
      <p className="mt-2 text-xs text-gray-400 font-medium italic">
        Preparing your workplace for optimum performance
      </p>
    </div>
  );
}
