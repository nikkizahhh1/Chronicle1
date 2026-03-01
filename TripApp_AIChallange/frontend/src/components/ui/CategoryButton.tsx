interface CategoryButtonProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function CategoryButton({
  label,
  selected,
  onClick,
  disabled = false,
}: CategoryButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-4 rounded-2xl font-medium transition-all duration-200 border-2 ${
        selected
          ? 'bg-primary-green text-white border-primary-green'
          : 'bg-white text-primary-green border-primary-green/20 hover:border-primary-green/50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {label}
    </button>
  );
}
