
import React from 'react';

export const KortexLogo: React.FC<{ className?: string; isCollapsed?: boolean }> = ({ className, isCollapsed }) => (
    <div className={`flex items-center gap-2 ${className}`}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_kortex_logo)">
                <rect width="24" height="24" rx="5" fill="url(#logo_bg_gradient)"/>
                <rect x="4" y="6" width="4.5" height="12" rx="2" fill="white" fillOpacity="0.8"/>
                <rect x="9.75" y="6" width="4.5" height="12" rx="2" fill="white" fillOpacity="0.6"/>
                <rect x="15.5" y="6" width="4.5" height="12" rx="2" fill="white" fillOpacity="0.4"/>
            </g>
            <defs>
                <linearGradient id="logo_bg_gradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3B82F6"/>
                    <stop offset="1" stopColor="#2563EB"/>
                </linearGradient>
                <clipPath id="clip0_kortex_logo">
                    <rect width="24" height="24" rx="5" fill="white"/>
                </clipPath>
            </defs>
        </svg>
        {!isCollapsed && <h1 className="text-2xl font-bold text-text-default">Kortex</h1>}
    </div>
);
