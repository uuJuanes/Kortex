import React from 'react';

export const UsersGroupIcon: React.FC<React.SVGProps<SVGSVGElement> & { title?: string }> = ({ title, ...props }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        {title && <title>{title}</title>}
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962A3.375 3.375 0 0110.5 12h3c1.455 0 2.75-.832 3.375-2.037m-8.375 0V15a2.25 2.25 0 002.25 2.25h1.5a2.25 2.25 0 002.25-2.25V12m-4.5 0V9A2.25 2.25 0 019 6.75h1.5a2.25 2.25 0 012.25 2.25v3.375m-6.75 0c0-1.141-.353-2.24-.97-3.22m.97 3.22c.617 0 .97-.533.97-1.141v-5.416a2.25 2.25 0 00-2.25-2.25h-1.5a2.25 2.25 0 00-2.25 2.25v5.416c0 .608.353 1.141.97 1.141m0 0a3.375 3.375 0 01-3.375 2.037M4.125 4.5h5.25V18h-5.25V4.5z" />
    </svg>
);
