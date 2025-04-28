import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check } from "lucide-react"
import { useState, useEffect } from "react"
import React from "react"
import { ProfileView } from "@/app/api/profiles/[profile_id]/route"

interface FriendAddDialogProps {
  dialogOpen: boolean
  onDialogOpenChange: (open: boolean) => void
  onAdd: (selectedProfiles: ProfileView[]) => void
  loginProfile: ProfileView | null
}

export function FriendAddDialog(props : FriendAddDialogProps) {

  const [profiles, setProfiles] = useState<ProfileView[]>([])
  const [selectedProfiles, setSelectedProfiles] = useState<ProfileView[]>([])
  const [searchInput, setSearchInput] = useState<string>('')

  useEffect(() => {

    // 초기화
    setProfiles([])
    setSelectedProfiles([])

    const fetchProfiles = async () => {
      const response = await fetch('/api/profiles', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      const result = await response.json()
      setProfiles(result.data)
    }
    fetchProfiles()
  }, [props.dialogOpen])

  return (
    <Dialog open={props.dialogOpen} onOpenChange={props.onDialogOpenChange}>
        <DialogContent className="gap-0 p-0 outline-none">
          <DialogHeader className="px-4 pb-4 pt-5">
            <DialogTitle>친구 추가</DialogTitle>
            <DialogDescription>
              Add Friends
            </DialogDescription>
          </DialogHeader>
          <Command className="overflow-hidden rounded-t-none border-t bg-transparent">
            <CommandInput
              placeholder="Search user..."
              value={searchInput}
              onValueChange={(value) => setSearchInput(value)}
            />
            <CommandList>
              {searchInput === '' ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  ID를 입력하세요.
                </div>
              ) : (
                <>
                  {profiles.filter((profile) =>
                    profile.id.includes(searchInput) && profile.id !== props.loginProfile?.id
                  ).length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No users found.
                    </div>
                  ) : (
                    <CommandGroup className="p-2">
                      {profiles
                        .filter((profile) =>
                          profile.id.includes(searchInput) && profile.id !== props.loginProfile?.id
                        )
                        .map((profile) => (
                          <CommandItem
                            key={profile.id}
                            onSelect={() => {
                              if (selectedProfiles.includes(profile)) {
                                setSelectedProfiles(selectedProfiles.filter((p) => p.id !== profile.id))
                              } else {
                                setSelectedProfiles([...selectedProfiles, profile])
                              }
                            }}
                          >
                            <Avatar>
                              <AvatarImage src={profile.avatar_url} alt="Image" />
                              <AvatarFallback>{profile.nickname[0]}</AvatarFallback>
                            </Avatar>
                            <div className="ml-2">
                              <p className="text-sm font-medium leading-none">
                                {profile.nickname}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {profile.id}
                              </p>
                            </div>
                            {selectedProfiles.includes(profile) ? (
                              <Check className="ml-auto flex h-5 w-5 text-primary" />
                            ) : null}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  )}
                </>
              )}
            </CommandList>
          </Command>
          <DialogFooter className="flex items-center border-t p-4 sm:justify-between">
            {selectedProfiles.length > 0 ? (
              <div className="flex -space-x-2 overflow-hidden">
                {selectedProfiles.map((profile) => (
                  <Avatar
                    key={profile.id}
                    className="inline-block border-2 border-background"
                  >
                    <AvatarImage />
                    <AvatarFallback>{profile.nickname[0]}</AvatarFallback>
                  </Avatar>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select users to add to this thread.
              </p>
            )}
            <Button
              onClick={() => {
                props.onAdd(selectedProfiles)
                props.onDialogOpenChange(false)
              }}
            >
              추가 ({selectedProfiles.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  )
} 