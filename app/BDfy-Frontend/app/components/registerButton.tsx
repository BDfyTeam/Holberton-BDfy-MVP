import { NavLink } from "react-router";

export default function RegisterButton() {
    return (
        <button>
            <NavLink to="/register" end>
                Register form
            </NavLink>
        </button>
    )
}