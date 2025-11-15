import React from 'react'
import { Link } from 'react-router-dom'
import Dashboard from '../../pages/Dashboard'

export default function Navbar() {
    return (
        <header className="navbar glass">
            <div className="navbar-left">
                <div className="logo">NF</div>
                <div className="brand-title">No-code Forms</div>
            </div>

            <div className="navbar-right">
                {/* <button className="btn btn-ghost">Admin</button> */}
                <Link to={'/dashboard'} className="btn btn-ghost">Admin</Link>
            </div>
        </header>
    )
}
