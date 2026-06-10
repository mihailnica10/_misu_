import { RofitUmbrella } from "@/rofit-footer/components/RofitUmbrella";

export function Footer() {
  return (
    <footer className="border-t border-gray-100 mt-auto">
      <div className="flex items-center justify-center px-6 py-4 text-xs text-gray-400">
        <RofitUmbrella className="font-mono text-xs text-gray-400 hover:text-gray-600 transition-colors" />
      </div>
    </footer>
  );
}
