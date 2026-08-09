import urllib.request
import json
from app.config import settings

url = f"http://localhost:9229/{settings.cognito_user_pool_id}/.well-known/jwks.json"
url2 = f"http://0.0.0.0:9229/{settings.cognito_user_pool_id}/.well-known/jwks.json"
print("URL1:", url)
try:
    print(urllib.request.urlopen(url).read())
except Exception as e:
    print("URL1 failed:", e)

print("URL2:", url2)
try:
    print(urllib.request.urlopen(url2).read())
except Exception as e:
    print("URL2 failed:", e)

