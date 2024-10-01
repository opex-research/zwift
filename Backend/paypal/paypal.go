package paypal

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
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
	clientID := os.Getenv("PAYPAL_CLIENT_ID")
	clientSecret := os.Getenv("PAYPAL_CLIENT_SECRET")

	// Prepare form data.
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("code", authorizationCode)

	// Create a new HTTP request.
	req, err := http.NewRequest("POST", apiURL, bytes.NewBufferString(data.Encode()))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	// Add headers.
	authHeader := base64.StdEncoding.EncodeToString([]byte(fmt.Sprintf("%s:%s", clientID, clientSecret)))
	req.Header.Add("Authorization", "Basic "+authHeader)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	// Execute the request.
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %v", err)
	}
	defer resp.Body.Close()

	// Handle non-OK responses.
	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("unexpected status code: %d, response: %s", resp.StatusCode, string(bodyBytes))
	}

	// Decode the response.
	var tokenResp PayPalTokenResponse
	if err := json.NewDecoder(resp.Body).Decode(&tokenResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %v", err)
	}

	if tokenResp.AccessToken == "" {
		return nil, fmt.Errorf("received empty access token")
	}

	return &tokenResp, nil
}

// GetUserEmail retrieves the user's email using the access token.
func GetUserEmail(accessToken string) (string, error) {
	req, err := http.NewRequest("GET", "https://api-m.sandbox.paypal.com/v1/identity/openidconnect/userinfo?schema=openid", nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}

	// Add headers.
	req.Header.Add("Authorization", "Bearer "+accessToken)
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	// Execute the request.
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to make request: %v", err)
	}
	defer resp.Body.Close()

	// Handle non-OK responses.
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	// Decode the response.
	var userInfo PayPalUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return "", fmt.Errorf("failed to decode user info: %v", err)
	}

	return userInfo.Email, nil
}

// OrderCreationResponse represents the structure of the order creation response from PayPal.
type OrderCreationResponse struct {
	ID     string `json:"id"`
	Status string `json:"status"`
	Links  []struct {
		Href   string `json:"href"`
		Rel    string `json:"rel"`
		Method string `json:"method"`
	} `json:"links"`
}

// CreateOrder creates an order in the PayPal system.
func CreateOrder(accessToken string, orderData map[string]interface{}) (*OrderCreationResponse, error) {
	apiURL := "https://api-m.sandbox.paypal.com/v2/checkout/orders"
	bodyData, err := json.Marshal(orderData)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal order data: %v", err)
	}

	req, err := http.NewRequest("POST", apiURL, bytes.NewBuffer(bodyData))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %v", err)
	}

	req.Header.Add("Authorization", "Bearer "+accessToken)
	req.Header.Add("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to make request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated {
		bodyBytes, _ := io.ReadAll(resp.Body) // Ignore error on purpose for simplicity
		return nil, fmt.Errorf("unexpected status code: %d, response: %s", resp.StatusCode, string(bodyBytes))
	}

	var orderResp OrderCreationResponse
	if err := json.NewDecoder(resp.Body).Decode(&orderResp); err != nil {
		return nil, fmt.Errorf("failed to decode order creation response: %v", err)
	}

	return &orderResp, nil
}

// CaptureOrderResponse represents the response structure after capturing an order.
type CaptureOrderResponse struct {
	ID            string `json:"id"`
	Status        string `json:"status"`
	PurchaseUnits []struct {
		Payments struct {
			Captures []struct {
				ID     string `json:"id"`
				Status string `json:"status"`
				Amount struct {
					CurrencyCode string `json:"currency_code"`
					Value        string `json:"value"`
				} `json:"amount"`
				FinalCapture bool `json:"final_capture"`
			} `json:"captures"`
		} `json:"payments"`
	} `json:"purchase_units"`
}

// CaptureOrder captures a payment for an order by its ID using the given access token.
func CaptureOrder(accessToken, orderID string) (*CaptureOrderResponse, error) {
	apiURL := fmt.Sprintf("https://api-m.sandbox.paypal.com/v2/checkout/orders/%s/capture", orderID)

	req, err := http.NewRequest("POST", apiURL, nil) // No body is required for this request
	if err != nil {
		return nil, fmt.Errorf("creating request: %v", err)
	}

	// Add necessary headers
	req.Header.Add("Authorization", "Bearer "+accessToken)
	log.Printf("token in order: %s", accessToken)

	req.Header.Add("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("executing request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		bodyBytes, err := ioutil.ReadAll(resp.Body)
		if err != nil {
			return nil, fmt.Errorf("reading response body: %v", err)
		}
		return nil, fmt.Errorf("API request failed with status code %d: %s", resp.StatusCode, string(bodyBytes))
	}

	var captureResp CaptureOrderResponse
	if err := json.NewDecoder(resp.Body).Decode(&captureResp); err != nil {
		return nil, fmt.Errorf("decoding response: %v", err)
	}

	return &captureResp, nil
}
