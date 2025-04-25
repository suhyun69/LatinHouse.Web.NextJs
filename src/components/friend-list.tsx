"use client"

import { ProfileView } from "@/app/api/profiles/[profile_id]/route"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export default function FriendList({ 
  friends, 
  onFriendClick,
  onDeleteFriend 
}: { 
  friends: ProfileView[], 
  onFriendClick: (profileId: string) => void,
  onDeleteFriend: (profileId: string) => void 
}) {
  return (
    <>
      {friends.map((friend) => (
        <div key={friend.id} className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-4" onClick={() => onFriendClick(friend.id)}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={friend.avatar_url} alt="Image" />
              <AvatarFallback></AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium leading-none">{friend.nickname}</p>
              <p className="text-sm text-muted-foreground">{friend.id}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFriend(friend.id);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </> 
  )
}