import { Phone, MessageCircle, Instagram, Globe, Youtube, Coffee } from "lucide-react"

export function ContactTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "phone":
      return <Phone className="h-4 w-4" />
    case "kakaotalk":
      return <MessageCircle className="h-4 w-4" />
    case "instagram":
      return <Instagram className="h-4 w-4" />
    case "cafe":
      return <Coffee className="h-4 w-4" />
    case "youtube":
      return <Youtube className="h-4 w-4" />
    case "web":
      return <Globe className="h-4 w-4" />
    default:
      return null
  }
} 