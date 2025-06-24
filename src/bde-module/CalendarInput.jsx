import React, { forwardRef } from 'react';

const CalendarInput = forwardRef(
  ({ label, error, register, name, required = false }, extRef) => {
    // Get RHF’s register props & its internal ref
    const { ref: rhfRef, ...field } = register(name);

    // Attach BOTH refs to the <input>
    const setRefs = el => {
      rhfRef(el); // ✅ keep react-hook-form control
      if (extRef) extRef.current = el; // ✅ allow parent to call showPicker()
    };

    return (
      <div className="w-full relative">
        {/* Label */}
        <label className="block text-[20px] font-medium text-[#00007F]">
          {label} {required && <span className="text-[#EC5F70]">*</span>}
        </label>

        {/* Input + icon */}
        <div className="relative">
          <input
            {...field}
            ref={setRefs}
            type="datetime-local"
            className={`w-full mt-3 p-4 pr-12 text-[16px] rounded-[4px]
                        border ${error ? 'border-[#EC5F70]' : 'border-[#00007F]'}`}
            aria-describedby={`${name}-error`}
          />

          {/* Calendar icon */}
          <button
            type="button"
            onClick={() => extRef?.current?.showPicker?.()}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#00007F] focus:outline-none"
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </button>
        </div>

        {/* Error */}
        {error && (
          <p id={`${name}-error`} className="text-[#EC5F70] text-sm mt-2">
            {error.message || error}
          </p>
        )}
      </div>
    );
  }
);

export default CalendarInput;
