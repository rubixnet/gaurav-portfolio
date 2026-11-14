'use client';
import type {Ref} from 'react';
export function ActionPrompt({label,onClick,className='',buttonRef}:{label:string;onClick:()=>void;className?:string;buttonRef?:Ref<HTMLButtonElement>}){
 return <button ref={buttonRef} className={`action-prompt ${className}`} onClick={onClick} title={`${label} · Enter or E`}><kbd aria-hidden="true">E</kbd><span className="action-label">{label}</span><svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></button>;
}
