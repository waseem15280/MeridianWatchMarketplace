# THC Seller Connect - Mobile Application (Android & iOS)

A dedicated, cross-platform mobile application for luxury timepiece sellers on the THC Marketplace (`thcwatches.com`).

## Architecture & Features

1. **Android & iOS Compatibility**:
   - Built with modern React Native & Expo.
   - Run on Android emulator/device, iOS simulator/device, or instant web preview.

2. **Real-time SignalR Integration**:
   - Communicates directly with the THC backend SignalR Hub (`/hubs/chat` at `http://localhost:5000` or `https://thcwatches.com`).
   - Registers on seller's channel `seller-{sellerId}`.

3. **Inquiry Notification Center**:
   - When a buyer clicks **"Chat with seller"** on the web marketplace for a watch whose seller has pending KYC, an inquiry is dispatched with the timepiece photo, model, and selling price.
   - The mobile application receives a real-time `NewInquiryAlert` and displays an animated mobile push notification banner at the top of the device, as well as logging it in the notification tray.

4. **Live 2-Way Chat**:
   - Seller opens the inquiry on their phone, reviews the watch photo, reference number, listed price, and buyer's message.
   - Seller types their reply (or taps one of the quick replies) and hits Send.
   - The reply is broadcast via SignalR `SendMessage` and immediately appears in the buyer's open chat window on the web application!

## Running the Mobile Application

### 1. Install dependencies
```bash
cd seller-connect
npm install
```

### 2. Start Expo Development Server
```bash
# Start Expo interactive server (scan QR code in Expo Go app on iPhone or Android)
npx expo start

# Or run directly in Android emulator
npx expo start --android

# Or run directly in iOS simulator
npx expo start --ios

# Or preview in web browser
npx expo start --web
```
