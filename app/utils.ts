export const apiCall = async (uri) => {
    let token = localStorage.getItem('access_token')
    const refresh_token = localStorage.getItem('refresh_token')
    const expire = localStorage.getItem('expire')
    console.log("time checking", expire, Date.now(), Date.now() > Number(expire))
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
                client_id: process.env.NEXT_PUBLIC_CLIENT_ID
            }),
        }
        const refreshBody = await fetch(refreshUrl, refreshPayload);
        const refreshResponse = await refreshBody.json();
        if (refreshResponse?.error_description){
            window.location.replace(process.env.NEXT_PUBLIC_HOST)
            return
        }
        localStorage.setItem('access_token', refreshResponse.access_token);
        localStorage.setItem('refresh_token', refreshResponse.refresh_token);
        localStorage.setItem(
            "expire",
            refreshResponse.expires_in * 1000 + Date.now()
          );
        token = refreshResponse.access_token; 
    }
    const payload = {
        headers : {
            'Authorization': 'Bearer ' + token
        },
    }
    const response = await fetch (uri, payload)
    if (response.status!==200){
        throw new Error(`unable to get the response ${response.status}`)
    }
    const body = await response.json();
    return body
    
}

export const refreshCall = async () => {
    let token = localStorage.getItem('access_token')
    const refresh_token = localStorage.getItem('refresh_token')
    const expire = localStorage.getItem('expire')
    console.log("time checking", expire, Date.now(), Date.now() > Number(expire))
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
                client_id: process.env.NEXT_PUBLIC_CLIENT_ID
            }),
        }
        const refreshBody = await fetch(refreshUrl, refreshPayload);
        const refreshResponse = await refreshBody.json();
        if (refreshResponse?.error_description){
            window.location.replace(process.env.NEXT_PUBLIC_HOST)
            return
        }
        localStorage.setItem('access_token', refreshResponse.access_token);
        localStorage.setItem('refresh_token', refreshResponse.refresh_token);
        localStorage.setItem(
            "expire",
            refreshResponse.expires_in * 1000 + Date.now()
          );
}
}