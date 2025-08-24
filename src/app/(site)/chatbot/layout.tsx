export default function ChatbotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-[#2f2f2f]">
      {children}
    </div>
  );
}