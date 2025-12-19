import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { Mic, MicOff, PhoneOff, Video, VideoOff } from "lucide-react";
import { toast } from "react-toastify";

interface CallInterfaceProps {
    socket: any;
    user: any; // Me
    targetUser: any; // The other person (for outgoing) or Caller
    isInitiator: boolean;
    incomingSignal?: any;
    onClose: (missed?: boolean) => void;
}

const CallInterface: React.FC<CallInterfaceProps> = ({ socket, user, targetUser, isInitiator, incomingSignal, onClose }) => {
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [micOn, setMicOn] = useState(true);
    const [videoOn, setVideoOn] = useState(true);

    const myVideo = useRef<HTMLVideoElement>(null);
    const userVideo = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<Peer.Instance | null>(null);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((currentStream) => {
                setStream(currentStream);
                if (myVideo.current) {
                    myVideo.current.srcObject = currentStream;
                }

                if (isInitiator) {
                    const peer = new Peer({
                        initiator: true,
                        trickle: false,
                        stream: currentStream,
                    });

                    peer.on("signal", (data) => {
                        socket.emit("callUser", {
                            userToCall: targetUser._id,
                            signalData: data,
                            from: user._id,
                            name: user.name,
                        });
                    });

                    peer.on("stream", (remoteStream) => {
                        if (userVideo.current) {
                            userVideo.current.srcObject = remoteStream;
                        }
                    });

                    socket.on("callAccepted", (signal: any) => {
                        setCallAccepted(true);
                        peer.signal(signal);
                    });

                    connectionRef.current = peer;

                } else {
                    // Incoming call
                    const peer = new Peer({
                        initiator: false,
                        trickle: false,
                        stream: currentStream,
                    });

                    peer.on("signal", (data) => {
                        socket.emit("answerCall", { signal: data, to: targetUser._id });
                    });

                    peer.on("stream", (remoteStream) => {
                        if (userVideo.current) {
                            userVideo.current.srcObject = remoteStream;
                        }
                    });

                    peer.signal(incomingSignal);
                    connectionRef.current = peer;
                    setCallAccepted(true); // Automatically accept if we opened this interface? Or wait for button?
                    // For simplicity, if we opened this component for incoming, we are answering.
                }

            })
            .catch((err) => {
                console.error("Failed to get local stream", err);
                toast.error("Could not access camera/microphone");
                onClose();
            });

        return () => {
            // Cleanup
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (connectionRef.current) {
                connectionRef.current.destroy();
            }
            // Remove socket listeners?
            socket.off("callAccepted");
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const leaveCall = async () => {
        const missed = isInitiator && !callAccepted;
        setCallEnded(true);
        if (connectionRef.current) {
            connectionRef.current.destroy();
        }
        onClose(missed);
    };

    const toggleMic = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            audioTrack.enabled = !audioTrack.enabled;
            setMicOn(audioTrack.enabled);
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            videoTrack.enabled = !videoTrack.enabled;
            setVideoOn(videoTrack.enabled);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-gray-900/95 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-4xl flex-1 flex items-center justify-center gap-4 flex-wrap">
                {/* My Video */}
                <div className="relative w-full md:w-1/2 aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                    <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">You</div>
                </div>

                {/* User Video */}
                {callAccepted && !callEnded ? (
                    <div className="relative w-full md:w-1/2 aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
                        <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 left-2 text-white text-sm bg-black/50 px-2 py-1 rounded">{targetUser.name}</div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-white p-10 animate-pulse">
                        <div className="text-2xl mb-4">{isInitiator ? "Calling..." : "Connecting..."}</div>
                        <div className="text-gray-400">Waiting for {targetUser.name}</div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="mt-8 flex items-center gap-6">
                <button onClick={toggleMic} className={`p-4 rounded-full ${micOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'} text-white transition-all`}>
                    {micOn ? <Mic size={24} /> : <MicOff size={24} />}
                </button>
                <button onClick={leaveCall} className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all transform hover:scale-110 shadow-lg">
                    <PhoneOff size={32} />
                </button>
                <button onClick={toggleVideo} className={`p-4 rounded-full ${videoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'} text-white transition-all`}>
                    {videoOn ? <Video size={24} /> : <VideoOff size={24} />}
                </button>
            </div>
        </div>
    );
};

export default CallInterface;
