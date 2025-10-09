type ChatItemProps = {
  item: { text: string; role: "User" | "Model" };
};

export default function ChatItem({ item }: ChatItemProps) {
  const { text, role } = item;
  return <div className="w-3/4">{text}</div>;
}
