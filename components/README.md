# Components Directory

This directory contains all the React components used in the application, organized by their functionality.

## Component Organization

The components are organized as follows:

- **UI Components** (`/components/ui/`): Low-level, reusable UI elements that form the building blocks of the application's interface
- **Feature Components** (`/components/`): Higher-level components that implement specific features and application logic
- **Layout Components**: Components that provide structure to the application (e.g., AppSidebar, Chat)
- **Form Components**: Components related to data input and form handling (e.g., AuthForm, MultimodalInput)
- **Content Components**: Components for displaying content (e.g., Markdown, Message, CodeBlock)

## Global Context Usage

The application uses several global context providers for state management across components:

### Artifact Context

**Implementation**: `useArtifact` and `useArtifactSelector` hooks in `/hooks/use-artifact.ts`

**Purpose**: Manages the state of artifacts (documents, code, sheets, images) in the application.

**Used By**:
- `Artifact` component - Main consumer that displays and manages artifacts
- `Document` components - Retrieves and updates artifact content
- `DataStreamHandler` - Updates artifact state based on streaming data
- Various tool components that create or modify artifacts

**How It Works**: Uses SWR cache as a lightweight global state store, providing both direct state access and selector pattern APIs similar to Redux.

### Chat Visibility Context

**Implementation**: `useChatVisibility` hook in `/hooks/use-chat-visibility.ts`

**Purpose**: Manages visibility settings (private/public) for chat conversations.

**Used By**:
- `VisibilitySelector` component - UI for toggling visibility
- `Chat` component - Applies visibility settings to chat interface

**How It Works**: Combines local SWR cache with server actions to provide optimistic UI updates and server synchronization.

### Theme Context

**Implementation**: `ThemeProvider` component in `/components/theme-provider.tsx`

**Purpose**: Provides theming capabilities (light/dark mode) across the application.

**Used By**:
- All components that use themed styling
- Theme toggle controls in the UI

**How It Works**: Wraps Next.js theme provider and manages theme state with persistence.

### Sidebar Context

**Implementation**: `SidebarProvider` and `useSidebar` in `/components/ui/sidebar.tsx`

**Purpose**: Manages the sidebar's state (expanded/collapsed) and responsive behavior.

**Used By**:
- `AppSidebar` component - Main sidebar container
- `SidebarToggle` - Controls for toggling sidebar visibility
- Layout components that adapt to sidebar state

**How It Works**: Provides context with sidebar state and control functions, stores preferences in cookies, and offers keyboard shortcuts.

## Context Design Pattern

The application follows a consistent pattern for global state management:

1. **Custom Hooks**: Most global state is exposed through custom hooks (`useArtifact`, `useChatVisibility`, `useSidebar`)
2. **SWR for State**: Leverages SWR cache as a lightweight state container
3. **Context for UI Structure**: Uses React Context for UI structure components (sidebar, theming)
4. **Optimistic Updates**: Implements optimistic UI updates with server synchronization
5. **Selector Pattern**: Provides selector-based access to global state for performance optimization

This approach offers global state management without heavy dependencies like Redux, while maintaining flexibility and performance. 