import { Loader2 } from 'lucide-react';

export const FullScreenLoader = () => (
  <div className="flex min-h-screen w-full items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-3 text-gray-600">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <span className="text-sm font-medium">Memuat aplikasi...</span>
    </div>
  </div>
);
