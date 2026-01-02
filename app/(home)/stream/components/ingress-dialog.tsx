"use client";

import { CreateIngressResponse } from "../lib/controller";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/components/auth/use-auth-store";
import { AllowParticipationInfo } from "./allow-participation-info";
import { Spinner } from "./spinner";

export function IngressDialog({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [name, setName] = useState(user?.user_metadata?.username || "");
  const [type, setType] = useState("rtmp");
  const [enableChat, setEnableChat] = useState(true);
  const [allowParticipation, setAllowParticipation] = useState(true);
  const [ingressResponse, setIngressResponse] =
    useState<CreateIngressResponse>();

  // Update name if user loads after mount
  useEffect(() => {
    if (user?.user_metadata?.username) {
      setName(user.user_metadata.username);
    }
  }, [user]);

  const onCreateIngress = async () => {
    setLoading(true);

    const res = await fetch("/api/stream/create_ingress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        room_name: roomName,
        ingress_type: type,
        name: name,
        metadata: {
          creator_identity: user?.id || name,
          enable_chat: enableChat,
          allow_participation: allowParticipation,
        },
      }),
    });

    setIngressResponse(await res.json());
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-[450px]">
        {ingressResponse ? (
          <>
            <DialogTitle>Start streaming now</DialogTitle>
            <div className="flex flex-col gap-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Copy these values into your OBS settings under{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">Stream</code> → <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">Service</code> →{" "}
                <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">{type === "whip" ? "WHIP" : "Custom"}</code>. When
                you&rsquo;re ready, press &quot;Start Streaming&quot; and watch
                the bits flow!
              </p>
              <div className="space-y-2">
                <Label>
                  Server URL
                </Label>
                <Input
                  type="text"
                  value={ingressResponse.ingress.url}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Stream key
                </Label>
                <Input
                  type="text"
                  value={ingressResponse.ingress.streamKey}
                  readOnly
                />
              </div>
              <DialogFooter>
                <Button
                  onClick={() =>
                    router.push(
                      `/watch?at=${ingressResponse.auth_token}&rt=${ingressResponse.connection_details.token}`
                    )
                  }
                >
                  Join as viewer <ArrowRight className="ml-2 h-4 w-4 animate-wiggle" />
                </Button>
              </DialogFooter>
            </div>
          </>
        ) : (
          <>
            <DialogTitle>Setup ingress endpoint</DialogTitle>
            <div className="flex flex-col gap-4 mt-4">
              <div className="space-y-2">
                <Label>
                  Room name
                </Label>
                <Input
                  type="text"
                  placeholder="abcd-1234"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Your name
                </Label>
                <Input
                  type="text"
                  placeholder="Roger Dunn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Ingress type
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rtmp">RTMP</SelectItem>
                    <SelectItem value="whip">WHIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label>
                    Enable chat
                  </Label>
                  <Switch
                    checked={enableChat}
                    onCheckedChange={setEnableChat}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label>
                      Viewers can participate
                    </Label>
                    <AllowParticipationInfo />
                  </div>
                  <Switch
                    checked={allowParticipation}
                    onCheckedChange={setAllowParticipation}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setRoomName("");
                    setName("");
                    setType("rtmp");
                    setEnableChat(true);
                    setAllowParticipation(true);
                  }}
                >
                  Cancel
                </Button>
              </DialogClose>
              <Button
                disabled={!(roomName && name && type) || loading}
                onClick={onCreateIngress}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Spinner />
                    <span>Creating...</span>
                  </div>
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
