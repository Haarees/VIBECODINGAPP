import requests

url = "http://localhost:5000/download/MICROSOFT%20AI%20SLOP.pdf"
try:
    r = requests.get(url)
    print("Status Code:", r.status_code)
    print("Headers:")
    for k, v in r.headers.items():
        print(f"{k}: {v}")
    print(f"Content Start: {r.content[:20]}")
except Exception as e:
    print(e)
