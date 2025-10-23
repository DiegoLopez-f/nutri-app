import React from 'react';
import Link from 'next/link';

interface ButtonRoleProps {
    href: string;
    label: string;
    color?: 'primary' | 'secondary';
}

export default function ButtonRole({ href, label, color = 'primary' }: ButtonRoleProps) {
    const baseStyles =
        'w-full py-4 px-6 text-white font-bold text-lg rounded-xl transition duration-300 shadow-lg transform hover:scale-[1.02]';
    const colorStyles =
        color === 'primary'
            ? 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/50'
            : 'bg-teal-600 hover:bg-teal-700 hover:shadow-teal-500/50';

    return (
        <Link href={href} className="flex-1">
            <button className={`${baseStyles} ${colorStyles}`}>{label}</button>
        </Link>
    );
}