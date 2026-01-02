
import { RoomServiceClient } from "livekit-server-sdk";

const client = new RoomServiceClient("http://test", "key", "secret");
console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(client)));
