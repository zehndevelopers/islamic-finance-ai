# Islamic Finance AI Chat Application

A comprehensive React-based chat application for Islamic finance consultation, built with modern technologies and beautiful Islamic-themed UI design.

## 🌙 Features

- **Real-time Chat Interface** - Seamless messaging with Islamic Finance AI assistant
- **Islamic-themed Design** - Beautiful UI with Islamic color palette and geometric patterns
- **Multi-language Support** - RTL text support for Arabic content
- **Persistent Chat History** - Local storage for chat sessions
- **Quick Actions** - Pre-defined prompts for common Islamic finance queries
- **Citation Support** - Proper formatting for Quranic verses and Hadith references
- **Responsive Design** - Works perfectly on desktop and mobile devices
- **Accessibility** - WCAG compliant design with proper focus management

## 🚀 Technologies Used

- **React 18+** with functional components and hooks
- **TypeScript** for type safety
- **Tailwind CSS** for styling and responsive design
- **shadcn/ui** component library
- **React Router DOM** for navigation
- **React Query (TanStack Query)** for API state management
- **Zustand** for global state management
- **Vite** for fast development and building

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── chat/            # Chat-specific components
│   │   └── layout/          # Layout components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions and constants
│   ├── pages/               # Page components
│   ├── stores/              # Zustand stores
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
└── package.json
```

## 🛠️ Installation

1. **Install dependencies:**

   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## 🎨 Design Features

### Islamic Theme

- **Colors**: Green, teal, and gold color palette inspired by Islamic art
- **Typography**: Inter font for UI, Amiri font for Arabic text
- **Patterns**: Subtle Islamic geometric patterns as design elements
- **Icons**: Moon and Islamic symbols

### UI Components

- **Message Bubbles**: Differentiated styling for user vs AI messages
- **Sidebar**: Chat history with session management
- **Header**: Islamic branding with status indicators
- **Quick Actions**: Categorized buttons for common queries
- **Welcome Screen**: Beautiful onboarding experience

### Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Sidebar Toggle**: Collapsible sidebar on smaller screens
- **Adaptive Layout**: Flexible grid system
- **Touch-friendly**: Large touch targets for mobile interaction

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=your_api_endpoint
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### API Integration

The application is ready for API integration. Update the `useChat` hook in `src/hooks/useChat.ts` to connect to your backend:

```typescript
const sendChatMessage = async (content: string): Promise<ChatResponse> => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: content }),
  });
  return response.json();
};
```

## 📱 Usage

### Starting a Chat

1. Open the application
2. Click "New Chat" or use an existing session
3. Type your Islamic finance question
4. Use quick actions for common queries

### Quick Actions

- **Qard Hasan**: Interest-free loans
- **Mudaraba**: Profit-sharing partnerships
- **Sukuk**: Islamic bonds
- **Halal Investment**: Sharia-compliant investments
- **Ijara**: Islamic leasing
- **Musharaka**: Joint ventures

### Features

- **Copy Messages**: Click the copy button on any message
- **Session Management**: Create, switch, and delete chat sessions
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for new line
- **Auto-scroll**: Messages automatically scroll to bottom
- **Loading States**: Visual feedback during AI responses

## 🌐 Internationalization

The application supports:

- **English**: Primary language
- **Arabic**: RTL text support for Islamic content
- **Mixed Content**: Seamless handling of Arabic terms in English text

## ♿ Accessibility

- **WCAG Compliant**: Follows accessibility guidelines
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Proper ARIA labels and semantic HTML
- **Focus Management**: Clear focus indicators
- **Color Contrast**: High contrast ratios for readability

## 🔒 Security

- **Input Validation**: Client-side input sanitization
- **XSS Protection**: Safe HTML rendering
- **Local Storage**: Secure client-side data storage
- **API Security**: Ready for authentication integration

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify/Vercel

The application is ready for deployment to modern hosting platforms:

1. Connect your repository
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Islamic Finance Principles**: Based on authentic Quranic and Hadith sources
- **Design Inspiration**: Islamic geometric patterns and calligraphy
- **Community**: Islamic finance scholars and practitioners

---

**Bismillah** - In the name of Allah, the Most Gracious, the Most Merciful
