import { ChatInterface } from "@/components/chat/chat-interface"

export const metadata = {
  title: "Диалог с AI · NeuralBrief",
  description:
    "Интерактивный диалог с AI-ассистентом, который собирает техническое задание за пять минут.",
}

export default function ChatPage() {
  return <ChatInterface />
}
