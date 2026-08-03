import pytest


@pytest.mark.asyncio
@pytest.mark.usefixtures("seed_db")
class TestTicketRoutes:
    async def test_create_ticket_route_returns_201_with_ticket(
        self, as_user, employee_1
    ):
        client = as_user(employee_1)
        response = client.post("/tickets/")

        assert response == 201
