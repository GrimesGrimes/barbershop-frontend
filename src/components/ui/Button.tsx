import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    variant?: 'primary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({
    children,
    isLoading = false,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled,
    ...props
}) => {
    let sizeStyles = '';
    switch (size) {
        case 'sm':
            sizeStyles = 'px-3 py-1.5 text-xs';
            break;
        case 'md':
            sizeStyles = 'px-4 py-2 text-sm';
            break;
        case 'lg':
            sizeStyles = 'px-6 py-3 text-base';
            break;
    }

    const baseStyles = 'flex justify-center items-center border rounded-lg shadow-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors';

    let variantStyles = '';
    switch (variant) {
        case 'primary':
            variantStyles = 'border-transparent text-white bg-amber-600 hover:bg-amber-700 focus:ring-amber-500';
            break;
        case 'outline':
            variantStyles = 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-amber-500';
            break;
        case 'danger':
            variantStyles = 'border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500';
            break;
    }

    return (
        <button
            className={`${baseStyles} ${sizeStyles} ${variantStyles} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : null}
            {children}
        </button>
    );
};

export default Button;
