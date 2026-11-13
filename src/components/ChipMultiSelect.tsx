interface ChipMultiSelectProps {
  id: string;
  options: readonly string[];
  exclusiveOption: string;
  otherOption: string;
  selected: string[];
  otherText: string;
  onChangeSelected: (nextSelected: string[]) => void;
  onChangeOtherText: (text: string) => void;
}

export function ChipMultiSelect({
  id,
  options,
  exclusiveOption,
  otherOption,
  selected,
  otherText,
  onChangeSelected,
  onChangeOtherText,
}: ChipMultiSelectProps) {
  const handleToggle = (option: string) => {
    const isCurrentlySelected = selected.includes(option);

    if (option === exclusiveOption) {
      if (isCurrentlySelected) {
        onChangeSelected([]);
      } else {
        onChangeSelected([exclusiveOption]);
        onChangeOtherText('');
      }
      return;
    }

    const withoutExclusive = selected.filter(
      (item) => item !== exclusiveOption
    );

    if (isCurrentlySelected) {
      const next = withoutExclusive.filter((item) => item !== option);
      onChangeSelected(next);
      if (option === otherOption) {
        onChangeOtherText('');
      }
    } else {
      onChangeSelected([...withoutExclusive, option]);
    }
  };

  const isOtherChecked = selected.includes(otherOption);

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {options.map((option, idx) => {
          const isChecked = selected.includes(option);
          const inputId = `${id}-chip-${idx}`;
          return (
            <label
              key={option}
              htmlFor={inputId}
              className="relative cursor-pointer select-none"
            >
              <input
                id={inputId}
                type="checkbox"
                checked={isChecked}
                onChange={() => handleToggle(option)}
                className="sr-only peer"
              />
              <span
                className={`inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-full border text-sm font-medium transition-colors duration-150 peer-focus-visible:ring-4 peer-focus-visible:ring-[#86A5FF] peer-focus-visible:outline-none ${
                  isChecked
                    ? 'bg-[#3665F3] border-[#3665F3] text-white'
                    : 'bg-white border-[#C7C7C7] text-[#191919] hover:border-[#3665F3] hover:text-[#3665F3]'
                }`}
              >
                {isChecked && (
                  <svg
                    className="w-4 h-4 shrink-0"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span>{option}</span>
              </span>
            </label>
          );
        })}
      </div>

      {isOtherChecked && (
        <div className="mt-4">
          <label
            htmlFor={`${id}-other-input`}
            className="block text-sm font-medium text-[#191919] mb-1.5"
          >
            Please specify
          </label>
          <input
            id={`${id}-other-input`}
            type="text"
            value={otherText}
            onChange={(e) => onChangeOtherText(e.target.value)}
            maxLength={120}
            placeholder="Enter platform name"
            className="w-full sm:max-w-sm min-h-[44px] px-3.5 py-2.5 bg-white border border-[#C7C7C7] rounded-[12px] text-base text-[#191919] placeholder:text-[#707070] focus:outline-none focus:border-[#3665F3] focus:ring-4 focus:ring-[#86A5FF]"
          />
        </div>
      )}
    </div>
  );
}
