/**
 * AddressCard — reusable card for displaying a saved address.
 *
 * Props:
 *   address       – address object from backend
 *   selected      – boolean: is this the currently selected address?
 *   onSelect      – () => void  (optional; omit to hide radio)
 *   onEdit        – () => void  (optional)
 *   onDelete      – () => void  (optional)
 *   onSetDefault  – () => void  (optional)
 *   deleting      – boolean: show spinner on delete btn
 */

const AddressCard = ({
  address,
  selected = false,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
  deleting = false,
}) => {
  const hasActions = onEdit || onDelete || onSetDefault;

  return (
    <div
      onClick={onSelect}
      className={`relative rounded-2xl border-2 transition-all duration-200 p-4 ${
        onSelect ? "cursor-pointer" : ""
      } ${
        selected
          ? "border-brand-500 bg-brand-50 shadow-md shadow-brand-100"
          : "border-earth-200 bg-white hover:border-brand-300 hover:shadow-sm"
      }`}
    >
      {/* Radio indicator */}
      {onSelect && (
        <div className="absolute top-4 right-4">
          <div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
              selected ? "border-brand-500 bg-brand-500" : "border-earth-300"
            }`}
          >
            {selected && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
        </div>
      )}

      {/* Label + Default badge */}
      <div className="flex items-center gap-2 mb-2 pr-8">
        <span className="text-base font-bold text-earth-900 font-body">
          {address.label || "Saved"}
        </span>
        {address.isDefault && (
          <span className="badge bg-brand-100 text-brand-800 text-xs">
            Default
          </span>
        )}
      </div>

      {/* Address details */}
      <p className="font-body text-sm font-semibold text-earth-800">
        {address.fullName}
      </p>
      <p className="font-body text-sm text-earth-500 mt-0.5">
        {address.addressLine1}
        {address.addressLine2 ? `, ${address.addressLine2}` : ""}
      </p>
      <p className="font-body text-sm text-earth-500">
        {address.city}, {address.state} — {address.pincode}
      </p>
      <p className="font-body text-xs text-earth-400 mt-1">{address.phone}</p>

      {/* Action buttons */}
      {hasActions && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-earth-100">
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
              >
                Edit
              </button>
            )}

            {onSetDefault && !address.isDefault && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSetDefault();
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-earth-100 text-earth-700 hover:bg-earth-200 transition"
              >
                Set Default
              </button>
            )}
          </div>

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={deleting}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-spice-50 text-spice-600 hover:bg-spice-100 transition disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressCard;
