export default function ChatWelcomePage() {
  return (
    <div className="flex h-full items-center justify-center text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-semibold">
          Welcome to ChatBot Console
        </h1>

        <p className="text-muted-foreground">
          Select an existing chat from the sidebar or create a new one to start
          a conversation.
        </p>

        <p className="text-sm text-muted-foreground">
          Your conversations are saved locally in your browser.
        </p>
      </div>
    </div>
  );
}
