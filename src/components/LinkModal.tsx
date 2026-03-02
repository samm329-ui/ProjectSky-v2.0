'use client';

import { useEffect, useRef } from 'react';
import { ConstellationData } from '@/types';

interface Props {
    constellation: ConstellationData | null;
    onClose: () => void;
    showContent: boolean;
}

export default function LinkModal({ constellation, onClose, showContent }: Props) {
    const modalRef = useRef<HTMLDivElement>(null);
    const firstFocusRef = useRef<HTMLButtonElement>(null);

    // Focus trap & Escape key
    useEffect(() => {
        if (!constellation || !showContent) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
                return;
            }

            // Focus trap
            if (e.key === 'Tab' && modalRef.current) {
                const focusable = modalRef.current.querySelectorAll<HTMLElement>(
                    'button, a, [tabindex]:not([tabindex="-1"])'
                );
                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last?.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first?.focus();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        setTimeout(() => firstFocusRef.current?.focus(), 100);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [constellation, onClose, showContent]);

    if (!constellation) return null;

    const linksToShow = constellation.modalLinks ?? constellation.links;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center"
            style={{
                zIndex: 50,
                // Semi-transparent overlay that lets the zoomed galaxy show through
                background: showContent
                    ? 'radial-gradient(ellipse at center, rgba(0,5,20,0.4) 0%, rgba(0,5,20,0.75) 100%)'
                    : 'transparent',
                transition: 'background 0.5s ease',
                pointerEvents: showContent ? 'auto' : 'none',
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget && showContent) onClose();
            }}
            role="dialog"
            aria-modal="true"
            aria-label={constellation.label}
        >
            {showContent && (
                <div
                    ref={modalRef}
                    style={{
                        animation: 'contentReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                        maxWidth: '420px',
                        width: '92%',
                    }}
                >
                    {/* Close button — floating in top-right corner */}
                    <button
                        ref={firstFocusRef}
                        onClick={onClose}
                        aria-label="Close modal"
                        style={{
                            position: 'absolute',
                            top: '-40px',
                            right: '0px',
                            background: 'rgba(10, 20, 60, 0.6)',
                            border: '1px solid rgba(100, 160, 255, 0.3)',
                            color: 'rgba(180, 210, 255, 0.85)',
                            fontSize: '16px',
                            cursor: 'pointer',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.25s ease',
                            backdropFilter: 'blur(8px)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(40, 80, 180, 0.6)';
                            e.currentTarget.style.borderColor = 'rgba(150, 200, 255, 0.6)';
                            e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(10, 20, 60, 0.6)';
                            e.currentTarget.style.borderColor = 'rgba(100, 160, 255, 0.3)';
                            e.currentTarget.style.color = 'rgba(180, 210, 255, 0.85)';
                        }}
                    >
                        ✕
                    </button>

                    {/* Title */}
                    <h2
                        style={{
                            fontFamily: "'Cinzel', serif",
                            fontSize: '20px',
                            color: 'rgba(210, 230, 255, 0.95)',
                            textShadow: '0 0 16px rgba(100, 160, 255, 0.7)',
                            letterSpacing: '0.14em',
                            textAlign: 'center',
                            marginBottom: '28px',
                            animation: 'titleGlow 3s ease-in-out infinite',
                        }}
                    >
                        {constellation.label}
                    </h2>

                    {/* Link list — staggered entry */}
                    <div className="flex flex-col gap-3">
                        {linksToShow.map((link, index) => (
                            <a
                                key={link.id}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 no-underline"
                                style={{
                                    padding: '14px 20px',
                                    borderRadius: '12px',
                                    background: 'rgba(8, 18, 60, 0.65)',
                                    border: '1px solid rgba(100, 160, 255, 0.25)',
                                    color: 'rgba(200, 225, 255, 0.95)',
                                    fontSize: '15px',
                                    textDecoration: 'none',
                                    backdropFilter: 'blur(12px)',
                                    boxShadow: '0 4px 24px rgba(0, 10, 40, 0.5), inset 0 1px 0 rgba(100, 160, 255, 0.1)',
                                    animation: `linkSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08 + 0.15}s forwards`,
                                    opacity: 0,
                                    transition: 'all 0.25s ease',
                                }}
                                onMouseEnter={(e) => {
                                    const el = e.currentTarget;
                                    el.style.background = 'rgba(25, 50, 120, 0.7)';
                                    el.style.borderColor = 'rgba(150, 200, 255, 0.5)';
                                    el.style.transform = 'translateY(-2px) scale(1.02)';
                                    el.style.boxShadow = '0 8px 32px rgba(60, 120, 255, 0.3), inset 0 1px 0 rgba(150, 200, 255, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    const el = e.currentTarget;
                                    el.style.background = 'rgba(8, 18, 60, 0.65)';
                                    el.style.borderColor = 'rgba(100, 160, 255, 0.25)';
                                    el.style.transform = 'translateY(0) scale(1)';
                                    el.style.boxShadow = '0 4px 24px rgba(0, 10, 40, 0.5), inset 0 1px 0 rgba(100, 160, 255, 0.1)';
                                }}
                            >
                                {/* Small star icon */}
                                <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="rgba(150, 200, 255, 0.8)"
                                >
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <span style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 400 }}>
                                    {link.label}
                                </span>
                                {/* External link arrow */}
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="rgba(120, 170, 255, 0.5)"
                                    style={{ marginLeft: 'auto' }}
                                >
                                    <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7zm-2 16H5V7h7V5H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h-2v7H9z" />
                                </svg>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
