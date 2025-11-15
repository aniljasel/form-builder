import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
    const [pinned, setPinned] = useState(false)
    const [hovered, setHovered] = useState(false)
    const location = useLocation()

    const navItems = [
        { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
        { to: '/builder/new', label: 'Create Form', icon: PlusIcon },
        { to: '/responses', label: 'Responses', icon: ListIcon },
    ]

    const open = pinned || hovered

    function onToggleClick(e) {
        e.stopPropagation()
        setPinned(prev => !prev)
    }

    return (
        <aside
            className={`sidebar glass ${open ? 'sidebar-open' : 'sidebar-closed'}`}
            aria-label="Main sidebar"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="sidebar-top">
                <div className="sidebar-brand">
                    <div className="logo" aria-hidden>NF</div>
                    {open && <div className="brand-title"></div>}
                </div>

                <button
                    className="btn"
                    aria-expanded={open}
                    aria-pressed={pinned}
                    onClick={onToggleClick}
                    title={pinned ? 'Unpin sidebar' : 'Pin sidebar'}
                >
                    {pinned ? <PinIcon /> : (open ? '‹' : '›')}
                </button>
            </div>

            <nav id="sidebar-nav" className="sidebar-nav" aria-hidden={!open && !pinned}>
                {navItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={`nav-item ${location.pathname === item.to ? 'active' : ''}`}
                    >
                        <span className="icon" aria-hidden>
                            <item.icon />
                        </span>
                        {open && <span className="nav-label">{item.label}</span>}
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <Link to="/help" className="nav-item">
                    <span className="icon"><HelpIcon /></span>
                    {open && <span className="nav-label">Help</span>}
                </Link>

                <button
                    className="btn"
                    onClick={() => { /* replace alert with auth sign out later */ alert('Logged out (placeholder)') }}
                    style={{ alignSelf: open ? 'stretch' : 'center' }}
                >
                    {open ? 'Logout' : <LogoutIcon />}
                </button>
            </div>
        </aside>
    )
}

/* ---------- Inline SVG icons ---------- */
function PinIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2v10.5l-3-3-1.5 1.5 5.5 5.5 5.5-5.5-1.5-1.5-3 3V2h-2z" fill="currentColor" />
        </svg>
    )
}

function DashboardIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
            <rect x="13" y="3" width="8" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
            <rect x="13" y="10.5" width="8" height="10.5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
            <rect x="3" y="13" width="8" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
        </svg>
    )
}
function PlusIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
function ListIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
function HelpIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 18h.01M9.09 9.09a3.5 3.5 0 1 1 5.82 2.41c-.66.8-1.5 1.25-1.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" />
        </svg>
    )
}
function LogoutIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
