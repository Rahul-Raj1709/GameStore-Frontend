import { X, Trash2, Loader2 } from "lucide-react";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface DeleteGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  gameName: string;
}

export const DeleteGameModal = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
  gameName,
}: DeleteGameModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (isOpen) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 },
      );
      gsap.fromTo(
        modalRef.current,
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.5)" },
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div
        ref={modalRef}
        className="bg-gray-900/90 border border-red-500/30 rounded-3xl max-w-sm w-full p-8 shadow-[0_0_40px_rgba(239,68,68,0.15)] backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20">
            <Trash2 className="w-7 h-7 text-red-500" />
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white bg-gray-800/50 hover:bg-gray-700 p-2 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Delete Game?</h2>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Are you sure you want to permanently delete{" "}
          <span className="text-white font-bold">"{gameName}"</span>? This
          action cannot be undone.
        </p>
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 bg-gray-800/50 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors border border-gray-700">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
            {isDeleting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
