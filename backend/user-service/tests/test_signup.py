from unittest.mock import MagicMock


class TestSignup:
    def test_signup_success(self, client, mock_supabase, mock_user):
        mock_supabase.auth.sign_up.return_value = MagicMock(user=mock_user)

        response = client.post(
            "/signup",
            json={"email": "new@example.com", "password": "pass123", "display_name": "New User"},
        )

        assert response.status_code == 201
        body = response.get_json()
        assert body["message"] == "Signup successful"
        assert body["display_name"] == "Test User"

    def test_signup_without_display_name(self, client, mock_supabase, mock_user):
        mock_supabase.auth.sign_up.return_value = MagicMock(user=mock_user)

        response = client.post("/signup", json={"email": "new@example.com", "password": "pass123"})

        assert response.status_code == 201
        call_kwargs = mock_supabase.auth.sign_up.call_args[0][0]
        assert call_kwargs["options"]["data"]["display_name"] == ""

    def test_signup_supabase_error_returns_400(self, client, mock_supabase):
        mock_supabase.auth.sign_up.side_effect = Exception("Email already registered")

        response = client.post(
            "/signup",
            json={"email": "exists@example.com", "password": "pass123"},
        )

        assert response.status_code == 400

    def test_signup_passes_display_name_to_supabase(self, client, mock_supabase, mock_user):
        mock_supabase.auth.sign_up.return_value = MagicMock(user=mock_user)

        client.post(
            "/signup",
            json={"email": "new@example.com", "password": "pass123", "display_name": "My Name"},
        )

        call_kwargs = mock_supabase.auth.sign_up.call_args[0][0]
        assert call_kwargs["options"]["data"]["display_name"] == "My Name"
