interface LegalPlaceholderProps {
  message: string;
}

export function LegalPlaceholder({ message }: LegalPlaceholderProps) {
  return (
    <p className="bg-muted text-muted-foreground rounded-lg border border-dashed p-6 text-sm">
      {message}
    </p>
  );
}
