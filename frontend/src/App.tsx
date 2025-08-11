import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ChatPage } from "@/pages/ChatPage";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import "./App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage showWelcome={false} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:sessionId"
              element={
                <ProtectedRoute>
                  <ChatPage showWelcome={false} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </Router>
    </QueryClientProvider>
  );
}

export default App;
