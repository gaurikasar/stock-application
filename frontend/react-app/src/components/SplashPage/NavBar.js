import React from "react";
import { NavLink } from "react-router-dom";
import "../../css/NavBar.css";
import logoIcon from "../../css/images/risinghoodblackicon.png";

const NavBar = () => {
  return (
    <nav>
      <div className="nav-container">
        <div className="left-nav-container">
          <div className="logo-container">
            <NavLink to="/" id="splash-logo">
            SellScalehood <img src={logoIcon} alt="logo" />{" "}
            </NavLink>
          </div>
          
        </div>
        <div className="right-nav-container">
          <NavLink className="login" to="/login">
            {" "}
            Log in
          </NavLink>

          <NavLink className="signup" to="/sign-up">
            {" "}
            Sign up
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
