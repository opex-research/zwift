package paypal

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
)

// PayPalTokenResponse represents the PayPal token response structure.
type PayPalTokenResponse struct {
	AccessToken string `json:"access_token"`
}

// PayPalUserInfo represents the structure of the user info obtained from PayPal.
type PayPalUserInfo struct {
	Email string `json:"email"`
}

// RequestAccessToken requests an access token from PayPal using the authorization code.
func RequestAccessToken(authorizationCode string) (*PayPalTokenResponse, error) {
	apiURL := "https://api-m.sandbox.paypal.com/v1/oauth2/token"
	clientID := "ATWNj8MbBvdUupI3VbC-isIb-fxnQ7j8Op6ch7rds51niwt1xGU0yreyPaFweWF_PZE5Yi71EXILTY7-"
	clientSecret := "EJtd8zeo_9Y-iFOUNJ_Z7UM5U-qzeY8A9QrFx_dyheBV0WoB9WB4fGGjSqdrIVWf1CilBbd_ow1h2qDv"

	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("code", authorizationCode)

	req, err := http.NewRequest("POST", apiURL, bytes.NewBufferString(data.Encode()))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	// Add required headers.
	authHeader := base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s:%s", clientID, clientSecret)))
	req.Header.Add("Authorization", "Basic "+authHeader)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body) // Ignore error on purpose for simplicity

		return nil, fmt.Errorf("unexpected status code: %d, response: %s", resp.StatusCode, string(bodyBytes))
	}

	var tokenResp PayPalTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	if tokenResp.AccessToken == "" {
		return nil, fmt.Errorf("received empty access token")
	}

	return &tokenResp, nil
}

// GetUserEmail uses the access token to request the user's email from PayPal's user info endpoint.
func GetUserEmail(accessToken string) (string, error) {
	req, err := http.NewRequest("GET", "https://api-m.sandbox.paypal.com/v1/identity/openidconnect/userinfo?schema=openid", nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	// Add required headers.
	req.Header.Add("Authorization", "Bearer "+accessToken)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var userInfo PayPalUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return "", fmt.Errorf("failed to decode user info: %v", err)
	}

	return userInfo.Email, nil
}
