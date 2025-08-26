export default function ChatbotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#2f2f2f] pt-[80px]">
      {children}
    </div>
  );
}