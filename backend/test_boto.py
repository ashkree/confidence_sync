import asyncio
from app.repository.cognito import CognitoRepo

async def main():
    repo = CognitoRepo()
    try:
        res = await repo.login_user("test@example.com", "password")
        print(res)
    except Exception as e:
        print(repr(e))
        if hasattr(e, '__cause__'):
            print(repr(e.__cause__))

asyncio.run(main())
