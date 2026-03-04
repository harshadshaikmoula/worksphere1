import React from 'react';
import { jwtDecode } from 'jwt-decode';

type GoogleCredential = {
  name: string;
  email: string;
  picture: string;
  sub: string;
};

const handleOAuthLogin = (provider: string) => {
  if (provider !== 'google') return;

  /* @ts-ignore */
  window.google.accounts.id.initialize({
    client_id: '85410249110-m2v3h8ncfuphc3p492t2h4o4ah7t9bt8.apps.googleusercontent.com',
    callback: (response: any) => {
      if (response.credential) {
        try {
          const decoded = jwtDecode<GoogleCredential>(response.credential);
          console.log("User info:", decoded);
          localStorage.setItem("user", JSON.stringify(decoded));
        } catch (error) {
          console.error("Failed to decode token:", error);
        }
      } else {
        console.error("No credential returned");
      }
    },
  });

  /* @ts-ignore */
  window.google.accounts.id.prompt(); // show the Google popup
};

const LoginWithGoogle = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <button
        onClick={() => handleOAuthLogin('google')}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default LoginWithGoogle;
