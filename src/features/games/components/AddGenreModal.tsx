interface AddGenreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: () => void;
  newGenreName: string;
  setNewGenreName: (name: string) => void;
  isAdding: boolean;
  error: string | null;
}

export const AddGenreModal = ({
  isOpen,
  onClose,
  onAdd,
  newGenreName,
  setNewGenreName,
  isAdding,
  error,
}: AddGenreModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-sm w-full p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Add New Genre</h2>

        {error && (
          <div className="mb-4 text-sm text-red-400 bg-red-900/30 p-2 rounded">
            {error}
          </div>
        )}

        <input
          type="text"
          value={newGenreName}
          onChange={(e) => setNewGenreName(e.target.value)}
          placeholder="e.g. RPG"
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all mb-6"
          autoFocus
        />

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={onAdd}
            disabled={isAdding || !newGenreName.trim()}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
            {isAdding ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};
