import { NavLink } from "react-router";

export function GoBackToHome() {
    return (
        <button>
            <NavLink to="/" end>
                HomePage
            </NavLink>
        </button>
    )
}

export default function Register() {
    return (
        <>
        <GoBackToHome />
        </>
    )
};