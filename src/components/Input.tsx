interface InputProps {
    name: string,
    placeholder: string
    className?: string
    type?: string
    value?: string | number
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    required?: boolean
    disabled?: boolean
}

const Input: React.FC<InputProps> = ({ name, placeholder, className, type, value, onChange, disabled}) => {
    return (
        <div className="space-y-4">
            <div>
                <label
                htmlFor="hs-validation-name-error"
                className="block text-sm font-medium text-gray-700 mb-2"
                >
                {name}
                </label>
                <div className="relative">
                <input
                    type={type || "text"}
                    id="hs-validation-name-error"
                    name="hs-validation-name-error"
                    className={`py-3 px-4 block w-full border border-gray-400 rounded-lg text-sm focus:outline-none ${className || ""}`}
                    placeholder={placeholder}
                    value={value || ""}
                    aria-describedby="hs-validation-name-error-helper"
                    onChange={onChange || undefined}
                    disabled={disabled || false}
                />
                </div>
            </div>
        </div>
    )
}

export default Input