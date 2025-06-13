import { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );

  const [user, setUser] = useState(() => {
    try {
      if (!token) return null;
      const decoded = jwtDecode(token);
      // console.log("Decoded at load:", decoded);
      return {
        email:
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
          ],
        role: decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ],
        id: decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ],
        username:
          decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"], // ✅ added
      };
    } catch {
      return null;
    }
  });

  const login = (jwt) => {
    localStorage.setItem("token", jwt);
    setToken(jwt);
    const decoded = jwtDecode(jwt);
    // console.log("Decoded at login:", decoded);

    const user = {
      email:
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ],
      role: decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ],
      id: decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ],
      username:
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"], // ✅ added
    };

    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
