export const apiCall = async (uri: string) => {
  try {
    let token = localStorage.getItem('access_token');
    const refresh_token = localStorage.getItem('refresh_token');
    const expire = localStorage.getItem('expire');
    
    if (!token || !refresh_token) {
      throw new Error("401 Unauthorized - No credentials");
    }
    
    if (Date.now() > Number(expire)) {
      try {
        await refreshCall();
        token = localStorage.getItem('access_token');
      } catch (error) {
        throw new Error("401 Unauthorized - Refresh failed");
      }
    }
    
    const response = await fetch(uri, {
      headers: {
        'Authorization': 'Bearer ' + token
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("401 Unauthorized");
      }
      throw new Error(`Request failed with status ${response.status}`);
    }
    
    return response.json();
  } catch (error: unknown) {
    // Type guard for Error objects
    if (error instanceof Error) {
      // Only log non-401 errors
      if (!error.message.includes('401')) {
        console.error("API Call Error:", error);
      }
    } else {
      // Log unexpected error types
      console.error("Unexpected error:", error);
    }
    throw error;
  }
};

export const refreshCall = async () => {
  let token = localStorage.getItem('access_token');
  const refresh_token = localStorage.getItem('refresh_token');
  const expire = localStorage.getItem('expire');
  
  // console.log("time checking", expire, Date.now(), Date.now() > Number(expire));
  
  if (!!refresh_token && Date.now() > Number(expire)) {
    const refreshUrl = "https://accounts.spotify.com/api/token";
    const refreshPayload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refresh_token,
        client_id: process.env.NEXT_PUBLIC_CLIENT_ID || ""
      }).toString(), // Convert to string
    };
    
    const refreshBody = await fetch(refreshUrl, refreshPayload);
    const refreshResponse = await refreshBody.json();
    
    if (refreshResponse?.error_description) {
      window.location.replace(process.env.NEXT_PUBLIC_HOST || "");
      return;
    }
    
    localStorage.setItem('access_token', refreshResponse.access_token);
    localStorage.setItem('refresh_token', refreshResponse.refresh_token);
    localStorage.setItem(
      "expire",
      (refreshResponse.expires_in * 1000 + Date.now()).toString() // Convert to string
    );
  }
};
  