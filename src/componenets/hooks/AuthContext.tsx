// "use client";

// import { createContext, useState, useContext, ReactNode } from "react";

// type AuthContextType = {
//   accessToken: string | null;
//   setAccessToken: (token: string | null) => void;
//   logout: () => void;
// };

// export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [accessToken, setAccessToken] = useState<string | null>(null);

//   const logout = async () => {
//     const refreshToken = localStorage.getItem("refreshToken");
//     if (refreshToken) {
//       await fetch("/api/auth/logout", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ refreshToken }),
//       });
//     }

//     // Clear client storage
//     setAccessToken(null);
//     localStorage.removeItem("refreshToken");

//     // Optional: redirect
//     window.location.href = "/login";
//   };

//   return (
//     <AuthContext.Provider value={{ accessToken, setAccessToken, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export function useAuth() {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used inside AuthProvider");
//   }
//   return context;
// }
