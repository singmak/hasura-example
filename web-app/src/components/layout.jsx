import React from "react";
import {
  Link
} from "react-router-dom";

import * as userToken from '../user-token';

const Nav = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/messages">My Messages</Link>
        </li>
        <li>
          <Link to="/users">Users</Link>
        </li>
      </ul>
    </nav>
  )
}

const NotLoggedIn = () => {
  return (
    <div>
      <Link to="/login"><button>Login</button></Link>
      <Link to="/register"><button>Register</button></Link>
    </div>
  )
}

export const Layout = ({ children }) => {
  const token = userToken.getToken();

  return (
    <div>
      <Nav />
      {
        token ? children : (
          <NotLoggedIn />
        )}
    </div>
  )
}