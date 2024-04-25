function getField(obj, field) {
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

let obj = {
    "artists": {
        "items": [
            {
                "external_urls": {
                    "spotify": "https://open.spotify.com/artist/2vCAD2Z0t8kIHt7UwJ0bvu"
                },
                "followers": {
                    "href": null,
                    "total": 613
                },
                "genres": [],
                "href": "https://api.spotify.com/v1/artists/2vCAD2Z0t8kIHt7UwJ0bvu",
                "id": "2vCAD2Z0t8kIHt7UwJ0bvu",
                "images": [
                    {
                        "height": 640,
                        "url": "https://i.scdn.co/image/ab6761610000e5ebdb2e0996817bb645102d87ad",
                        "width": 640
                    },
                    {
                        "height": 320,
                        "url": "https://i.scdn.co/image/ab67616100005174db2e0996817bb645102d87ad",
                        "width": 320
                    },
                    {
                        "height": 160,
                        "url": "https://i.scdn.co/image/ab6761610000f178db2e0996817bb645102d87ad",
                        "width": 160
                    }
                ],
                "name": "徐天佑",
                "popularity": 2,
                "type": "artist",
                "uri": "spotify:artist:2vCAD2Z0t8kIHt7UwJ0bvu"
            },
            {
                "external_urls": {
                    "spotify": "https://open.spotify.com/artist/73Br8HQURUxRXra3egAtzp"
                },
                "followers": {
                    "href": null,
                    "total": 7464
                },
                "genres": [
                    "cantopop",
                    "hong kong indie",
                    "hong kong rock"
                ],
                "href": "https://api.spotify.com/v1/artists/73Br8HQURUxRXra3egAtzp",
                "id": "73Br8HQURUxRXra3egAtzp",
                "images": [
                    {
                        "height": 640,
                        "url": "https://i.scdn.co/image/ab6761610000e5eb6450a2d15a7d2843b9e2d2c3",
                        "width": 640
                    },
                    {
                        "height": 320,
                        "url": "https://i.scdn.co/image/ab676161000051746450a2d15a7d2843b9e2d2c3",
                        "width": 320
                    },
                    {
                        "height": 160,
                        "url": "https://i.scdn.co/image/ab6761610000f1786450a2d15a7d2843b9e2d2c3",
                        "width": 160
                    }
                ],
                "name": "Nowhere Boys",
                "popularity": 21,
                "type": "artist",
                "uri": "spotify:artist:73Br8HQURUxRXra3egAtzp"
            }
        ],
        "next": null,
        "total": 2,
        "cursors": {
            "after": null
        },
        "limit": 20,
        "href": "https://api.spotify.com/v1/me/following?type=artist&limit=20&locale=en-GB,en-US;q=0.9,en;q=0.8"
    }
}

console.log(getField(obj, "total"))