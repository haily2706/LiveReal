import jwt from "jsonwebtoken";
import {
  AccessToken,
  CreateIngressOptions,
  IngressAudioEncodingPreset,
  IngressClient,
  IngressInfo,
  IngressInput,
  IngressVideoEncodingPreset,
  ParticipantInfo,
  ParticipantPermission,
  RoomServiceClient,
  TrackSource,
} from "livekit-server-sdk";


export type RoomMetadata = {
  creator_identity: string;
  enable_chat: boolean;
  allow_participation: boolean;
};

export type ParticipantMetadata = {
  hand_raised: boolean;
  invited_to_stage: boolean;
  avatar_image: string;
};

export type Config = {
  ws_url: string;
  api_key: string;
  api_secret: string;
};

export type Session = {
  identity: string;
  room_name: string;
};

export type ConnectionDetails = {
  token: string;
  ws_url: string;
};

export type CreateIngressParams = {
  room_name?: string;
  ingress_type: string;
  metadata: RoomMetadata;
  name?: string;
};

export type CreateIngressResponse = {
  ingress: IngressInfo;
  auth_token: string;
  connection_details: ConnectionDetails;
};

export type CreateStreamParams = {
  room_name?: string;
  metadata: RoomMetadata;
  name?: string;
};

export type CreateStreamResponse = {
  auth_token: string;
  connection_details: ConnectionDetails;
};

export type JoinStreamParams = {
  room_name: string;
  identity: string;
  name?: string;
};

export type JoinStreamResponse = {
  auth_token: string;
  connection_details: ConnectionDetails;
};

export type InviteToStageParams = {
  identity: string;
};

export type RemoveFromStageParams = {
  identity?: string;
};

export type ErrorResponse = {
  error: string;
};

export function getSessionFromReq(req: Request): Session {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.split(" ")[1];
  if (!token) {
    throw new Error("No authorization header found");
  }
  const verified = jwt.verify(token, process.env.LIVEKIT_API_SECRET!);
  if (!verified) {
    throw new Error("Invalid token");
  }
  const decoded = jwt.decode(token) as Session;
  return decoded;
}

export class Controller {
  private ingressService: IngressClient;
  private roomService: RoomServiceClient;

  constructor() {
    const httpUrl = process.env
      .LIVEKIT_WS_URL!.replace("wss://", "https://")
      .replace("ws://", "http://");
    this.ingressService = new IngressClient(httpUrl);
    this.roomService = new RoomServiceClient(
      httpUrl,
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!
    );
  }

  async createIngress({
    metadata,
    room_name,
    ingress_type = "rtmp",
    name,
  }: CreateIngressParams): Promise<CreateIngressResponse> {
    if (!room_name) {
      room_name = generateRoomId();
    }

    // Create room and ingress

    const rooms = await this.roomService.listRooms([room_name]);
    if (rooms.length > 0) {
      await this.roomService.updateRoomMetadata(room_name, JSON.stringify(metadata));
    } else {
      await this.roomService.createRoom({
        name: room_name,
        metadata: JSON.stringify(metadata),
      });
    }

    const options: CreateIngressOptions = {
      name: room_name,
      roomName: room_name,
      participantName: (name || metadata.creator_identity) + " (via OBS)",
      participantIdentity: metadata.creator_identity + " (via OBS)",
    };

    if (ingress_type === "whip") {
      // https://docs.livekit.io/egress-ingress/ingress/overview/#bypass-transcoding-for-whip-sessions
      options.bypassTranscoding = true;
    } else {
      options.video = {
        source: TrackSource.CAMERA,
        preset: IngressVideoEncodingPreset.H264_1080P_30FPS_3_LAYERS,
      };
      options.audio = {
        source: TrackSource.MICROPHONE,
        preset: IngressAudioEncodingPreset.OPUS_STEREO_96KBPS,
      };
    }

    const ingress = await this.ingressService.createIngress(
      ingress_type === "whip"
        ? IngressInput.WHIP_INPUT
        : IngressInput.RTMP_INPUT,
      options
    );

    // Create viewer access token

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity: metadata.creator_identity,
        name: name || metadata.creator_identity,
      }
    );

    at.addGrant({
      room: room_name,
      roomJoin: true,
      canPublish: false,
      canSubscribe: true,
      canPublishData: true,
    });

    const authToken = this.createAuthToken(
      room_name,
      metadata.creator_identity
    );

    return {
      ingress,
      auth_token: authToken,
      connection_details: {
        ws_url: process.env.LIVEKIT_WS_URL!,
        token: await at.toJwt(),
      },
    };
  }

  async createStream({
    metadata,
    room_name: roomName,
    name,
  }: CreateStreamParams): Promise<CreateStreamResponse> {
    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity: metadata.creator_identity,
        name: name || metadata.creator_identity,
      }
    );

    if (!roomName) {
      roomName = generateRoomId();
    }
    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    // TODO turn off auto creation in the dashboard
    const rooms = await this.roomService.listRooms([roomName]);
    if (rooms.length > 0) {
      await this.roomService.updateRoomMetadata(roomName, JSON.stringify(metadata));
    } else {
      await this.roomService.createRoom({
        name: roomName,
        metadata: JSON.stringify(metadata),
      });
    }

    const connection_details = {
      ws_url: process.env.LIVEKIT_WS_URL!,
      token: await at.toJwt(),
    };

    const authToken = this.createAuthToken(roomName, metadata.creator_identity);

    return {
      auth_token: authToken,
      connection_details,
    };
  }

  async stopStream(session: Session) {
    const rooms = await this.roomService.listRooms([session.room_name]);

    if (rooms.length === 0) {
      throw new Error("Room does not exist");
    }

    const room = rooms[0];
    let creator_identity = "";
    try {
      if (room.metadata) {
        creator_identity = (JSON.parse(room.metadata) as RoomMetadata).creator_identity;
      }
    } catch (e) {
      console.warn("Failed to parse room metadata", e);
    }

    if (creator_identity !== session.identity) {
      throw new Error("Only the creator can invite to stage");
    }

    await this.roomService.deleteRoom(session.room_name);
  }

  async joinStream({
    identity,
    room_name,
    name,
  }: JoinStreamParams): Promise<JoinStreamResponse> {
    // Check for existing participant with same identity
    let exists = false;
    try {
      await this.roomService.getParticipant(room_name, identity);
      exists = true;
    } catch { }

    if (exists) {
      throw new Error("Participant already exists");
    }

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY!,
      process.env.LIVEKIT_API_SECRET!,
      {
        identity,
        name: name || identity,
      }
    );

    at.addGrant({
      room: room_name,
      roomJoin: true,
      canPublish: false,
      canSubscribe: true,
      canPublishData: true,
    });

    const authToken = this.createAuthToken(room_name, identity);

    return {
      auth_token: authToken,
      connection_details: {
        ws_url: process.env.LIVEKIT_WS_URL!,
        token: await at.toJwt(),
      },
    };
  }

  async inviteToStage(session: Session, { identity }: InviteToStageParams) {
    const rooms = await this.roomService.listRooms([session.room_name]);

    if (rooms.length === 0) {
      throw new Error("Room does not exist");
    }

    const room = rooms[0];
    let creator_identity = "";
    try {
      if (room.metadata) {
        creator_identity = (JSON.parse(room.metadata) as RoomMetadata).creator_identity;
      }
    } catch (e) {
      console.warn("Failed to parse room metadata", e);
    }

    if (creator_identity !== session.identity) {
      throw new Error("Only the creator can invite to stage");
    }

    const participant = await this.roomService.getParticipant(
      session.room_name,
      identity
    );
    const permission = participant.permission || ({} as ParticipantPermission);

    const metadata = this.getOrCreateParticipantMetadata(participant);
    metadata.invited_to_stage = true;

    // If hand is raised and invited to stage, then we let the put them on stage
    if (metadata.hand_raised) {
      permission.canPublish = true;
    }

    await this.roomService.updateParticipant(
      session.room_name,
      identity,
      JSON.stringify(metadata),
      permission
    );
  }

  async removeFromStage(session: Session, { identity }: RemoveFromStageParams) {
    if (!identity) {
      // remove self if no identity specified
      identity = session.identity;
    }

    const rooms = await this.roomService.listRooms([session.room_name]);

    if (rooms.length === 0) {
      throw new Error("Room does not exist");
    }

    const room = rooms[0];
    let creator_identity = "";
    try {
      if (room.metadata) {
        creator_identity = (JSON.parse(room.metadata) as RoomMetadata).creator_identity;
      }
    } catch (e) {
      console.warn("Failed to parse room metadata", e);
    }

    if (
      creator_identity !== session.identity &&
      identity !== session.identity
    ) {
      throw new Error(
        "Only the creator or the participant him self can remove from stage"
      );
    }

    const participant = await this.roomService.getParticipant(
      session.room_name,
      session.identity
    );

    const permission = participant.permission || ({} as ParticipantPermission);
    const metadata = this.getOrCreateParticipantMetadata(participant);

    // Reset everything and disallow them from publishing (this will un-publish them automatically)
    metadata.hand_raised = false;
    metadata.invited_to_stage = false;
    permission.canPublish = false;

    await this.roomService.updateParticipant(
      session.room_name,
      identity,
      JSON.stringify(metadata),
      permission
    );
  }

  async raiseHand(session: Session) {
    const participant = await this.roomService.getParticipant(
      session.room_name,
      session.identity
    );

    const permission = participant.permission || ({} as ParticipantPermission);
    const metadata = this.getOrCreateParticipantMetadata(participant);
    metadata.hand_raised = true;

    // If hand is raised and invited to stage, then we let the put them on stage
    if (metadata.invited_to_stage) {
      permission.canPublish = true;
    }

    await this.roomService.updateParticipant(
      session.room_name,
      session.identity,
      JSON.stringify(metadata),
      permission
    );
  }

  getOrCreateParticipantMetadata(
    participant: ParticipantInfo
  ): ParticipantMetadata {
    if (participant.metadata) {
      try {
        return JSON.parse(participant.metadata) as ParticipantMetadata;
      } catch {
        // If metadata is invalid, ignore it and return default
      }
    }
    return {
      hand_raised: false,
      invited_to_stage: false,
      avatar_image: `https://api.multiavatar.com/${participant.identity}.png`,
    };
  }
  createAuthToken(room_name: string, identity: string) {
    return jwt.sign(
      { room_name, identity },
      process.env.LIVEKIT_API_SECRET!
    );
  }
}

function generateRoomId(): string {
  return `${randomString(4)}-${randomString(4)}`;
}

function randomString(length: number): string {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
