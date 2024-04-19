export const apiCall = async (uri) => {
    let token = localStorage.getItem('access_token')
    const refresh_token = localStorage.getItem('refresh_token')
    const expiry = localStorage.getItem('expiry')
    if (Date.now() > expiry) {
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

        localStorage.setItem('access_token', refreshResponse.accessToken);
        localStorage.setItem('refresh_token', refreshResponse.refreshToken);
        token = refreshResponse.accessToken; 
    }
    const payload = {
        headers : {
            'Authorization': 'Bearer ' + token
        },
    }
    const body = await fetch (uri, payload)
    return body.json()
    
}