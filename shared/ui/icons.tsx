import React from 'react';

interface IconProps {
    className?: string;
    size?: number; // Tailwind size unit, e.g., 4, 5, 6
}

const Icon: React.FC<IconProps & { children: React.ReactNode }> = ({ children, className, size = 5 }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`${className || ''} h-${size} w-${size}`}
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}>
        {children}
    </svg>
);

export const AddIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </Icon>
);

export const TrashIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </Icon>
);

export const DownloadIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </Icon>
);

export const GenerateIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </Icon>
);

export const ResetIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 20v-5h-5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 9a9 9 0 0114.12-4.97" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 15a9 9 0 01-14.12 4.97" />
    </Icon>
);


export const ChevronDownIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </Icon>
);

export const SettingsIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </Icon>
);

export const CloseIcon: React.FC<IconProps> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </Icon>
);

export const SparklesIcon: React.FC<IconProps> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${props.className || ''} h-${props.size || 5} w-${props.size || 5}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
);

export const WandIcon: React.FC<IconProps> = (props) => (
    <Icon {...props} >
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.72 8.79l-1.54.9-1.54-.9a2.25 2.25 0 00-2.3.08l-1.08.62a2.25 2.25 0 00-1.15 2v.16a2.25 2.25 0 001.15 2l1.08.62a2.25 2.25 0 002.3.08l1.54-.9 1.54.9a2.25 2.25 0 002.3-.08l1.08-.62a2.25 2.25 0 001.15-2v-.16a2.25 2.25 0 00-1.15-2l-1.08-.62a2.25 2.25 0 00-2.3-.08z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.72 8.79l-5.44 3.14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.88 14.47l-5.44-3.14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.72 14.47l-5.44-3.14" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.6 12l.06.03a2.25 2.25 0 011.08 1.95v.16a2.25 2.25 0 01-1.14 2l-1.08.62a2.25 2.25 0 01-2.3.08l-1.54-.9" />
    </Icon>
);
