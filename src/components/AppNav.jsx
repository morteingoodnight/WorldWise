import { NavLink } from "react-router-dom"
import styles from "./AppNav.module.css"

export default function PageNav(){
    return <nav className={styles.nav}>
        <ul>
            <li><NavLink to='cities'>Cities</NavLink></li>
            <li><NavLink to='countries'>Countries</NavLink></li>
            {/* <li><NavLink to='form'>Form</NavLink></li> */}
        </ul>
    </nav>
}