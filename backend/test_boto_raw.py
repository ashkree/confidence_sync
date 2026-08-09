import asyncio
from app.repository.cognito import CognitoRepo

async def main():
    repo = CognitoRepo()
    try:
        res = await repo.login_user("employee@test.com", "password123")
        print(res)
    except Exception as e:
        print("EXCEPTION:", repr(e))
        if hasattr(e, '__cause__'):
            print("CAUSE:", repr(e.__cause__))

asyncio.run(main())
