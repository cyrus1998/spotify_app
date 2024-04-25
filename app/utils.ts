export const apiCall = async (uri) => {
    let token = localStorage.getItem('access_token')
    const refresh_token = localStorage.getItem('refresh_token')
    const expire = localStorage.getItem('expire')
    console.log("time checking", expire, Date.now(), Date.now() > Number(expire))
    if (Date.now() > Number(expire)) {
        const refreshUrl = "https://accounts.spotify.com/api/token";
        const refreshPayload = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refresh_token,
                client_id: process.env.NEXT_PUBLIC_CLIENT_ID
            }),
        }
        const refreshBody = await fetch(refreshUrl, refreshPayload);
        const refreshResponse = await refreshBody.json();
        if (refreshResponse?.error_description === "Invalid refresh token"){
            window.location.replace(process.env.NEXT_PUBLIC_HOST)
            return
        }
        localStorage.setItem('access_token', refreshResponse.accessToken);
        localStorage.setItem('refresh_token', refreshResponse.refreshToken);
        token = refreshResponse.accessToken; 
    }
    const payload = {
        headers : {
            'Authorization': 'Bearer ' + token
        },
    }
    const response = await fetch (uri, payload)
    const body = await response.json();
    return body
    
}

export function getField(obj, field) {
    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          const value = getField(obj[i]);
          if (value !== undefined) {
            return value;
          }
        }
      } else {
        for (const key in obj) {
          if (key === field) {
            return obj[key];
          }
          const value = getField(obj[key]);
          if (value !== undefined) {
            return value;
          }
        }
      }
    }
    return undefined;
  }